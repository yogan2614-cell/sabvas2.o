const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();

// CORS Error fix karne ke liye sabhi origins allow kar diye hain
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// --- GOOGLE GEMINI AI INITIALIZATION ---
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// AI Chat API Route (Jise frontend se call kiya jayega)
app.post('/api/ai-chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        if (!userMessage) {
            return res.status(400).json({ error: "Message is required" });
        }

        const systemInstruction = "Tum ek bahut samajhdar JEE 2028 Mentor aur Manu & Bhuvi ke sabse acche AI Friend ho. Tum unke JEE (Maths, Physics, Chemistry) ke doubts aasan bhasha mein solve karoge aur life/study stress mein unko motivate karoge.";

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userMessage,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        res.json({ reply: response.text });
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "AI se baat karne mein problem aa gayi." });
    }
});

// --- SOCKET.IO CALLING SYSTEM ---
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });

    socket.on('call-user', (data) => {
        socket.to(data.toRoom).emit('incoming-call', { offer: data.offer, caller: data.caller });
    });

    socket.on('make-answer', (data) => {
        socket.to(data.toRoom).emit('call-answered', { answer: data.answer });
    });

    socket.on('ice-candidate', (data) => {
        socket.to(data.toRoom).emit('ice-candidate', { candidate: data.candidate });
    });

    socket.on('end-call', (data) => {
        socket.to(data.toRoom).emit('call-ended');
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Render ke dynamic port ke liye
const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server & Signaling running on port ${PORT}`);
});
```[cite: 2]

Ab इन्हें अपने GitHub पर अलग-अलग पेस्ट करके पुश कर दो, Render खुद-ब-खुद इन्हें अपडेट कर लेगा!
