const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { queryPinecone, queryOpenAI, transcribeAudio } = require('./utils/queryUtils');
const router = express.Router();
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// toFile function: saves the buffer data to a file
const toFile = (buffer, fileName) => {
    return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, fileName); // Specify the file path where you want to save
        fs.writeFile(filePath, buffer, (err) => {
            if (err) {
                reject(err); // Reject the promise if there's an error
            } else {
                resolve(filePath); // Resolve the promise with the file path
            }
        });
    });
};

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

// Categorize customer issue
router.post('/categorizeIssue', async (req, res) => {
    try {
        const { text } = req.body;

        const systemPrompt = `You are a helpful assistant that classifies customer inquiries for a telecom company. 
            Here are the categories and subcategories for classification:
            
            Category: Account & Subscriptions
              1) Change credit limit
              2) Change postpaid plan
              3) Rewards-related issue
              4) Voicemail and missed call alerts activation/deactivation
              5) Stop non-Digi/Celcom charges/subscriptions
              6) Reinstate terminated prepaid line for CelcomDigi
              7) Others
  
            Category: Call, Internet, SMS and OTP issues
              1) Call quality 
              2) Coverage
              3) Internet slowness
              4) Unable to receive OTP/TAC
  
            Category: Internet Quota
              1) {Insert details}
  
            Category: Reload & Prepaid
              1) Reload-related issue 
              2) Others
  
            Category: Roaming
              1) Unable to use/connect roaming
              2) Others
  
            Category: Switching to CelcomDigi
              1) Resubmit port-in request
              2) Others
  
            Category: Billing
              1) I don't agree with my bill (non-scam related)
              2) I don't agree with my bill (suspected scam)
              3) Others
  
            Category: Fibre
              1) No service
              2) Internet slowness (Fibre)
              3) Others (Fibre)
              4) Relocation request
  
            Category: Products & Offerings
              1) {Provide details}
  
            Category: Report a scam/fraud
              1) Scam call
              2) SMS spam/SMS scam 
              3) Scam URL/QR Code
              4) Missed calls from international numbers
  
            Category: SIM & Devices
              1) Blocked device due to non-payment of Digi bill
              2) Others
  
            Classify the following inquiry into the most appropriate category and subcategory. Return the classification in the following format:
            Category: <category>
            Subcategory: <subcategory>`;

        const aiMessage = await queryOpenAI(text, "", systemPrompt);

        const [categoryLine, subcategoryLine] = aiMessage.split('\n');

        const category = categoryLine.replace('Category: ', '').trim();
        const subcategory = subcategoryLine.replace('Subcategory: ', '').trim();

        // 2. Return
        res.status(200).json({
            category: category,
            subcategory: subcategory
        });

    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

// Transcribe voice to text
router.post('/transcribeAndClassify', upload.single('audioFile'), async (req, res) => {
    try {
        // Check if file exists
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file uploaded' });
        }

        const file = await toFile(Buffer.from(req.file.buffer), 'audio.mp3');

        // Transcribe audio
        const transcription = await transcribeAudio(file);

        // Classify transcribed text'../utils/api'
        const systemPrompt = `You are a helpful assistant that classifies customer inquiries for a telecom company. 
            Here are the categories and subcategories for classification:
            
            Category: Account & Subscriptions
              1) Change credit limit
              2) Change postpaid plan
              3) Rewards-related issue
              4) Voicemail and missed call alerts activation/deactivation
              5) Stop non-Digi/Celcom charges/subscriptions
              6) Reinstate terminated prepaid line for CelcomDigi
              7) Others
  
            Category: Call, Internet, SMS and OTP issues
              1) Call quality 
              2) Coverage
              3) Internet slowness
              4) Unable to receive OTP/TAC
  
            Category: Internet Quota
              1) {Insert details}
  
            Category: Reload & Prepaid
              1) Reload-related issue 
              2) Others
  
            Category: Roaming
              1) Unable to use/connect roaming
              2) Others
  
            Category: Switching to CelcomDigi
              1) Resubmit port-in request
              2) Others
  
            Category: Billing
              1) I don't agree with my bill (non-scam related)
              2) I don't agree with my bill (suspected scam)
              3) Others
  
            Category: Fibre
              1) No service
              2) Internet slowness (Fibre)
              3) Others (Fibre)
              4) Relocation request
  
            Category: Products & Offerings
              1) {Provide details}
  
            Category: Report a scam/fraud
              1) Scam call
              2) SMS spam/SMS scam 
              3) Scam URL/QR Code
              4) Missed calls from international numbers
  
            Category: SIM & Devices
              1) Blocked device due to non-payment of Digi bill
              2) Others
  
            Classify the following inquiry into the most appropriate category and subcategory. Return the classification in the following format:
            Category: <category>
            Subcategory: <subcategory>`;

        const aiMessage = await queryOpenAI(transcription, "", systemPrompt);

        const [categoryLine, subcategoryLine] = aiMessage.split('\n');

        const category = categoryLine.replace('Category: ', '').trim();
        const subcategory = subcategoryLine.replace('Subcategory: ', '').trim();

        // Return both transcription and classification
        res.status(200).json({
            transcript: transcription,
            classification: { category, subcategory }
        });
    } catch (error) {
        console.error('Error processing voice issue:', error);
        res.status(500).json({ error: 'An error occurred while processing the voice issue' });
    }
});

router.use('/data', express.static(path.join(__dirname, 'data.json')));

module.exports = router;