const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 1. Sabse pehle app ko yahan define karna zaroori hai!
const app = express();

// 2. CORS Enable karo
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// 3. Google Generative AI Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

        const model = genAI.getGenerativeModel({ 
            model: 'gemini-1.5-flash'
        });

        const prompt = `Tum ek bahut samajhdar JEE 2028 Mentor aur Manu & Bhuvi ke sabse acche AI Friend ho. Tum unke JEE ke doubts aasan bhasha mein solve karoge aur life/study stress mein motivate karoge.\n\nUser ka sawal yeh hai: ${userMessage}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("AI Error Details:", error);
        res.status(500).json({ error: "AI se baat karne mein problem aa gayi." });
    }
});

// 4. Port listen karna
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
