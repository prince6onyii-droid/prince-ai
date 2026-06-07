const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/health', (req, res) => {
    res.json({ status: 'ok', prince: 'online' });
});

app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: process.env.MODEL || 'llama3-8b-8192',
                messages: messages,
                max_tokens: 1024,
                temperature: 0.7
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json({ 
                error: data.error?.message || 'API error' 
            });
        }

        res.json({ reply: data.choices[0].message.content });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Royal connection disturbed' });
    }
});

app.listen(PORT, () => {
    console.log(`Prince AI server running on port ${PORT}`);
});
