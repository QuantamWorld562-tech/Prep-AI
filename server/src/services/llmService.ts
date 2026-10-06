// ─── OpenAI (commented out) ────────────────────────────────────────────────
// import OpenAI from "openai";
//
// let openai;
// const getOpenAI = () => {
//   if (!openai) {
//     openai = new OpenAI({
//       apiKey: process.env.OPENAI_API_KEY,
//     });
//   }
//   return openai;
// };
// ──────────────────────────────────────────────────────────────────────────────

import { GoogleGenAI } from "@google/genai";
import type { TaskCategory } from "../types/index.js";

let gemini: GoogleGenAI | null = null;

const getGemini = (): GoogleGenAI => {
  if (!gemini) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }
    gemini = new GoogleGenAI({
      apiKey,
    });
  }
  return gemini;
};

export interface AIResponseTask {
  title: string;
  category: TaskCategory;
  resourceLink?: string;
  lpaWeight: number;
}

export interface AIResponseWeek {
  weekNumber: number;
  focusArea: string;
  tasks: AIResponseTask[];
}

export interface AIRoadmapResponse {
  weeks: AIResponseWeek[];
}

export const generateRoadmapJSON = async (
  targetTier: string,
  targetLpa: string | number,
  trajectoryMode: 'direct' | 'progressive' = 'progressive',
): Promise<AIRoadmapResponse> => {
  const strategyInstruction =
    trajectoryMode === 'progressive'
      ? `STRATEGY MODE: STEPPED LADDER (PROGRESSIVE)
    - Week 1 & 2 (Stage 1 - Safety Net): Focus strictly on 7-12 LPA core CS parity (Core Java/JS, OOPS, DBMS, Arrays, Strings, Two-Pointers, Sliding Window, Clean Code).
    - Week 3 & 4 (Stage 2 - Target Leap): Ramp up directly to the ${targetLpa} LPA target (Trees, Graphs, Dynamic Programming, Scalable Microservices, Distributed Systems, High-Level Design).`
      : `STRATEGY MODE: DIRECT VECTOR (STRICT)
    - All 4 weeks are purely optimized for direct ${targetLpa} LPA Tier-1 Product rounds. Skip basic service-level fundamentals and dive straight into LeetCode Medium/Hard, Trees, Graphs, Dynamic Programming, and High-Throughput System Design.`;

  const prompt = `
    You are an expert Senior Software Engineer. Create a strict 4-week study roadmap for a developer aiming for a ${targetLpa} LPA job at a ${targetTier} tier company.
    
    ${strategyInstruction}

    RULES:
    1. Select resources ONLY from these verified sources: Striver A2Z (DSA), Neetcode 150 (DSA), FreeCodeCamp (Dev), LeetCode Contests.
    2. Adjust the DSA vs Development ratio based on the Tier (Big Tech needs heavy DSA, Service needs more Dev).
    3. Output EXACTLY in this JSON format, nothing else:
    {
      "weeks": [
        {
          "weekNumber": 1,
          "focusArea": "String",
          "tasks": [
            { "title": "String", "category": "DSA", "resourceLink": "URL", "lpaWeight": 0.5 }
          ]
        }
      ]
    }
  `;

  // ─── OpenAI call (commented out) ──────────────────────────────────────────
  // const client = getOpenAI();
  // const response = await client.chat.completions.create({
  //   model: "gpt-4o-mini",
  //   messages: [{ role: "system", content: prompt }],
  //   response_format: { type: "json_object" },
  // });
  // return JSON.parse(response.choices[0].message.content);
  // ──────────────────────────────────────────────────────────────────────────

  const client = getGemini();
  const response = await client.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  // Note: in @google/genai v2.x, `response.text` is a getter property string, NOT a function
  const text = response.text;
  if (!text) {
    throw new Error("Empty response received from Gemini AI service");
  }

  return JSON.parse(text) as AIRoadmapResponse;
};
