const express = require("express");
const path = require("path");
const rateLimit = require("express-rate-limit");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");
app.use(express.json({ limit: "30kb" }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/chat", rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Bahut saare messages bheje gaye. Ek minute baad dobara try karein." }
}));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, aiConfigured: Boolean(process.env.OPENAI_API_KEY) });
});

app.post("/api/chat", async (req, res) => {
  const message = typeof req.body.message === "string" ? req.body.message.trim() : "";
  const history = Array.isArray(req.body.history) ? req.body.history.slice(-12) : [];

  if (!message) return res.status(400).json({ error: "Pehle apna sawaal likhein." });
  if (message.length > 6000) return res.status(413).json({ error: "Message bahut lamba hai. Chhota karke bhejein." });
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: "AI abhi connect nahi hai. Hosting ke Environment Variables mein OPENAI_API_KEY add karein." });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const safeHistory = history
      .filter(m => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string")
      .map(m => ({ role: m.role, content: m.content.slice(0, 6000) }));

    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are Adii AI, a helpful, honest assistant. Reply in the language the user uses, including Hindi or Hinglish. Be clear and practical. If unsure, say so rather than inventing facts." },
        ...safeHistory,
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 1200
    });

    const answer = response.choices?.[0]?.message?.content?.trim();
    if (!answer) throw new Error("Empty response from AI");
    res.json({ answer });
  } catch (err) {
    console.error("Chat API error:", err?.status || "", err?.message || err);
    if (err?.status === 401) return res.status(502).json({ error: "API key sahi nahi lag rahi. Hosting settings mein key check karein." });
    if (err?.status === 429) return res.status(429).json({ error: "AI API ki limit ya balance issue hai. Thodi der baad try karein." });
    res.status(500).json({ error: "Abhi jawab nahi aa paya. Dobara try karein." });
  }
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, () => console.log(`Adii AI running on port ${PORT}`));
