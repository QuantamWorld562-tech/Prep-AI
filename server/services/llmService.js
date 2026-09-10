import OpenAI from "openai";

let openai;
const getOpenAI = () => {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
};

export const generateRoadmapJSON = async (targetTier, targetLpa) => {
  const prompt = `
    You are an expert Senior Software Engineer. Create a strict 4-week study roadmap for a developer aiming for a ${targetLpa} LPA job at a ${targetTier} tier company.
    
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
  const client = getOpenAI();
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: prompt }],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content);
};

