import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream =
      cloudinary.uploader.upload_stream(
        {
          folder: "fitforge/products",
          resource_type: "image",
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );

    stream.end(file.buffer);
  });
};

export const uploadProductImages = async (
  req,
  res
) => {
  try {
    if (
      !req.files ||
      req.files.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please select at least one image",
      });
    }

    const images = await Promise.all(
      req.files.map(uploadToCloudinary)
    );

    return res.status(200).json({
      success: true,
      message:
        "Images uploaded successfully",
      images,
    });
  } catch (error) {
    console.error(
      "Cloudinary upload error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Image upload failed",
    });
  }
};

export const deleteProductImage = async (
  req,
  res
) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "Cloudinary public ID is required",
      });
    }

    await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: "image",
      }
    );

    return res.status(200).json({
      success: true,
      message:
        "Image deleted successfully",
    });
  } catch (error) {
    console.error(
      "Cloudinary delete error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Image deletion failed",
    });
  }
};