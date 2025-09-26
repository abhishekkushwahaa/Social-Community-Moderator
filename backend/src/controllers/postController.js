import prisma from "../config/db.js";
import { analyzePost } from "../workers/analysisWorker.js";

export const createPost = async (req, res) => {
  const { content } = req.body;
  const post = await prisma.post.create({
    data: { content, authorId: req.user.id },
    include: {
      author: {
        select: {
          email: true,
        },
      },
    },
  });

  res.status(201).json(post);

  analyzePost(post.id);
};

export const updatePost = async (req, res) => {
  const { content } = req.body;
  const post = await prisma.post.update({
    where: { id: req.params.id },
    data: { content },
    include: { author: { select: { email: true } } },
  });
  res.json(post);
};

export const deletePost = async (req, res) => {
  await prisma.post.delete({
    where: { id: req.params.id },
  });
  res.json({ message: "Post deleted" });
};

export const fetchPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            email: true,
          },
        },
      },
    });
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Failed to fetch posts." });
  }
};

export const getFlaggedPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const posts = await prisma.post.findMany({
      where: { status: "REMOVED", authorId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            email: true,
          },
        },
      },
    });
    res.json(posts);
  } catch (error) {
    console.error("Error fetching flagged posts:", error);
    res.status(500).json({ message: "Failed to fetch flagged posts." });
  }
};
