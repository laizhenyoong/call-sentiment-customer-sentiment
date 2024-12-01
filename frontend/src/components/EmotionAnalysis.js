import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, Button, Paper, Tabs, Tab, List, ListItem, ListItemIcon, ListItemText, Checkbox } from '@mui/material';
import { styled } from '@mui/system';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { queryGPT } from '../utils/api';

const EmotionAnalysis = ({ checklist, emotionData }) => {
  // User Input for GPT variable
  const [gptInput, setGptInput] = useState('');
  // Chat History for GPT variable
  const [chatHistory, setChatHistory] = useState([]);
  // Switch Tab Value variable
  const [tabValue, setTabValue] = useState(0);

  // Autoscroll for GPT responses
  const chatEndRef = useRef(null);
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [chatHistory]);

  // Function to submit a new GPT question
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (gptInput.trim() === '') return;

    const newQuestion = { type: 'question', text: gptInput };
    setChatHistory((prev) => [...prev, newQuestion]); // Update chat history with new question
    setGptInput('');

    try {
      const data = await queryGPT(gptInput);
      const newResponse = { type: 'response', text: data.aiResponse }; // Use AI response from server
      setChatHistory((prev) => [...prev, newResponse]); // Update chat history with AI response

    } catch (error) {
      console.error('Error querying GPT:', error);
      const errorResponse = { type: 'response', text: 'Error fetching response from the server.' };
      setChatHistory((prev) => [...prev, errorResponse]); // Add error response to chat history
    }
  };

  // Function to handle changing tabs
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Function to parse text and convert newlines and bold text
  const parseText = (text) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line.split(/(\*\*.*?\*\*)/).map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <AnalysisContainer>
      <ChartContainer elevation={3}>
        <Typography variant="h6" gutterBottom>
          Sentiment Line Chart
        </Typography>
        <Box style={{ width: '100%', height: '200px' }}>
          <ResponsiveContainer>
            <LineChart data={emotionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </ChartContainer>
      <TabContainer>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="CelcomDigi Support" />
          <Tab label="Discussion Topics Checklist" />
        </Tabs>
        {tabValue === 0 && (
          <GptContainer>
            <GptMessages>
              {chatHistory.map((message, index) => (
                <GptMessage key={index} className={message.type}>
                  <Typography variant="body2">
                    <strong>{message.type === 'question' ? 'Question:' : 'Response:'}</strong>{' '}
                    {parseText(message.text)}
                  </Typography>
                </GptMessage>
              ))}
              <div ref={chatEndRef} />
            </GptMessages>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', padding: '0.5rem' }}>
              <TextField
                fullWidth
                value={gptInput}
                onChange={(e) => setGptInput(e.target.value)}
                placeholder="Enter your question..."
                variant="outlined"
                size="small"
                sx={{ mr: 1 }}
              />
              <Button type="submit" variant="contained" color="primary">
                Send
              </Button>
            </Box>
          </GptContainer>
        )}
        {tabValue === 1 && (
          <List sx={{ overflowY: 'auto', flex: 1 }}>
            {checklist.map((item, index) => (
              <ListItem key={index} dense button>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={item.checked}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        )}
      </TabContainer>
    </AnalysisContainer>
  );
};

const AnalysisContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
});

const ChartContainer = styled(Paper)({
  flex: '0 0 40%',
  margin: '0.5rem',
  padding: '0.5rem',
  display: 'flex',
  flexDirection: 'column',
});

const TabContainer = styled(Box)({
  flex: '1 1 60%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

const GptContainer = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

const GptMessages = styled(Box)({
  flexGrow: 1,
  overflowY: 'auto',
  padding: '0.5rem',
  height: '300px',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#888',
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: '#555',
  },
});

const GptMessage = styled(Box)({
  marginBottom: '0.5rem',
  padding: '0.5rem',
  borderRadius: '4px',
  backgroundColor: '#f0f0f0',
  '&.response': {
    backgroundColor: '#e6f3ff',
  },
});

export default EmotionAnalysis;
