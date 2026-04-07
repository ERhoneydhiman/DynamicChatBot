const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
const { ChatGroq } = require('@langchain/groq');
const dotenv = require('dotenv');
dotenv.config();

/**
 * AIService handles both searching (embeddings) and chatting (LLM).
 * - Google Gemini: Used for 3072-dimension embeddings (already configured).
 * - Groq: Used for lightning-fast conversational answers.
 */
class AIService {
    constructor() {
        if (!process.env.GOOGLE_API_KEY) {
            throw new Error("❌ Error: GOOGLE_API_KEY is missing! Please add it to your .env file.");
        }
        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_key_here') {
            console.warn("⚠️ Warning: GROQ_API_KEY is missing or using placeholder! Chat will fail.");
        }

        // 1. Embeddings: Google Gemini (Confirmed 3072 dimensions)
        this.embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GOOGLE_API_KEY,
            modelName: "gemini-embedding-001",
        });

        // 2. Chat Model: Groq (Llama-3 High Speed)
        this.chatModel = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: "llama-3.3-70b-versatile", // Or "llama3-8b-8192"
            maxTokens: 1024,
            temperature: 0.2,
        });

        console.log('✨ AIService Initialized: Using Google (Embeddings) + Groq (Brain)! 🤖⚡');
    }

    /**
     * Converts text/query into a numerical vector (3072 dimensions)
     */
    async generateEmbedding(text) {
        try {
            return await this.embeddings.embedQuery(text);
        } catch (error) {
            console.error(`❌ Gemini Embedding Error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Uses retrieved context and Groq to generate a conversational answer.
     */
    async generateAnswer(query, context) {
        try {
            const systemPrompt = `
You are a helpful and professional AI assistant. 
Your instructions are to answer the user's question accurately using ONLY the verified context provided below.

RULES:
- Refer strictly to the provided context.
- If the answer is not in the context, say: "I'm sorry, I don't have that specific information right now. Please reach out to our team."
- Be concise and professional.

VERIFIED CONTEXT:
-------------------
${context}
-------------------
`;
            const response = await this.chatModel.invoke([
                ["system", systemPrompt],
                ["user", query]
            ]);

            return response.content;
        } catch (error) {
            console.error(`❌ Groq Answer Error: ${error.message}`);
            if (error.message.includes('401')) {
                throw new Error("Groq Authentication Failed: Check your GROQ_API_KEY.");
            }
            throw error;
        }
    }
}

module.exports = new AIService();
