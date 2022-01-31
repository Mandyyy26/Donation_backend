const ValidateLostFound = (req, res, next) => {
  let files = [];

  // If req.files is not empty, take the files and store it in an array
  if (req.files?.length > 0) files = req.files.map((file) => file.buffer);

  let newBody = { ...req.body, files: files };

  req.body = newBody;

  next();
};

// Exports
exports.ValidateLostFound = ValidateLostFound;
