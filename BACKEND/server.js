const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

// CORS configuration to allow your Vercel frontend
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Initialize Google Gemini API using Render Environment Variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Health check route
app.get('/', (req, res) => {
    res.json({ status: "WWT JEE Mentor AI Backend is Live! 🚀" });
});

// AI Chat Endpoint for Frontend
app.post('/api/ai-chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        if (!userMessage) {
            return res.status(400).json({ error: "Message is required" });
        }

        // Using gemini-1.5-flash with proper system instruction handling
        const model = genAI.getGenerativeModel({ 
            model: 'gemini-1.5-flash',
            systemInstruction: "Tum ek bahut samajhdar JEE 2028 Mentor aur Manu & Bhuvi ke sabse acche AI Friend ho. Tum unke JEE ke doubts aasan bhasha mein solve karoge aur life/study stress mein motivate karoge."
        });

        const result = await model.generateContent(userMessage);
        const response = await result.result;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "AI se baat karne mein problem aa gayi." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
