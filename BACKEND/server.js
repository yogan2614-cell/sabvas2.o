const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();

// CORS enable karo taaki Vercel se request block na ho
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Gemini AI Setup (Render Environment Variable se key uthayega)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Test route
app.get('/', (req, res) => {
    res.json({ status: "WWT AI Backend is Live! 🚀" });
});

// AI Chat Route
app.post('/api/ai-chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        if (!userMessage) {
            return res.status(400).json({ error: "Message is required" });
        }

        const systemInstruction = "Tum ek bahut samajhdar JEE 2028 Mentor aur Manu & Bhuvi ke sabse acche AI Friend ho. Tum unke JEE ke doubts aasan bhasha mein solve karoge aur life/study stress mein motivate karoge.";

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash', // Model name ko standard aur stable rakha hai
            contents: userMessage,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        // Safe tareeqe se text extract karna
        const aiReply = response.text || (response.candidates && response.candidates[0]?.content?.parts[0]?.text) || "Jawab mil gaya, par read nahi ho paya.";

        res.json({ reply: aiReply });
    } catch (error) {
        console.error("AI Error Details:", error);
        res.status(500).json({ error: "AI se baat karne mein problem aa gayi." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
