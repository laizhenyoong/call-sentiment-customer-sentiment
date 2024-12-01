const express = require('express');
const fs = require('fs');
const path = require('path');
const { queryPinecone, queryOpenAI } = require('./utils/queryUtils');
const router = express.Router();

router.post('/adminSentiment', async (req, res) => {
    try {
        const { message } = req.body;

        // 1.  Generate a response for admin sentiment score
        const systemPrompt1 = `
        Given the following admin message, please evaluate the professionalism
        of the message and provide a score between 0 (unprofessional) and 1 
        (highly professional). Please just provide the score.
        `;
        const admin_sentiment_score = await queryOpenAI(message, "", systemPrompt1);

        // 2. Determine the professioanlism sentiment of the admin
        let admin_sentiment;

        if (admin_sentiment_score <= 0.4) {
            admin_sentiment = "Not Professional";
        } else if (admin_sentiment_score < 0.6) {
            admin_sentiment = "Neutral";
        } else {
            admin_sentiment = "Professional";
        }

        // 3. Return 
        res.status(200).json({
            admin_sentiment: admin_sentiment,
            admin_sentiment_score: admin_sentiment_score,
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

router.post('/customerSentiment', async (req, res) => {
    try {
        const { message } = req.body;

        // 1. Generate a response to categorize customer sentiment 
        const systemPrompt1 = `
        Given the following customer message, please provide a single word 
        that best describes how the customer is feeling.
        `;
        const customer_sentiment = await queryOpenAI(message, "", systemPrompt1);

        // 2.  Generate a response for customer sentiment score
        const systemPrompt2 = `
        Given the following customer message, please provide the sentiment 
        score between 0 (negative) and 1 (positive). Please just provide 
        the score.
        `;
        const customer_sentiment_score = await queryOpenAI(message, "", systemPrompt2);

        // 2. Return 
        res.status(200).json({
            customer_sentiment: customer_sentiment,
            customer_sentiment_score: customer_sentiment_score,
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

router.post('/checkTopics', async (req, res) => {
    try {
        const { message, topics } = req.body;

        // 1. Generate a response to categorize mentioned topics
        const systemPrompt = `
        You have a list of topics, each represented by a number.

        When a user inputs a message, analyse the message and 
        return a comma-separated list of numbers corresponding 
        to the topics mentioned or matched. 
        
        If a topic is not mentioned, do not include its number 
        in the output. Ensure the numbers are returned in order, 
        without spaces.
        
        Topics:
        ${topics}
        `;
        const aiMessage = await queryOpenAI(message, "", systemPrompt);

        // 2. Return 
        res.status(200).json({
            aiResponse: aiMessage,
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

router.post('/queryGPT', async (req, res) => {
    try {
        const { queryText } = req.body;

        // 1. Query Pinecone for relevant data
        const pineconeResponse = await queryPinecone(queryText);

        // 2. Build context from Pinecone matches
        const context = pineconeResponse.matches
            .map((match) => match.metadata.text)
            .join("\n");

        // 3. Generate a response using OpenAI with the system context
        const systemPrompt = `You are a helpful assistant who provides accurate and concise answers. 
        Use the provided context to respond intelligently to user queries.`;
        const aiMessage = await queryOpenAI(queryText, context, systemPrompt);

        // 4. Send the AI response back to the frontend
        res.status(200).json({
            aiResponse: aiMessage,
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

// Analysis route
router.post('/analyseData', async (req, res) => {
    try {
        const { chatData } = req.body;

        const systemPrompt = `
            Analyze the given list of messages and generate a JSON response based on the following template:
            {
                "overallSummary": "Insightful overview of the conversation and brief outcome of the conversation",
                "agentSummary": "Summary of agent's actions",
                "customerSummary": "Summary of customer's concerns and requests",
                "conversationalInsight": {
                    "csatScore": 0,
                    "conversationResult": "Outcome of the conversation",
                    "customerSentiment": "Positive/Neutral/Negative",
                    "overallCallDuration": "00:00"
                },
                "overallPerformance": 0,
                "aiInsight": {
                    "introduction": 0,
                    "recommendation": 0,
                    "thankYouMessage": 0,
                    "attitude": 0,
                    "communicationSkills": 0
                },
                "timeConsumption": {
                    "agent": 0,
                    "customer": 0,
                    "notTalking": 0
                },
                "topicsDiscussed": {
                    "Topic1": 0,
                    "Topic2": 0,
                    "Topic3": 0,
                    "Topic4": 0
                }-
            }

            Guidelines:
            CSAT score and overall performance should be percentages (0-100).
            Call duration can be used as overallCallDuration
            The conversation result should be condensed into a few short words.
            Time consumption should be in percentage.
            AI insight should be rated on a scale of 100 and take consideration of the agent's conversation.
            Topics discussed should be telco-related, with at least 4 topics and their percentages.
            Provide the response as a valid JSON string, without any Markdown formatting.
        `;

        //console.log("prompt: ", systemPrompt)

        const aiMessage = await queryOpenAI(chatData, "", systemPrompt);

        //console.log("answer: ", aiMessage)

        // Write JSON result into a file
        fs.writeFile('data.json', aiMessage, (err) => {
            if (err) {
                console.error('Error writing file', err);
            } else {
                console.log('JSON data has been saved to data.json');
            }
        });

    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

router.use('/data', express.static(path.join(__dirname, 'data.json')));

module.exports = router;