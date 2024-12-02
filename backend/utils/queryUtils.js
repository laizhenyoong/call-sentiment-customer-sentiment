// queryUtils.js
const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
const fs = require('fs');
require('dotenv').config();

// Initialize Pinecone Client
const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

// Initialize OpenAI Client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Function to query Pinecone
const queryPinecone = async (queryText) => {
    try {
        const index = pinecone.Index('celcomdigi-faq');

        // Generate embeddings for the query
        const embeddingResponse = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: queryText,
        });

        const queryEmbedding = embeddingResponse.data[0].embedding;

        // Query Pinecone for the top 5 matches
        const pineconeResponse = await index.namespace('example-namespace').query({
            vector: queryEmbedding,
            topK: 5,
            includeMetadata: true,
        });

        return pineconeResponse;
    } catch (error) {
        throw new Error(`Pinecone query failed: ${error.message}`);
    }
};

// Function to query OpenAI with Pinecone context
const queryOpenAI = async (queryText, context, systemContext) => {
    try {
        const openaiResponse = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `${systemContext}\n\nContext:\n${context}`,
                },
                { role: "user", content: queryText },
            ],
        });

        return openaiResponse.choices[0].message.content;
    } catch (error) {
        throw new Error(`OpenAI query failed: ${error.message}`);
    }
};

// Function to query OpenAI voice to text 
const transcribeAudio = async (file) => {
    try {
        
        const response = await openai.audio.transcriptions.create({
            file: fs.createReadStream(file),
            model: 'whisper-1',
        });

        return response.text;
    } catch (error) {
        console.error('Error transcribing audio:', error);
        return 'Error transcribing audio';
    }
};

module.exports = {
    queryPinecone,
    queryOpenAI,
    transcribeAudio,
};
