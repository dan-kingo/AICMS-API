import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    const mimeType = file.mimetype;

    let resourceType = "image";

    if (mimeType.startsWith("video/")) {
      resourceType = "video";
    } else if (mimeType.startsWith("audio/")) {
      resourceType = "video";
    } else if (
      mimeType === "application/pdf" ||
      mimeType === "application/msword" ||
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType === "text/plain"
    ) {
      resourceType = "raw";
    }

    return {
      folder: "aicms-complaints",
      format: file.mimetype.split("/")[1],
      resource_type: resourceType,
    };
  },
});
const cloudinaryUpload = multer({ storage });

export default cloudinaryUpload;
