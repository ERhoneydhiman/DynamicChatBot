const Website = require('../models/Website');
const KnowledgeChunk = require('../models/KnowledgeChunk');
const documentService = require('../services/documentService');
const aiService = require('../services/aiService');

/**
 * Uploads a document, extracts text, vectorizes, and saves to an existing Website ID.
 */
exports.uploadDocument = async (req, res) => {
    try {
        const { website_id } = req.body;
        const file = req.file;

        if (!website_id) {
            return res.status(400).json({ error: 'website_id is required.' });
        }

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        // 1. Verify Website Exists
        const website = await Website.findOne({ website_id });
        if (!website) {
            return res.status(404).json({ error: `Website with ID ${website_id} not found.` });
        }

        console.log(`🚀 Starting document upload for Website: ${website.name} (File: ${file.originalname})`);

        // 2. Extract and Chunk Text
        const { title, chunks } = await documentService.extractText(file.buffer, file.mimetype, file.originalname);

        // 3. Vectorize and Store Chunks
        console.log(`🧠 Vectorizing ${chunks.length} chunks from document...`);
        const knowledgeChunks = [];
        
        for (const text of chunks) {
            const embedding = await aiService.generateEmbedding(text);
            knowledgeChunks.push({
                website_id: website_id,
                content: text,
                embedding: embedding,
                metadata: { 
                    source: 'document', 
                    title: title,
                    filename: file.originalname,
                    original_mimetype: file.mimetype
                }
            });
        }

        await KnowledgeChunk.insertMany(knowledgeChunks);
        console.log(`✅ Document processing complete for Website ID: ${website_id}`);

        res.status(201).json({
            message: 'Document uploaded and processed successfully.',
            website_id: website_id,
            chunks_added: chunks.length,
            filename: file.originalname
        });

    } catch (error) {
        console.error(`❌ Document upload failed: ${error.message}`);
        res.status(500).json({ error: `Document upload failed: ${error.message}` });
    }
};
