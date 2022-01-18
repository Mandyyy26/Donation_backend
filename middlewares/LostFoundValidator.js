// Import the required modules
const Joi = require("joi");

// Exporting Register Schema
const LostFoundValidSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string(),
  files: Joi.array(),
  related_questions: Joi.array(),
  user_details: Joi.object(),
  to_be_deleted: Joi.array(),
  product_id: Joi.string(),
}).options({ allowUnknown: false });

const ValidateLostFound = (req, res, next) => {
  let files = [];

  const isNewProduct = req.route.path === "/create-new-lost-found-product";

  // If there are no files, send the error
  if (isNewProduct && req.files?.length === 0)
    return res
      .status(400)
      .send({ message: "Atleast one product image is required." });

  // If req.files is not empty, take the files and store it in an array
  if (req.files?.length > 0) files = req.files.map((file) => file.buffer);

  let newBody = { ...req.body, files: files };

  const result = LostFoundValidSchema.validate(req.body);

  if (result.error)
    return res.status(400).send({ message: result.error.details[0].message });

  req.body = newBody;

  next();
};

// Exports
exports.ValidateLostFound = ValidateLostFound;
