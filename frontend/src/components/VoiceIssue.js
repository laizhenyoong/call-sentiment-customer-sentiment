import React, { useState, useRef } from 'react';
import { Button, Card, CardContent, Typography, Box, Alert, AlertTitle } from '@mui/material';
import { Microphone, StopCircle } from 'phosphor-react';
import { styled } from '@mui/material/styles';
import { transcribeAndClassifyVoice } from '../utils/api';

const GradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
  marginBottom: theme.spacing(2)
}));

const BrandBar = styled(Box)(({ color }) => ({
  height: 4,
  width: 60,
  backgroundColor: color,
  borderRadius: 2
}));

const VoiceIssue = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [classification, setClassification] = useState(null);
  const [error, setError] = useState(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        
        // Log file details for debugging
        console.log('Audio Blob Size:', audioBlob.size);
        console.log('Audio Blob Type:', audioBlob.type);

        try {
          const result = await transcribeAndClassifyVoice(audioBlob);
          setTranscript(result.transcript);
          setClassification(result.classification);
          setError(null);
        } catch (err) {
          setError('Failed to process audio. Please try again.');
          console.error(err);
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };


  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', padding: 2 }}>
      <Card sx={{ marginBottom: 2 }}>
        <CardContent>
          <GradientCard>
            <CardContent sx={{ padding: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography
                  variant="h4"
                  component="span"
                  sx={{
                    fontWeight: 'bold',
                    color: 'white'
                  }}
                >
                  Celcom
                </Typography>
                <Typography
                  variant="h4"
                  component="span"
                  sx={{
                    fontWeight: 'bold',
                    color: '#FFD700'
                  }}
                >
                  Digi
                </Typography>
              </Box>

              <Typography
                variant="subtitle1"
                sx={{
                  color: '#FFF4BD',
                  fontWeight: 500,
                  mb: 2
                }}
              >
                Intelligent Call Categorization
              </Typography>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <BrandBar color="#FFD700" />
                <BrandBar color="#90CAF9" />
              </Box>
            </CardContent>
          </GradientCard>
          <Button
            variant="contained"
            color={isRecording ? "error" : "primary"}
            startIcon={isRecording ? <StopCircle /> : <Microphone />}
            onClick={toggleRecording}
            fullWidth
            size="large"
            sx={{ height: 60 }}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Button>
        </CardContent>
      </Card>

      {transcript && (
        <Card sx={{ marginBottom: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Transcript
            </Typography>
            <Typography variant="body1">
              {transcript}
            </Typography>
          </CardContent>
        </Card>
      )}

      {classification && (
        <Alert severity="info">
          <AlertTitle>Classification Result</AlertTitle>
          <Typography><strong>Category:</strong> {classification.category}</Typography>
          <Typography><strong>Subcategory:</strong> {classification.subcategory}</Typography>
        </Alert>
      )}
    </Box>
  );
};

export default VoiceIssue;