import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import RealTime from './components/RealTime';
import PostCall from './components/PostCall';

const theme = createTheme({
  // You can customize the theme here if needed
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/real-time" element={<RealTime />} />
          <Route path="/post-call" element={<PostCall />} />
          <Route path="/" element={<Navigate replace to="/real-time" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
