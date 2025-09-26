import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "social-community",
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
  },
});

export const upload = multer({ storage });
