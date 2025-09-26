import { Router } from "express";
import { upload } from "../config/multerCloudinary.js";
import {
  createPost,
  deletePost,
  fetchPosts,
  getFlaggedPosts,
  updatePost,
} from "../controllers/postController.js";
import { protect } from "../middleware/auth.js";
const router = Router();
router.post("/", protect, upload.single("image"), createPost);
router.get("/", protect, fetchPosts);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);
router.get("/flagged", protect, getFlaggedPosts);
export default router;
