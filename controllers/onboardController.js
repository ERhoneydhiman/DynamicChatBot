const Website = require('../models/Website');
const KnowledgeChunk = require('../models/KnowledgeChunk');
const scraperService = require('../services/scraperService');
const aiService = require('../services/aiService');

/**
 * Onboards a new website: scrapes, vectorizes, and stores.
 */
exports.onboardWebsite = async (req, res) => {
    try {
        const { name, url } = req.body;

        if (!name || !url) {
            return res.status(400).json({ error: 'Name and URL are required.' });
        }

        console.log(`🚀 Starting onboarding for: ${name} (${url})`);

        // 1. Scrape and Chunk FIRST (to ensure we have data)
        const { title, chunks } = await scraperService.scrapeUrl(url);

        // 2. Create Website Entry
        const website = new Website({ name, url: url.startsWith('http') ? url : `https://${url}` });
        await website.save();

        // 3. Vectorize and Store Chunks
        console.log(`🧠 Vectorizing ${chunks.length} chunks for ${name}...`);
        const knowledgeChunks = [];
        for (const text of chunks) {
            const embedding = await aiService.generateEmbedding(text);
            knowledgeChunks.push({
                website_id: website.website_id,
                content: text,
                embedding: embedding,
                metadata: { source: url, title: title }
            });
        }

        await KnowledgeChunk.insertMany(knowledgeChunks);
        console.log(`✅ Onboarding complete for Website ID: ${website.website_id}`);

        res.status(201).json({
            message: 'Website onboarded successfully.',
            website_id: website.website_id
        });

    } catch (error) {
        console.error(`❌ Onboarding failed: ${error.message}`);
        res.status(500).json({ error: `Onboarding failed: ${error.message}` });
    }
};
