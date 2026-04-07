const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');

// 1. Initial Config
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// 2. Middlewares
app.use(cors());
app.use(express.json());

// 3. Connect Database
connectDB();

// 4. Routes
app.use('/api', apiRoutes);

// 5. Default Route
app.get('/', (req, res) => {
    res.send('<h1>Multi-Tenant Chatbot API </h1><p>The API is running. Use /api/onboard and /api/chat endpoints.</p>');
});

// 6. Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`
 Server is up and running on port ${PORT}! 
 Network Access: http://YOUR_IP_HERE:${PORT}
 Project: multiTenentChatbot
 Multi-Tenant RAG API Mode
-----------------------------------------
POST /api/onboard -> To add a website
POST /api/chat    -> To query a website
-----------------------------------------
`);
});
