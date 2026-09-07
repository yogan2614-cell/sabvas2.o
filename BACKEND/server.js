app.post('/api/ai-chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        if (!userMessage) {
            return res.status(400).json({ error: "Message is required" });
        }

        // Gemini Model ko call karna
        const model = genAI.getGenerativeModel({ 
            model: 'gemini-1.5-flash'
        });

        // System prompt aur user message ko mila kar bhejna
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
