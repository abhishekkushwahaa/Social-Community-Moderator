import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "../config/db.js";
import { io } from "../../index.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const analyzePost = async (postId) => {
  console.log(`Analyzing post ${postId} with Gemini...`);

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    console.error(`Post with ID ${postId} not found for analysis.`);
    return;
  }

  const prompt = `
    You are a community moderator AI. Analyze the following user post based on these rules:
    1. No hate speech or personal attacks.
    2. No spam or self-promotion.
    3. No NSFW content.
    User Post: "${post.content}"
    Respond ONLY with a JSON object with two keys: "isViolation" (boolean) and "justification" (string).
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response
      .text()
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const analysis = JSON.parse(text);

    if (analysis.isViolation) {
      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
          status: "PENDING_REVIEW",
          aiReason: analysis.justification,
        },
        include: { author: true },
      });
      io.emit("new_flagged_post", updatedPost);
      console.log(`Post ${postId} flagged for review.`);
    } else {
      console.log(`Post ${postId} passed Gemini analysis.`);
    }
  } catch (error) {
    console.error(`Gemini analysis failed for post ${postId}:`, error);
  }
};
