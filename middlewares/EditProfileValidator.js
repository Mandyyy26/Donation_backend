// Import the required modules
const Joi = require("joi");

// Local Imports
const { Hostels } = require("../schemas/Users");

// Exporting EditProfile Schema
const EditProfileSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  hostel: Joi.string()
    .valid(...Hostels)
    .messages({
      "any.only": "Hostel must be valid",
    }),
  phone: Joi.string().length(10).messages({
    "string.length": "Phone must be valid 10 digit number",
  }),
  room_number: Joi.string(),
  user_details: Joi.optional(),
  profile_picture: Joi.optional(),
}).options({ allowUnknown: false });

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
