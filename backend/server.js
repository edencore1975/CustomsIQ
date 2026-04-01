backend/server.js
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import fs from "fs";
import csv from "csv-parser";

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

let htsData = [];

fs.createReadStream("hts_data.csv")
  .pipe(csv())
  .on("data", (row) => htsData.push(row))
  .on("end", () => console.log("HTS data loaded:", htsData.length));

function searchHTS(query) {
  return htsData
    .filter((item) =>
      item.description?.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 5);
}

app.post("/classify", async (req, res) => {
  const { description } = req.body;

  try {
    const matches = searchHTS(description);

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an HTS expert. Return ONLY JSON with code, description, confidence, explanation.",
        },
        {
          role: "user",
          content: `Product: ${description}\nOptions: ${JSON.stringify(matches)}`,
        },
      ],
    });

    let parsed;
    try {
      parsed = JSON.parse(response.choices[0].message.content);
    } catch {
      parsed = { error: "Parsing failed" };
    }

    res.json({ ...parsed, candidates: matches });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
