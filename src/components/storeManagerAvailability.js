import React, { useEffect, useState } from "react";
import axios from "axios";
import "./StoreAvailability.css";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function StoreAvailability() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const managerId = localStorage.getItem("manager_id");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/store/availability", {
          params: { manager_id: managerId }
        });
        setProducts(res.data);
      } catch (err) {
        console.error("Error loading availability:", err);
        setError("Failed to load inventory data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [managerId]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toString().includes(searchTerm)
  );

  const calculateStockPercentage = (allocated, current) => {
    return Math.round((current / allocated) * 100);
  };

  return (
    <>
      <Navbar />
      <div className="inventory-dashboard">
        <div className="dashboard-header">
          <h1>Store Inventory Dashboard</h1>
          <p className="dashboard-subtitle">Real-time product availability at your store location</p>
          
          <div className="search-container">
            <input
              type="text"
              placeholder="Search products by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading inventory data...</p>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : filteredProducts.length === 0 ? (
          <div className="no-results">
            <p>No products found matching your search.</p>
          </div>
        ) : (
          <div className="inventory-grid">
            {filteredProducts.map(product => (
              <div className="inventory-card" key={product.id}>
                <div className="card-image-container">
                  <img
                    src={
                      product.image_base64
                        ? `data:image/png;base64,${product.image_base64}`
                        : `https://source.unsplash.com/random/600x400/?${encodeURIComponent(product.name)},product`
                    }
                    alt={product.name}
                    className="product-image"
                  />
                  {/* <div className="stock-badge">
                    {calculateStockPercentage(product.allocated, product.current_stock)}% in stock
                  </div> */}
                </div>
                
                <div className="card-content">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-meta">
                    <span className="product-id">ID: {product.id}</span>
                  </div>
                  
                  <div className="inventory-stats">
                    <div className="stat-item allocated">
                      <span className="stat-label">Allocated</span>
                      <span className="stat-value">{product.allocated}</span>
                    </div>
                    <div className="stat-item current">
                      <span className="stat-label">Current</span>
                      <span className="stat-value">{product.current_stock}</span>
                    </div>
                  </div>
                  
                  <div className="stock-meter">
                    <div 
                      className="meter-fill"
                      style={{
                        width: `${calculateStockPercentage(product.allocated, product.current_stock)}%`,
                        backgroundColor: calculateStockPercentage(product.allocated, product.current_stock) < 30 ? '#ff3860' : '#4CAF50'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}