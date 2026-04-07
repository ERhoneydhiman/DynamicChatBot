const KnowledgeChunk = require('../models/KnowledgeChunk');
const aiService = require('../services/aiService');

/**
 * Handles the RAG question/answering logic.
 */
exports.askQuestion = async (req, res) => {
    try {
        const { website_id, question } = req.body;

        if (!website_id || !question) {
            return res.status(400).json({ error: 'Question and website_id are required.' });
        }

        console.log(`💬 User Query for [${website_id}]: "${question}"`);

        // 1. Generate an embedding
        const queryEmbedding = await aiService.generateEmbedding(question);
        console.log('✅ Question vectorized.');

        // 2. Perform Atlas Vector Search
        let results = [];
        try {
            results = await KnowledgeChunk.aggregate([
                {
                    $vectorSearch: {
                        index: 'vector_index',
                        path: 'embedding',
                        queryVector: queryEmbedding,
                        numCandidates: 100,
                        limit: 5,
                        filter: { website_id: website_id }
                    }
                }
            ]);
            console.log(`✅ Search complete. Found ${results.length} matches.`);
        } catch (searchError) {
            console.error(`❌ Atlas Vector Search Failed: ${searchError.message}`);
            throw new Error(`Atlas Search Error: ${searchError.message}`);
        }

        if (results.length === 0) {
            return res.json({ answer: "I'm sorry, I don't have any specific information about that on this website." });
        }

        // 3. Build context
        const context = results.map(r => r.content).join('\n---\n');

        // 4. Generate answer
        const answer = await aiService.generateAnswer(question, context);
        console.log('✅ Gemini generated an answer.');

        res.json({ answer });

    } catch (error) {
        console.error('❌ CHAT PROCESSING FAILED:');
        console.error(error.stack); // This prints the EXACT line number and reason
        res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
};
