// Import the required modules
const Joi = require("joi");

// Local imports
const { product_categories } = require("../schemas/Products");

// Exporting Register Schema
const ProductValidSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required(),
  description: Joi.string().required(),
  category: Joi.string()
    .required()
    .valid(...product_categories),
  purchase_datetime: Joi.date().required().messages({
    "any.required": "You must provide a purchased date",
  }),
  related_questions: Joi.array().items(Joi.string()),
}).options({ allowUnknown: true });

const ValidateProduct = (req, res, next) => {
  let files = [];

  // If req.files is not empty, take the files and store it in an array
  if (req.files.length > 0) files = req.files.map((file) => file.buffer);

  let newBody = { ...req.body, files: files };

  if (req.body.type === "BUY_SELL") newBody.related_questions = [];

  const result = ProductValidSchema.validate(req.body);

  if (result.error)
    return res.status(400).send(result.error.details[0].message);

  req.body = newBody;

  next();
};

// Exports
exports.ValidateProduct = ValidateProduct;
