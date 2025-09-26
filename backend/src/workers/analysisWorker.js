import { GoogleGenerativeAI } from "@google/generative-ai";
import { v2 as cloudinary } from "cloudinary";
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
export const analyzeImage = async (postId, imageUrl) => {
  console.log(`Analyzing image for post ${postId} with Gemini...`);

  const prompt = `
    As an expert content moderator, analyze the following image for violations (nudity, hate symbols, violent content, etc.).
    Respond ONLY with a JSON object:
    {
      "isViolation": boolean,
      "category": string,
      "confidence": float,
      "justification": string
    }

    Image URL: "${imageUrl}"
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
      await prisma.post.update({
        where: { id: postId },
        data: {
          content:
            "This post was removed by the moderator due to inappropriate content.",
          imageUrl: null,
          status: "REMOVED",
          aiReason: `[${analysis.category}] ${analysis.justification}`,
        },
        include: { author: true },
      });

      const parts = imageUrl.split("/");
      const fileWithExt = parts[parts.length - 1];
      const public_id = `social-community/${fileWithExt.split(".")[0]}`;

      try {
        await cloudinary.uploader.destroy(public_id, {
          resource_type: "image",
        });
        console.log(`Image deleted from Cloudinary: ${public_id}`);
      } catch (cloudErr) {
        console.error("Failed to delete image from Cloudinary:", cloudErr);
      }

      io.emit("new_flagged_post", { postId, imageRemoved: true });
      console.log(
        `Image for post ${postId} flagged. Category: ${analysis.category}`
      );
    } else {
      console.log(`Image for post ${postId} passed Gemini analysis.`);
    }
  } catch (error) {
    console.error(`Gemini analysis failed for image in post ${postId}:`, error);
  }
};
