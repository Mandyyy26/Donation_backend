// Packages imports
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Upload a file to Cloudinary
let UploadToCloudinary = (buffer, folderName) => {
  return new Promise((resolve, reject) => {
    let cld_upload_stream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        resource_type: "auto",
      },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(cld_upload_stream);
  });
};

// function to upload multiple files to cloudinary
let UploadMultipleToCloudinary = async (files, folderName) => {
  let promises = [];

  files.forEach((file) => {
    promises.push(UploadToCloudinary(file, folderName));
  });

  return Promise.all(promises);
};

// Delete a folder from Cloudinary
let DeleteAFolder = (folderName) => {
  cloudinary.api.delete_resources_by_prefix(folderName, function (result) {
    return result;
  });
};

// Exports
exports.UploadToCloudinary = UploadToCloudinary;
exports.DeleteAFolder = DeleteAFolder;
exports.cloudinary = cloudinary;
exports.UploadMultipleToCloudinary = UploadMultipleToCloudinary;
