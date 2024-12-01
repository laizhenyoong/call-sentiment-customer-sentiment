import React, { useState, useEffect } from 'react';
import { Box, Fab } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import ChatBot from './ChatBot';
import EmotionAnalysis from './EmotionAnalysis';
import FloatingCustomerChat from './FloatingCustomerChat';
import { checkTopics, getAdminSentiment, getCustomerSentiment } from '../utils/api';
import { formatTime } from '../utils/hooks';

const RealTime = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [checklist, setChecklist] = useState([
    { text: 'Wish the customer well', checked: false },
    { text: 'Identify Customer Needs', checked: false },
    { text: 'Empathize with Customer Concerns', checked: false },
    { text: 'Solve customer problem', checked: false },
    { text: 'Express Gratitude', checked: false },
    { text: 'Summarize the conversation', checked: false },
  ]);
  const checklistTopics = checklist
    .map((item, index) => `${index + 1}. ${item.text}`)
    .join('\n');
  const [emotionData, setEmotionData] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prevDuration => prevDuration + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const updateEmotionData = (score) => {
    setEmotionData(prevData => [
      ...prevData,
      { time: new Date().toLocaleTimeString(), score }
    ]);
  };

  const handleSendMessage = async (text, sender) => {
    if (text.trim() === '') return;

    let sentiment, sentimentScore;

    if (sender === 'admin') {
      const adminSentimentData = await getAdminSentiment(text);
      console.log(adminSentimentData)
      sentiment = adminSentimentData.admin_sentiment;
      sentimentScore = adminSentimentData.admin_sentiment_score;
    } else {
      const customerSentimentData = await getCustomerSentiment(text);
      console.log(customerSentimentData)
      sentiment = customerSentimentData.customer_sentiment;
      sentimentScore = customerSentimentData.customer_sentiment_score;
      updateEmotionData(sentimentScore);
    }

    const newMessage = {
      text,
      sender,
      timestamp: new Date().toLocaleTimeString(),
      sentiment: sentiment,
      sentimentScore: sentimentScore,
    };

    setMessages([...messages, newMessage]);

    if (sender === 'admin') {
      setInput('');
      try {
        const data = await checkTopics(text, checklistTopics);
        let responseString = data.aiResponse;
        let mentionedTopics = responseString.split(',').map(num => Number(num) - 1);

        setChecklist(prevChecklist =>
          prevChecklist.map((topic, index) => ({
            ...topic,
            checked: topic.checked || mentionedTopics.includes(index)
          }))
        );
      } catch (error) {
        console.error('Error checking topics:', error);
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Box sx={{ flex: 1, borderRight: '1px solid #ccc' }}>
        <ChatBot
          messages={messages}
          handleSendMessage={(e) => {
            e.preventDefault();
            handleSendMessage(input, 'admin');
          }}
          input={input}
          setInput={setInput}
          callDuration={callDuration}
          formatTime={formatTime}
        />
      </Box>
      <Box sx={{ flex: 1 }}>
        <EmotionAnalysis
          checklist={checklist}
          emotionData={emotionData}
        />
      </Box>
      {isChatOpen ? (
        <FloatingCustomerChat
          messages={messages}
          onSendMessage={handleSendMessage}
          onClose={() => setIsChatOpen(false)}
        />
      ) : (
        <Fab
          color="secondary"
          aria-label="chat"
          style={{
            position: 'fixed',
            bottom: '2.5rem',
            right: '2rem',
          }}
          onClick={() => setIsChatOpen(true)}
        >
          <ChatIcon />
        </Fab>
      )}
    </Box>
  );
};

export default RealTime;
