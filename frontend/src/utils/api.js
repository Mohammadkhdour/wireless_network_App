// API utility for communicating with the Python backend

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3000/api';

export const fetchAIExplanation = async (scenario, inputs, results) => {
  try {
    const response = await fetch(`${API_BASE_URL}/explain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scenario,
        inputs,
        results
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      return { success: true, explanation: data.explanation };
    } else {
      return { 
        success: false, 
        explanation: 'Unable to generate AI explanation at this time. Please check your backend connection.' 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      explanation: 'Unable to connect to AI explanation service. Please ensure the backend is running.' 
    };
  }
};

