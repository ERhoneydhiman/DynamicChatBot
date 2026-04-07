const mongoose = require('mongoose');

/**
 * KnowledgeChunk schema for storing vector embeddings and text data.
 */
const knowledgeChunkSchema = new mongoose.Schema({
    website_id: { type: String, required: true },
    content: { type: String, required: true },
    embedding: { type: [Number], required: true },
    metadata: {
        source: String,
        title: String
    }
}, { timestamps: true });

module.exports = mongoose.model('KnowledgeChunk', knowledgeChunkSchema);
