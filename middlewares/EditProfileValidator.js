// Import the required modules
const Joi = require("joi");

// Local Imports
const { Batch, Hostels, Years } = require("../schemas/Users");

// Exporting EditProfile Schema
const EditProfileSchema = Joi.object({
  name: Joi.string().required("Name is required"),
  email: Joi.string().email().required("Email is required"),
  year: Joi.string()
    .required("Year is required")
    .valid(...Years)
    .messages({
      "any.only": "Year must be valid",
    }),
  batch: Joi.string()
    .required("Batch is required")
    .valid(...Batch)
    .messages({
      "any.only": "Batch must be valid",
    }),
  hostel: Joi.string()
    .required("Hostel is required")
    .valid(...Hostels)
    .messages({
      "any.only": "Hostel must be valid",
    }),
  phone: Joi.string().required("Phone is required").length(10).messages({
    "string.length": "Phone must be valid 10 digit number",
  }),
}).options({ allowUnknown: true });

const ValidateEditProfile = (req, res, next) => {
  let newBody = {
    ...req.body,
    ...(req.file?.buffer && {
      profile_picture: req.file.buffer,
    }),
  };

  const result = EditProfileSchema.validate(req.body);

  if (result.error)
    return res.status(400).send({ message: result.error.details[0].message });

  req.body = newBody;

  next();
};

// Exports
exports.ValidateEditProfile = ValidateEditProfile;
exports.EditProfileSchema = EditProfileSchema;
