// Validate Buy Sell Body and arrange buffer files
const ValidateBuySell = (req, res, next) => {
  let files = [];

  // If there are no files, send the error
  const isNewProduct = req.route.path === "/create-new-buysell-product";

  if (isNewProduct && req.files?.length === 0)
    return res
      .status(400)
      .send({ message: "Atleast one product image is required." });

  // If req.files is not empty, take the files and store it in an array
  if (req.files?.length > 0) files = req.files.map((file) => file.buffer);

  let newBody = { ...req.body, files: files };

  req.body = newBody;

  next();
};

// Exports
exports.ValidateBuySell = ValidateBuySell;
