import { v2 as cloudinary } from "cloudinary";
import prisma from "../config/db.js";
import { analyzeImage, analyzePost } from "../workers/analysisWorker.js";

export const createPost = async (req, res) => {
  try {
    const { content } = req.body ?? {};
    const imageUrl = req.file ? req.file.path : null;

    const post = await prisma.post.create({
      data: { content, imageUrl, authorId: req.user.id },
      include: { author: { select: { email: true } } },
    });

    if (imageUrl) analyzeImage(post.id, imageUrl);
    analyzePost(post.id);

    res.status(201).json(post);
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ message: "Failed to create post" });
  }
};

export const updatePost = async (req, res) => {
  try {
    const content = req.body?.content || null;
    const newImageUrl = req.file ? req.file.path : null;

    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
    });
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.imageUrl && newImageUrl) {
      try {
        const parts = post.imageUrl.split("/");
        const fileWithExt = parts.at(-1).split("?")[0];
        const public_id = `social-community/${fileWithExt.split(".")[0]}`;
        await cloudinary.uploader.destroy(public_id);
      } catch (err) {
        console.error("Failed to delete old image:", err.message);
      }
    }

    const updatedPost = await prisma.post.update({
      where: { id: req.params.id },
      data: {
        content: content !== null ? content : post.content,
        imageUrl: newImageUrl || post.imageUrl,
      },
      include: { author: { select: { email: true } } },
    });

    res.json(updatedPost);
  } catch (err) {
    console.error("Update post error:", err);
    res.status(500).json({ message: "Failed to update post" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
    });
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Delete Cloudinary image if exists
    if (post.imageUrl) {
      try {
        const parts = post.imageUrl.split("/");
        const fileWithExt = parts.at(-1).split("?")[0];
        const public_id = `social-community/${fileWithExt.split(".")[0]}`;
        await cloudinary.uploader.destroy(public_id);
      } catch (err) {
        console.error("Failed to delete Cloudinary image:", err.message);
      }
    }

    await prisma.post.delete({ where: { id: req.params.id } });

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({ message: "Failed to delete post" });
  }
};

export const fetchPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: { select: { email: true } } },
    });
    res.json(posts);
  } catch (err) {
    console.error("Fetch posts error:", err);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

export const getFlaggedPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { status: "REMOVED", authorId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { email: true } } },
    });
    res.json(posts);
  } catch (err) {
    console.error("Fetch flagged posts error:", err);
    res.status(500).json({ message: "Failed to fetch flagged posts" });
  }
};
