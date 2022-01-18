// package and other modules
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");

// Local imports
const { AdminAuth, UserAuth } = require("../middlewares/AuthValidator");
const { buySellItems } = require("../models/BuySellItem");
const { DeleteMultipleFiles, DeleteAFolder } = require("../utils/Cloudinary");
const messages = require("../config/messages");
const { UploadFilesForPayload } = require("../controllers/BuySell");
const { ValidateBuySell } = require("../middlewares/BuySellValidator");

// Initialize router
const router = express.Router();

// Multer configuration
const upload = multer({ storage: multer.memoryStorage() });

// Get List of all buy-sell items in Database for Admin only
router.get("/", AdminAuth, async (req, res) => {
  try {
    const buySellItemsList = await buySellItems.find();

    return res.status(200).send({
      products: buySellItemsList,
      message: "This list shows all the Buy-Sell Items in Database",
    });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// Get buy-sell feed in batches of 10, according to the time they were posted
router.get("/get-buy-sell-feed", UserAuth, async (req, res) => {
  try {
    // Get the products in batches of 10 after this _id
    let after = req.query?.after
      ? mongoose.Types.ObjectId(req.query.after)
      : null;

    // Create a filter if last_post_id is present
    let after_this_id_filter = after ? { _id: { $lt: after } } : {};

    const buy_sell_list = await buySellItems.aggregate([
      {
        // Match the products with the filter
        $match: {
          ...after_this_id_filter,
        },
      },
      // sort them in descending order of _id
      {
        $sort: {
          _id: -1,
        },
      },
      // limit to 10
      {
        $limit: 10,
      },
      // Remove unneccecary fields
      {
        $project: {
          __v: 0,
        },
      },
    ]);

    // return the list
    return res.send({ products: buy_sell_list, message: "Feed for BUY_SELL" });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// Get Product details
router.get("/get-buysell-product-details", UserAuth, async (req, res) => {
  try {
    // check if product_id is present in query
    if (!req.query.product_id)
      return res.status(400).send({ message: messages.product_id_required });

    // constants
    const product_id = req.query.product_id;

    // Check if product exists
    const product = await buySellItems.findById(product_id);
    if (!product)
      return res.status(404).send({ message: messages.product_not_found });

    let product_details = product.toObject();
    product_details.raised_hands = false;

    // Send the product details
    return res.send(product_details);
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// Create new Product Endpoint
router.post(
  "/create-new-buysell-product",
  upload.array("files", 5),
  UserAuth,
  ValidateBuySell,
  async (req, res) => {
    try {
      // Create new product instance
      const newProduct = new buySellItems(req.body);

      // assign posted_by to user_details _id
      newProduct.posted_by = req.body.user_details._id;

      // If there are files, upload them to Cloudinary
      if (req.body.files.length > 0) {
        // Destination for the files
        const destination = `Kolegia/users/${newProduct.posted_by}/buy-sell/${newProduct._id}`;

        // Upload multiple files to Cloudinary
        const uploaded_files = await UploadFilesForPayload(
          req.body.files,
          destination
        );

        // Assign the files array to the newProduct.files
        newProduct.files = uploaded_files;
      }

      // Saving the new product to the database
      await newProduct.save();

      // Return the new product
      return res.send({
        product: newProduct,
        message: "New Buy-Sell Product Created",
      });
    } catch (error) {
      return res.status(500).send({ message: messages.serverError });
    }
  }
);

// Edit Product Endpoint
router.put(
  "/edit-buy-sell-product",
  upload.array("files", 5),
  UserAuth,
  ValidateBuySell,
  async (req, res) => {
    try {
      // check if product_id is present in body
      if (!req.body.product_id)
        return res.status(400).send({ message: messages.product_id_required });

      // Check if product exists
      const product = await buySellItems.findById(req.body.product_id);
      if (!product)
        return res.status(404).send({ message: messages.product_not_found });

      // Check if user is the product's owner
      if (product.posted_by.toString() !== req.body.user_details._id.toString())
        return res.status(401).send({ message: messages.unauthorized });

      // Update product
      // map through the body and assign the new values to the product
      Object.keys(req.body).map((key) => {
        if (key !== "files") product[key] = req.body[key];
      });

      // Check if after uploading and deleting there are any file left or not
      let currentFiles = product.files.length;
      let toUpload = req.body.files?.length ?? 0;
      let toDelete = req.body.to_be_deleted?.length ?? 0;

      if (currentFiles + toUpload - toDelete < 1)
        return res.status(400).send({ message: messages.filerequired });

      // If files array is not empty, upload them to Cloudinary and push it to the product.files array
      if (toUpload > 0) {
        // Destination for the files
        const destination = `Kolegia/users/${product.posted_by}/buy-sell/${product._id}`;

        // Upload multiple files to Cloudinary
        const uploaded_files = await UploadFilesForPayload(
          req.body.files,
          destination
        );

        // Assign the files array to the newProduct.files
        product.files = [...product.files, ...uploaded_files];
      }

      // If there are files that need to be deleted, delete them from Cloudinary
      if (toDelete > 0) {
        // Delete the files from Cloudinary
        await DeleteMultipleFiles(req.body.to_be_deleted);

        // Remove the files from the product.files array whose _id is in the req.body.to_be_deleted array
        product.files = product.files.filter(
          (file) => !req.body.to_be_deleted.includes(file.public_id)
        );
      }

      await product.save();

      return res.send({ product: product, message: "Product Updated" });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: messages.serverError });
    }
  }
);

// Delete Product Endpoint
router.delete("/delete-buy-sell-product", UserAuth, async (req, res) => {
  try {
    // Check if product_id is present in body
    if (!req.body.product_id)
      return res.status(400).send({ message: messages.product_id_required });

    // check if Product exists
    const product = await buySellItems.findById(req.body.product_id);
    if (!product)
      return res.status(404).send({ message: messages.product_not_found });

    // check if user is the product's owner
    if (product.posted_by.toString() !== req.body.user_details._id.toString())
      return res.status(401).send({ message: messages.unauthorized });

    // Delete folder from cloudinary
    await DeleteAFolder(
      `Kolegia/users/${product.posted_by}/buy-sell/${product._id}`
    );

    // Delete product
    await product.delete();

    // return response
    return res.send({ message: messages.product_deleted });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// Get my lost item posts
router.get("/get-own-buy-sell-list", UserAuth, async (req, res) => {
  try {
    // Get user's id
    const user_id = req.body.user_details._id;

    // Get all products which has posted_by equal to user_id
    const user_products = await buySellItems.find({
      posted_by: user_id,
    });

    // Return the products list
    return res.send({
      Products: user_products,
      message: "List of items posted by user for selling.",
    });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// export router
module.exports = router;
