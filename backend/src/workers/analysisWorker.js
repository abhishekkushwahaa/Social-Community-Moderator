import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";
import { io } from "../../index.js";
import prisma from "../config/db.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const analyzePost = async (postId) => {
  console.log(`Analyzing post ${postId} with Gemini...`);

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return;

  const prompt = `
    As an expert content moderator, analyze the following text for violations (hate speech, harassment, spam, sexual content, etc.).
    Respond ONLY with a JSON object:
    {
      "isViolation": boolean,
      "category": string,
      "confidence": float,
      "justification": string
    }

    Post: "${post.content}"
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

    if (analysis.isViolation && analysis.confidence > 0.7) {
      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
          content:
            "This post was removed by the moderator due to inappropriate content.",
          status: "REMOVED",
          aiReason: `[${analysis.category}] ${analysis.justification}`,
        },
        include: { author: true },
      });

      io.emit("new_flagged_post", updatedPost);
      console.log(
        `Post ${postId} flagged for review. Category: ${analysis.category}`
      );
    } else {
      console.log(`Post ${postId} passed Gemini analysis.`);
    }
  } catch (error) {
    console.error(`Gemini analysis failed for post ${postId}:`, error);
  }
};
