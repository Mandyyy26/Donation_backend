// Import the required modules
const Joi = require("joi");

// Local imports
const { product_categories } = require("../schemas/BuySellItem");

// Exporting Register Schema
const BuySellValidSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required(),
  description: Joi.string().required(),
  category: Joi.string().valid(...product_categories),
  stock_count: Joi.number(),
}).options({ allowUnknown: true });

const ValidateBuySell = (req, res, next) => {
  let files = [];

  // If there are no files, send the error

  const isNewProduct = req.route.path === "/create-new-buysell-product";

  if (isNewProduct && req.files.length === 0)
    return res
      .status(400)
      .send({ message: "Atleast one product image is required." });

  // If req.files is not empty, take the files and store it in an array
  if (req.files.length > 0) files = req.files.map((file) => file.buffer);

  let newBody = { ...req.body, files: files };

  const result = BuySellValidSchema.validate(req.body);

  if (result.error)
    return res.status(400).send({ message: result.error.details[0].message });

  req.body = newBody;

  next();
};

// Exports
exports.ValidateBuySell = ValidateBuySell;
