import express from 'express';
import dotenv from 'dotenv'; 
import { GoogleGenAI } from "@google/genai";
import cors from "cors";

const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEM_API });

async function gem(prompt) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  return response.text;
}

function cleanJSON(text) {
  return text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

app.post('/', async (req, res) => {
  try {
    const { prompt } = req.body; 
    if (!prompt) return res.status(400).send("no prompt");

    const rawText = await gem(prompt);
    const cleaned = cleanJSON(rawText);

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("failed to parse json,", cleaned);
      return res.status(500).send("invalid json");
    }

    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).send("error generating content");
  }
});

app.listen(port, () => {
  console.log(`available at ${port}`);
});
