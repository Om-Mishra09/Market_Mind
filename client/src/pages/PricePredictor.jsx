import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

// --- This is the price formatter we talked about! ---
// You can put this in a new file like 'src/utils.js' and import it
const formatPrice = (price) => {
  if (isNaN(price)) return 'N/A';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
};
// ---

function PricePredictor() {
  // NEW state to hold the form data
  const [formData, setFormData] = useState({
    category: 'Electronics', // A category from the new data
    rating: 4.0,
    rating_count: 5000,
  });

  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: (name === 'category') ? value : parseFloat(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setPrediction(null);
    setError(null);

    try {
      // Send the NEW formData object (use your correct port, e.g., 8000)
      const response = await axios.post(`${API_BASE_URL}/api/predict`, formData);

      if (response.data.error) {
        setError(response.data.error);
      } else {
        setPrediction(response.data.predicted_price);
      }
    } catch (err) {
      setError('Failed to contact prediction server.');
    } finally {
      setIsLoading(false);
    }
  };

  // (All the style objects are the same)
  const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', margin: '0 auto', padding: '2rem', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' };
  const inputStyle = { padding: '10px', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ddd' };
  const buttonStyle = { padding: '12px', fontSize: '1.1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
  const resultStyle = { marginTop: '20px', padding: '1rem', fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#e6f7ff', borderRadius: '8px' };
  const errorStyle = { ...resultStyle, backgroundColor: '#fff0f0', color: '#d90000' };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>AI Price Predictor (Real Data)</h1>

      <form onSubmit={handleSubmit} style={formStyle}>
        <div>
          <label>Category:</label>
          {/* You should ideally populate this from your data, but for now, text is fine */}
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            style={inputStyle}
            placeholder="e.g. Electronics, Home & Kitchen"
          />
        </div>

        <div>
          <label>Rating (1.0 - 5.0):</label>
          <input
            type="number"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            style={inputStyle}
            step="0.1"
            min="1"
            max="5"
          />
        </div>

        <div>
          <label>Number of Ratings:</label>
          <input
            type="number"
            name="rating_count"
            value={formData.rating_count}
            onChange={handleChange}
            style={inputStyle}
            step="1"
            min="0"
          />
        </div>

        <button type="submit" style={buttonStyle} disabled={isLoading}>
          {isLoading ? 'Predicting...' : 'Get Predicted Price'}
        </button>
      </form>

      {/* --- Prediction Result Section --- */}
      {prediction && (
        <div style={resultStyle}>
          {/* Use the new formatter! */}
          Predicted Price: {formatPrice(prediction)}
        </div>
      )}

      {/* --- Error Display Section --- */}
      {error && (
        <div style={errorStyle}>
          Error: {error}
        </div>
      )}
    </div>
  );
}

export default PricePredictor;