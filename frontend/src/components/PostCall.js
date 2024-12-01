import React, { useState, useEffect } from 'react';
import { Box, Typography, Tabs, Tab, Paper, Grid, List, ListItem, LinearProgress, CircularProgress } from '@mui/material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import FavoriteIcon from '@mui/icons-material/Favorite';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import TimerIcon from '@mui/icons-material/Timer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Component for AI Insight Items
const AIInsightItem = ({ name, score }) => {
  const getColor = (score) => (score > 80 ? 'success' : score > 40 ? 'warning' : 'error');

  return (
    <ListItem>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" noWrap>{name}</Typography> {/* Set noWrap to prevent text overflow */}
          <Typography variant="body2" color="text.secondary">{score}%</Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={score}
          color={getColor(score)}
          sx={{ height: 8, borderRadius: 5 }}
        />
      </Box>
    </ListItem>
  );
};

const PostCall = () => {
  const [tabValue, setTabValue] = useState(0);
  const [callData, setCallData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5001/data')
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then((data) => {
        setCallData(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const handleTabChange = (_, newValue) => setTabValue(newValue);

  if (loading) return <Typography>Loading data...</Typography>;
  if (error) return <Typography>Error fetching data: {error}</Typography>;
  if (!callData) return <Typography>No data available</Typography>;

  const {
    overallSummary,
    agentSummary,
    customerSummary,
    conversationalInsight,
    overallPerformance,
    aiInsight,
    timeConsumption,
    topicsDiscussed
  } = callData;

  const aiInsights = [
    { name: 'Introduction', score: aiInsight.introduction },
    { name: 'Recommendations from agents', score: aiInsight.recommendation },
    { name: 'Thank you message', score: aiInsight.thankYouMessage },
    { name: 'Attitude', score: aiInsight.attitude },
    { name: 'Communication skills', score: aiInsight.communicationSkills }
  ];

  const topicData = Object.entries(topicsDiscussed).map(([name, value]) => ({ name, value }));
  const timeTaken = `${timeConsumption.agent + timeConsumption.customer + timeConsumption.notTalking} seconds`;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const getHeartColor = (score) => (score > 80 ? 'green' : score > 40 ? 'yellow' : 'red');
  const getPerformanceColor = getHeartColor;

  return (
    <Box sx={{ padding: 2, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" gutterBottom>Post-Conversation Analysis</Typography>
      <Grid container spacing={2} sx={{ flexGrow: 1 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 2, height: 'calc(33% - 8px)' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Overall Summary" />
              <Tab label="Agent Summary" />
              <Tab label="Customer Summary" />
            </Tabs>
            <Box sx={{ mt: 2, overflow: 'auto', maxHeight: 'calc(100% - 48px)' }}>
              {tabValue === 0 && <Typography>{overallSummary}</Typography>}
              {tabValue === 1 && <Typography>{agentSummary}</Typography>}
              {tabValue === 2 && <Typography>{customerSummary}</Typography>}
            </Box>
          </Paper>
          <Paper sx={{ p: 2, mb: 2, height: 'calc(33% - 8px)' }}>
            <Typography variant="h6" gutterBottom>Conversation Insights</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={3}>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <FavoriteIcon sx={{ color: getHeartColor(conversationalInsight.csatScore), fontSize: 40, mb: 1 }} />
                  <Typography variant="body2" align="center">CSAT: {conversationalInsight.csatScore}</Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <CheckCircleIcon sx={{ color: 'green', fontSize: 40, mb: 1 }} />
                  <Typography variant="body2" align="center">{conversationalInsight.conversationResult}</Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <EmojiEmotionsIcon sx={{ color: 'orange', fontSize: 40, mb: 1 }} />
                  <Typography variant="body2" align="center">{conversationalInsight.customerSentiment}</Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <TimerIcon sx={{ color: 'blue', fontSize: 40, mb: 1 }} />
                  <Typography variant="body2" align="center">{timeTaken}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          <Paper sx={{ p: 2, height: 'calc(33% - 8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress 
                variant="determinate" 
                value={overallPerformance} 
                size={60} 
                thickness={4}
                sx={{ color: getPerformanceColor(overallPerformance) }} 
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="caption" component="div" color="text.secondary">
                  {`${Math.round(overallPerformance)}%`}
                </Typography>
              </Box>
            </Box>
            <Typography variant="h6" sx={{ ml: 2 }}>Overall Performance</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Grid container spacing={2} sx={{ height: '100%' }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%', overflow: 'auto' }}>
                <Typography variant="h6" gutterBottom>Agent Performance</Typography>
                <List dense>
                  {aiInsights.map((insight, index) => (
                    <AIInsightItem key={index} name={insight.name} score={insight.score} />
                  ))}
                </List>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Paper sx={{ p: 2, mb: 2, flex: 1 }}>
                <Typography variant="h6" gutterBottom>Topics Discussed</Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={topicData}
                      cx="50%"
                      cy="50%"
                      innerRadius="40%"
                      outerRadius="70%"
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {topicData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
              <Paper sx={{ p: 2, flex: 1 }}>
                <Typography variant="h6" gutterBottom>Time Consumption</Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={[timeConsumption]}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="agent" fill="#8884d8" />
                    <Bar dataKey="customer" fill="#82ca9d" />
                    <Bar dataKey="notTalking" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PostCall;
