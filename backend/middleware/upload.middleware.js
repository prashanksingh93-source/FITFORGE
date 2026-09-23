import multer from "multer";

// Store uploaded files temporarily in memory.
// They will be sent to Cloudinary by the controller.
const storage = multer.memoryStorage();

// Accept only image files.
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only image files are allowed"
      ),
      false
    );
  }
};

// Limit each image to 5 MB.
const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter,
});

export default upload;