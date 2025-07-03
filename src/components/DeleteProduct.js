import React, { useState } from "react";
import axios from "axios";
import "./ProductActions.css";
import Navbar from "./Navbar";
import Footer from "./Footer";

const DeleteProduct = () => {
  const [productId, setProductId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = async () => {
    if (!productId) {
      setMessage({ text: "Please enter a product ID", type: "error" });
      return;
    }

    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      await axios.delete(`http://localhost:5000/warehouse/delete_product/${productId}`);
      setMessage({ text: "Product deleted successfully!", type: "success" });
      setProductId("");
      setConfirmOpen(false);
    } catch (err) {
      console.error(err);
      setMessage({ 
        text: err.response?.data?.message || "Error deleting product", 
        type: "error" 
      });
      setConfirmOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <Navbar/>
    <div className="product-management-container">
      <div className="management-card danger">
        <h2 className="card-title">Delete Product</h2>
        <p className="card-subtitle">Permanently remove a product from the system</p>

        {message.text && (
          <div className={`notification ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="delete-form">
          <div className="form-group">
            <label htmlFor="deleteProductId">Product ID</label>
            <input
              id="deleteProductId"
              type="text"
              placeholder="Enter product ID to delete"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            />
          </div>

          {!confirmOpen ? (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="delete-btn"
              disabled={!productId || isLoading}
            >
              Delete Product
            </button>
          ) : (
            <div className="confirmation-dialog">
              <p>Are you sure you want to delete this product?</p>
              <div className="confirmation-buttons">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="confirm-delete-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner"></span> Deleting...
                    </>
                  ) : (
                    'Confirm Delete'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default DeleteProduct;