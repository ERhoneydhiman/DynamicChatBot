const express = require('express');
const router = express.Router();
const onboardController = require('../controllers/onboardController');
const chatController = require('../controllers/chatController');

// Route to add a new website to the chatbot ecosystem
router.post('/onboard', onboardController.onboardWebsite);

// Route for users to ask questions from specific websites
router.post('/chat', chatController.askQuestion);

// Health Check
router.get('/health', (req, res) => res.json({ status: 'OK', message: 'Chatbot API Online ' }));

module.exports = router;
