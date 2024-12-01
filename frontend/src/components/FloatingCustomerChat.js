import React, { useState } from 'react';
import { Paper, Typography, TextField, Button, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const FloatingCustomerChat = ({ messages, onSendMessage, onClose }) => {
  const [customerInput, setCustomerInput] = useState('');

  const handleSendCustomerMessage = (e) => {
    e.preventDefault();
    if (customerInput.trim() === '') return;

    onSendMessage(customerInput, 'customer');
    setCustomerInput('');
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        width: 300,
        height: 400,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Customer Chat</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        {messages.map((message, index) => (
          <Box key={index} sx={{ mb: 1, textAlign: message.sender === 'customer' ? 'right' : 'left' }}>
            <Typography variant="body2" sx={{ backgroundColor: message.sender === 'customer' ? '#e3f2fd' : '#f5f5f5', p: 1, borderRadius: 1, display: 'inline-block' }}>
              {message.text}
            </Typography>
            <Typography variant="caption" display="block">{message.timestamp}</Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ p: 2, borderTop: '1px solid #ccc' }}>
        <form onSubmit={handleSendCustomerMessage}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            value={customerInput}
            onChange={(e) => setCustomerInput(e.target.value)}
            placeholder="Type a message..."
            sx={{ mb: 1 }}
          />
          <Button type="submit" color="secondary" variant="contained" fullWidth>
            Send
          </Button>
        </form>
      </Box>
    </Paper>
  );
};

export default FloatingCustomerChat;