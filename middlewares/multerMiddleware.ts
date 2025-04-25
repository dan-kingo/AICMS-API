import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    return {
      folder: "aicms-complaints",
      format: file.mimetype.split("/")[1],
      resource_type: "auto",
    };
  },
});

const cloudinaryUpload = multer({ storage });

export default cloudinaryUpload;
