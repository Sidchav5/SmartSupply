import React, { useState } from "react";
import "./PredictPrice.css";
import Navbar from "./Navbar";

const PredictPrice = () => {
  const [formData, setFormData] = useState({
    base_price: "",
    demand: "",
    stock: "",
    day_of_week: "",
    season: "Spring",
    discount: "",
    product_name: "",
    days: ""
  });

  const [predictedPrice, setPredictedPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPredictedPrice(null);

    try {
      const response = await fetch("http://localhost:5000/predict_price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Prediction failed. Please try again.');
      }

      const data = await response.json();
      setPredictedPrice(data.predicted_price);
    } catch (error) {
      console.error("Error fetching prediction:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="predict-container">
        <div className="predict-header">
          <h2>🎯 Smart Price Prediction</h2>
          <p>Get AI-powered price recommendations for your products</p>
        </div>
        
        <form className="predict-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">💰</span>
                Base Price
              </label>
              <input
                type="number"
                name="base_price"
                value={formData.base_price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="form-input"
                placeholder="Enter base price"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">📈</span>
                Demand Level
              </label>
              <input
                type="number"
                name="demand"
                value={formData.demand}
                onChange={handleChange}
                required
                min="0"
                className="form-input"
                placeholder="Expected demand"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">📦</span>
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                min="0"
                className="form-input"
                placeholder="Available stock"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">📅</span>
                Day of Week
              </label>
              <select 
                name="day_of_week" 
                value={formData.day_of_week} 
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Select day</option>
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
                <option value="5">Friday</option>
                <option value="6">Saturday</option>
                <option value="7">Sunday</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🌤️</span>
                Season
              </label>
              <select 
                name="season" 
                value={formData.season} 
                onChange={handleChange}
                className="form-select"
              >
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
                <option value="Monsoon">Monsoon</option>
                <option value="Winter">Winter</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🎁</span>
                Discount (%)
              </label>
              <input
                type="number"
                step="0.01"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                required
                min="0"
                max="100"
                className="form-input"
                placeholder="0-100%"
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">
                <span className="label-icon">🏷️</span>
                Product Name
              </label>
              <input
                type="text"
                name="product_name"
                value={formData.product_name}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter product name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">⏰</span>
                Days in Stock
              </label>
              <input
                type="number"
                name="days"
                value={formData.days}
                onChange={handleChange}
                required
                min="0"
                className="form-input"
                placeholder="Days since stocked"
              />
            </div>
          </div>

          <button type="submit" className="predict-button" disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Predicting...
              </>
            ) : (
              <>
                <span className="button-icon">🔮</span>
                Predict Optimal Price
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {predictedPrice && (
          <div className="result-card">
            <div className="result-header">
              <h3>🎯 Recommended Price</h3>
              <div className="price-badge">AI SUGGESTED</div>
            </div>
            <div className="price-display">
              <span className="currency">₹</span>
              <span className="price">{parseFloat(predictedPrice).toFixed(2)}</span>
            </div>
            <div className="result-footer">
              <p>This price optimizes for both profit and customer conversion</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PredictPrice;