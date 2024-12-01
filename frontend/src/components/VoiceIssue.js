import React, { useState, useRef } from 'react';
import { Button, Card, CardContent, Typography, Box, Alert, AlertTitle } from '@mui/material';
import { Microphone, StopCircle } from 'phosphor-react';
import { styled } from '@mui/material/styles';
import OpenAI from 'openai';
 
// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: "",
  dangerouslyAllowBrowser: true
});

// Function for OpenAI API transcription
const transcribeAudio = async (audioBlob) => {
  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-1');

    const response = await openai.audio.transcriptions.create({
      file: formData.get('file'),
      model: 'whisper-1',
      language: "en",
    });

    return response.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return 'Error transcribing audio';
  }
};

// Function for OpenAI API classification
const classifyText = async (text) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that classifies customer inquiries for a telecom company. 
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
          Subcategory: <subcategory>`
        },
        {
          role: "user",
          content: text
        }
      ],
      max_tokens: 150
    });

    const classificationResult = response.choices[0].message.content;
    const [categoryLine, subcategoryLine] = classificationResult.split('\n');

    const category = categoryLine.replace('Category: ', '').trim();
    const subcategory = subcategoryLine.replace('Subcategory: ', '').trim();

    return {
      category,
      subcategory
    };
  } catch (error) {
    console.error('Error classifying text:', error);
    return { category: 'Error', subcategory: 'Error classifying text' };
  }
};

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
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    audioChunks.current = [];

    mediaRecorder.current.ondataavailable = (event) => {
      audioChunks.current.push(event.data);
    };

    mediaRecorder.current.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
      const transcription = await transcribeAudio(audioBlob);
      setTranscript(transcription);
      const result = await classifyText(transcription);
      setClassification(result);
    };

    mediaRecorder.current.start();
    setIsRecording(true);
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