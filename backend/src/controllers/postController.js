import prisma from "../config/db.js";
import { analyzePost } from "../workers/analysisWorker.js";

export const createPost = async (req, res) => {
  const { content } = req.body;
  const post = await prisma.post.create({
    data: { content, authorId: req.user.id },
  });

  res.status(201).json(post);

  analyzePost(post.id);
};

export const getFlaggedPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { status: "PENDING_REVIEW" },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            name: true,
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
