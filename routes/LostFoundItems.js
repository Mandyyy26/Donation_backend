// package and other modules
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");

// Local imports
const { AdminAuth, UserAuth } = require("../middlewares/AuthValidator");
const {
  DeleteAFolder,
  UploadMultipleToCloudinary,
} = require("../utils/Cloudinary");
const messages = require("../config/messages");
const { lostFoundItems } = require("../models/LostFoundItem");
const { raisedHands } = require("../models/RaisedHands");
const { ValidateLostFound } = require("../middlewares/LostFoundValidator");

// Initialize router
const router = express.Router();

// Multer configuration
const upload = multer({ storage: multer.memoryStorage() });

// Get List of all lost-found items in Database for Admin only
router.get("/", AdminAuth, async (req, res) => {
  try {
    const lostFoundItemsList = await lostFoundItems.find();

    return res.status(200).send({
      products: lostFoundItemsList,
      message: "This list shows all the Lost-Found Items in Database",
    });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// Get lost-found feed in batches of 10, according to the time they were posted
router.get("/get-lost-found-feed", UserAuth, async (req, res) => {
  try {
    // Get the products in batches of 10 after this _id
    let after = req.query?.after
      ? mongoose.Types.ObjectId(req.query.after)
      : null;

    // Create a filter if last_post_id is present
    let after_this_id_filter = after ? { _id: { $lt: after } } : {};

    const lost_found_list = await lostFoundItems.aggregate([
      {
        // Match the products with the filter
        $match: {
          ...after_this_id_filter,
          found_by_someone: false,
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
    return res.send({
      products: lost_found_list,
      message: "Feed for LOST_FOUND",
    });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// Get Lost Found Product details
router.get("/get-lost-found-product-details", UserAuth, async (req, res) => {
  try {
    // check if product_id is present in query
    if (!req.query.product_id)
      return res.status(400).send({ message: messages.product_id_required });

    // constants
    const product_id = req.query.product_id;
    const user_id = req.body.user_details._id;

    // Check if product exists
    const product = await lostFoundItems.findById(product_id);
    if (!product)
      return res.status(404).send({ message: messages.product_not_found });

    let product_details = product.toObject();
    product_details.raised_hands = false;

    // Check if the user has raised the hand
    const raised_hand = await raisedHands.findOne({
      product_id: product_id,
      raised_by: user_id,
    });
    if (raised_hand) product_details.raised_hands = true;

    // Send the product details
    return res.send({
      Product: product_details,
      message: "Details of Product",
    });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// Create new Product Endpoint
router.post(
  "/create-new-lost-found-product",
  upload.array("files", 5),
  UserAuth,
  ValidateLostFound,
  async (req, res) => {
    try {
      // Create new product instance
      const newProduct = new lostFoundItems(req.body);

      // assign posted_by to user_details _id
      newProduct.posted_by = req.body.user_details._id;

      // If there are files, upload them to Cloudinary
      if (req.body.files.length > 0) {
        let files = [];
        // Destination for the files
        const destination = `Kolegia/users/${newProduct.posted_by}/lost-found/${newProduct._id}`;

        // Upload multiple files to Cloudinary
        const uploadResponse = await UploadMultipleToCloudinary(
          req.body.files,
          destination
        );

        // take every object's secure_url and assign it to the newProduct.files array
        uploadResponse.forEach((file) => {
          if (file.secure_url) files.push(file.secure_url);
        });

        // Assign the files array to the newProduct.files
        newProduct.files = files;
      }

      // Saving the new product to the database
      await newProduct.save();

      // Return the new product
      return res.send({
        product: newProduct,
        message: "New lost-found Product Created",
      });
    } catch (error) {
      return res.status(500).send({ message: messages.serverError });
    }
  }
);

// Edit Product Endpoint
router.put(
  "/edit-lost-found-product",
  upload.array("files", 5),
  UserAuth,
  ValidateLostFound,
  async (req, res) => {
    try {
      // check if product_id is present in body
      if (!req.body.product_id)
        return res.status(400).send({ message: messages.product_id_required });

      // Check if product exists
      const product = await lostFoundItems.findById(req.body.product_id);
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

      // If files array is not empty, upload them to Cloudinary and push it to the product.files array
      if (req.body.files.length > 0) {
        let files = [...product.files];
        // Destination for the files
        const destination = `Kolegia/users/${product.posted_by}/lost-found/${product._id}`;

        // Upload multiple files to Cloudinary
        const uploadResponse = await UploadMultipleToCloudinary(
          req.body.files,
          destination
        );

        // take every object's secure_url and assign it to the newProduct.files array
        uploadResponse.forEach((file) => {
          if (file.secure_url) files.push(file.secure_url);
        });

        // Assign the files array to the newProduct.files
        product.files = files;
      }

      return res.send({ product: product, message: "Product Updated" });
    } catch (error) {
      return res.status(500).send({ message: messages.serverError });
    }
  }
);

// Delete Product Endpoint
router.delete("/delete-lost-found-product", UserAuth, async (req, res) => {
  try {
    // Check if product_id is present in body
    if (!req.body.product_id)
      return res.status(400).send({ message: messages.product_id_required });

    // check if Product exists
    const product = await lostFoundItems.findById(req.body.product_id);
    if (!product)
      return res.status(404).send({ message: messages.product_not_found });

    // check if user is the product's owner
    if (product.posted_by.toString() !== req.body.user_details._id.toString())
      return res.status(401).send({ message: messages.unauthorized });

    // Delete folder from cloudinary
    DeleteAFolder(
      `Kolegia/users/${product.posted_by}/lost-found/${product._id}`
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
router.get("/get-own-lost-found-list", UserAuth, async (req, res) => {
  try {
    // Get user's id
    const user_id = req.body.user_details._id;

    // Get all products which has posted_by equal to user_id
    const user_products = await lostFoundItems.find({
      posted_by: user_id,
    });

    // Return the products list
    return res.send({ Products: user_products });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// Mark a product as found
router.put("/mark-as-found", UserAuth, async (req, res) => {
  try {
    // check if product _id is present in the body
    if (!req.body.product_id)
      return res.status(400).send({ message: messages.product_id_required });

    // check if product exists
    const product = await lostFoundItems.findById(req.body.product_id);
    if (!product)
      return res.status(404).send({ message: messages.product_not_found });

    // check if user is the product's owner
    if (product.posted_by.toString() !== req.body.user_details._id.toString())
      return res.status(401).send({ message: messages.unauthorized });

    // check if product is already marked as found
    if (product.found_by_someone)
      return res.status(200).send({ message: messages.prod_marked_already });

    // Mark product as found
    product.found_by_someone = true;
    await product.save();

    return res.send({ message: messages.prod_marked_as_found });
  } catch (error) {
    return res.status(500).send({ message: messages.serverError });
  }
});

// export router
module.exports = router;