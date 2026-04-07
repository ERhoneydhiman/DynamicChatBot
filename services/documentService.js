const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { RecursiveCharacterTextSplitter } = require('@langchain/textsplitters');

/**
 * DocumentService handles text extraction from various file formats.
 */
class DocumentService {
    constructor() {
        this.splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 100,
        });
    }

    /**
     * Extracts text from a file buffer based on mimetype.
     */
    async extractText(buffer, mimetype, originalname) {
        try {
            let text = '';

            if (mimetype === 'application/pdf') {
                const data = await pdf(buffer);
                text = data.text;
            } 
            else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                const result = await mammoth.extractRawText({ buffer });
                text = result.value;
            } 
            else if (mimetype === 'text/plain') {
                text = buffer.toString('utf-8');
            } 
            else {
                throw new Error(`Unsupported file type: ${mimetype}`);
            }

            if (!text || text.trim().length === 0) {
                throw new Error(`No text extracted from file: ${originalname}`);
            }

            // Cleanup text (remove excessive whitespace)
            const cleanText = text.replace(/\s+/g, ' ').trim();
            
            const chunks = await this.splitter.splitText(cleanText);
            console.log(`📦 Document [${originalname}] processed! Found ${chunks.length} chunks.`);

            return { title: originalname, chunks };

        } catch (error) {
            console.error(`❌ Document Extraction Error: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new DocumentService();
