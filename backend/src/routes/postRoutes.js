import { Router } from "express";
import { createPost, getFlaggedPosts } from "../controllers/postController.js";
import { protect } from "../middleware/auth.js";
const router = Router();
router.post("/", protect, createPost);
router.get("/flagged", protect, getFlaggedPosts);
export default router;
