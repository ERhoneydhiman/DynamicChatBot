const express = require('express');
const router = express.Router();
const multer = require('multer');
const onboardController = require('../controllers/onboardController');
const documentController = require('../controllers/documentController');
const chatController = require('../controllers/chatController');

// Configure Multer for processing file uploads in memory
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Route to add a new website to the chatbot ecosystem
router.post('/onboard', onboardController.onboardWebsite);

// Route to upload a document (PDF, DOCX, TXT) to an existing website
router.post('/onboard/upload-document', upload.single('file'), documentController.uploadDocument);

// Route for users to ask questions from specific websites
router.post('/chat', chatController.askQuestion);

// Health Check
router.get('/health', (req, res) => res.json({ status: 'OK', message: 'Chatbot API Online ' }));

module.exports = router;

