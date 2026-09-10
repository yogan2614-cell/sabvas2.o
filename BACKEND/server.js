/* ==========================================================
   WWT BACKEND SERVER - EXPRESS & SOCKET.IO SIGNALING
   ========================================================== */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

/* ==========================================================
   01. MIDDLEWARES & CORS CONFIGURATION
   ========================================================== */
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

/* ==========================================================
   02. GOOGLE GEMINI AI SETUP
   ========================================================== */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

app.get('/', (req, res) => {
    res.json({ status: "WWT Backend & Socket Server is Live! 🚀" });
});

app.post('/api/ai-chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        if (!userMessage) {
            return res.status(400).json({ error: "Message is required" });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "Gemini API key is not configured on the server." });
        }

        const model = genAI.getGenerativeModel({ 
            model: 'gemini-1.5-flash',
            systemInstruction: "Tum ek bahut samajhdar JEE 2028 Mentor aur Manu & Bhuvi ke sabse acche AI Friend ho. Tum unke JEE ke doubts aasan bhasha mein solve karoge aur life/study stress mein motivate karoge."
        });

        const result = await model.generateContent(userMessage);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "AI se baat karne mein problem aa gayi." });
    }
});

/* ==========================================================
   03. SOCKET.IO REAL-TIME SIGNALING & WEB RTC EVENTS
   ========================================================== */
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join private couple room
    socket.join('wwt-private-room-2028');

    socket.on('join-room', (room) => {
        socket.join(room);
    });

    // WebRTC Signaling Handlers
    socket.on('call-user', ({ toRoom, offer, caller }) => {
        socket.to(toRoom || 'wwt-private-room-2028').emit('incoming-call', { offer, caller });
    });

    socket.on('make-answer', ({ toRoom, answer }) => {
        socket.to(toRoom || 'wwt-private-room-2028').emit('call-answered', { answer });
    });

    socket.on('ice-candidate', ({ toRoom, candidate }) => {
        socket.to(toRoom || 'wwt-private-room-2028').emit('ice-candidate', { candidate });
    });

    socket.on('end-call', ({ toRoom }) => {
        socket.to(toRoom || 'wwt-private-room-2028').emit('call-ended');
    });

    // Typing Status Broadcast
    socket.on('typing-status', ({ toRoom, sender }) => {
        socket.to(toRoom || 'wwt-private-room-2028').emit('typing-status', { sender });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

/* ==========================================================
   04. SERVER LISTENER
   ========================================================== */
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server & Socket.io is running on port ${PORT}`);
});
