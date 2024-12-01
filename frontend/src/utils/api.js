// api.js

const API_BASE_URL = 'http://localhost:5001';

export const getCustomerSentiment = async (message) => {
  try {
    const response = await fetch(`${API_BASE_URL}/customerSentiment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting sentiment for customer:', error);
    throw error;
  }
};

export const getAdminSentiment = async (message) => {
  try {
    const response = await fetch(`${API_BASE_URL}/adminSentiment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting sentiment for admin:', error);
    throw error;
  }
};

export const checkTopics = async (message, topics) => {
  try {
    const response = await fetch(`${API_BASE_URL}/checkTopics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, topics }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking topics:', error);
    throw error;
  }
};

export const queryGPT = async (queryText) => {
  try {
    const response = await fetch(`${API_BASE_URL}/queryGPT`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ queryText }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error querying GPT:', error);
    throw error;
  }
};

export const analyseData = async (chatData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyseData`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chatData }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error analysing data:', error);
    throw error;
  }
}