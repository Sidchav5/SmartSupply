import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./WarehouseAvailability.css";

export default function WarehouseAvailability() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

useEffect(() => {
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/warehouse/availability", {
        params: { search: searchTerm }
      });
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load product data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  fetchProducts();
}, [searchTerm]); // 👈 fetch products whenever searchTerm changes

  const filteredProducts = products; // Just use the backend response



  const calculateAvailablePercentage = (product) => {
    const allocated = product.offline_store_allocations.reduce(
      (sum, alloc) => sum + Number(alloc.quantity), 0
    ) + Number(product.online_quantity);
    return Math.round((allocated / product.total_quantity) * 100);
  };

  return (
    <>
      <Navbar />
      <div className="availability-container">
        <div className="availability-header">
          <h2>Product Availability Dashboard</h2>
          <p>Real-time inventory status across all channels</p>
          
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
            <p>Loading product data...</p>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : filteredProducts.length === 0 ? (
          <div className="no-results">
            <p>No products found matching your search.</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div className="product-card" key={product.id}>
                <div className="card-image-container">
                  <img
  src={
    product.image_base64
      ? `data:image/png;base64,${product.image_base64}`
      : `https://source.unsplash.com/random/300x200/?${encodeURIComponent(product.name)},product`
  }
  alt={product.name}
  className="card-image"
/>

                  {/* <div className="availability-badge">
                    {calculateAvailablePercentage(product)}% Allocated
                  </div> */}
                </div>
                
                <div className="card-content">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-meta">
                    <span className="product-id">ID: {product.id}</span>
                    <span className="product-date">
                      Added: {new Date(product.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="inventory-stats">
                    <div className="stat-item">
                      <span className="stat-label">Total:</span>
                      <span className="stat-value">{product.total_quantity}</span>
                    </div>
                    <div className="stat-item online">
                      <span className="stat-label">Online:</span>
                      <span className="stat-value">{product.online_quantity}</span>
                    </div>
                    <div className="stat-item offline">
  <span className="stat-label">Sold (Offline):</span>
  <span className="stat-value">{product.offline_left}</span>
</div>
                  </div>
                  
                  <div className="offline-allocations">
                    <h4>Store Allocations</h4>
                    {product.offline_store_allocations.length === 0 ? (
                      <p className="no-allocations">No store allocations</p>
                    ) : (
                      <ul className="allocation-list">
                        {product.offline_store_allocations.map((alloc) => (
                          <li key={alloc.manager_id} className="allocation-item">
                            <span className="store-id">{alloc.manager_id}</span>
                            <span className="store-qty">{alloc.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    )}
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