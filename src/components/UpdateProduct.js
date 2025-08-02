import React, { useState } from "react";
import axios from "axios";
import "./ProductActions.css";
import Navbar from './Navbar';
import Footer from './Footer';

const UpdateProduct = () => {
  const [formData, setFormData] = useState({
    productId: "",
    newName: "",
    newTotal: "",
    onlineQty: "",
    price: "",
    offlineAllocations: [{ manager_id: "", quantity: "" }]
  });
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOfflineChange = (index, field, value) => {
    const updated = [...formData.offlineAllocations];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, offlineAllocations: updated }));
  };

  const addOfflineField = () => {
    setFormData(prev => ({
      ...prev,
      offlineAllocations: [...prev.offlineAllocations, { manager_id: "", quantity: "" }]
    }));
  };

  const removeOfflineField = (index) => {
    const updated = formData.offlineAllocations.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, offlineAllocations: updated }));
  };

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const resetForm = () => {
    setFormData(prev => ({
      productId: prev.productId,
      newName: "",
      newTotal: "",
      onlineQty: "",
      offlineAllocations: [{ manager_id: "", quantity: "" }]
    }));
    setImage(null);
    setMessage({ text: "", type: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    // Parse and validate numeric values
    const total = parseInt(formData.newTotal);
    const online = parseInt(formData.onlineQty);
    const offlineSum = formData.offlineAllocations.reduce((sum, alloc) => sum + parseInt(alloc.quantity || 0), 0);

    if (isNaN(total) || isNaN(online)) {
      setMessage({ text: "Please enter valid numbers for total and online quantities.", type: "error" });
      setIsLoading(false);
      return;
    }

    if (offlineSum + online > total) {
      setMessage({
        text: "Offline + Online quantities exceed the total quantity.",
        type: "error"
      });
      setIsLoading(false);
      return;
    }

    try {
      let base64Image = null;
      if (image) base64Image = await convertImageToBase64(image);

      await axios.post("http://localhost:5000/warehouse/update_product", {
  product_id: formData.productId,
  name: formData.newName,
  total_quantity: total,
  online_quantity: online,
  price: parseFloat(formData.price),  // <-- ADDED
  offline_allocations: formData.offlineAllocations.map(a => ({
    manager_id: a.manager_id,
    quantity: parseInt(a.quantity)
  })),
  image_base64: base64Image
});


      setMessage({ text: "Product updated successfully!", type: "success" });
      resetForm();
    } catch (err) {
      console.error(err);
      setMessage({
        text: err.response?.data?.message || "Error updating product.",
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="product-management-container">
        <div className="management-card">
          <h2 className="card-title">Update Product</h2>
          <p className="card-subtitle">Modify existing product details and allocations</p>

          {message.text && (
            <div className={`notification ${message.type}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-group">
              <label htmlFor="productId">Product ID</label>
              <input
                id="productId"
                type="text"
                name="productId"
                placeholder="Enter product ID"
                required
                value={formData.productId}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="newName">New Product Name</label>
              <input
                id="newName"
                type="text"
                name="newName"
                placeholder="Enter new name"
                value={formData.newName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
  <label htmlFor="price">New Price</label>
  <input
    id="price"
    type="number"
    name="price"
    placeholder="Enter new price"
    min="0"
    value={formData.price}
    onChange={handleChange}
  />
</div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="newTotal">Total Quantity</label>
                <input
                  id="newTotal"
                  type="number"
                  name="newTotal"
                  placeholder="Enter total quantity"
                  min="0"
                  value={formData.newTotal}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="onlineQty">Online Quantity</label>
                <input
                  id="onlineQty"
                  type="number"
                  name="onlineQty"
                  placeholder="Enter online quantity"
                  min="0"
                  value={formData.onlineQty}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="productImage">Product Image</label>
              <input
                id="productImage"
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="file-input"
              />
              {image && (
                <div className="image-preview">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                    className="preview-image"
                  />
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    className="remove-image-btn"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <div className="allocations-section">
              <h4 className="section-title">
                <span>Offline Store Allocations</span>
              </h4>

              {formData.offlineAllocations.map((alloc, idx) => (
                <div key={idx} className="allocation-group">
                  <div className="form-group">
                    <label htmlFor={`manager-${idx}`}>Manager ID</label>
                    <input
                      id={`manager-${idx}`}
                      type="text"
                      placeholder="Enter manager ID"
                      value={alloc.manager_id}
                      onChange={(e) => handleOfflineChange(idx, "manager_id", e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor={`quantity-${idx}`}>Quantity</label>
                    <input
                      id={`quantity-${idx}`}
                      type="number"
                      placeholder="Enter quantity"
                      min="0"
                      value={alloc.quantity}
                      onChange={(e) => handleOfflineChange(idx, "quantity", e.target.value)}
                    />
                  </div>
                  {formData.offlineAllocations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOfflineField(idx)}
                      className="remove-allocation-btn"
                      aria-label="Remove allocation"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addOfflineField}
                className="add-allocation-btn"
              >
                + Add Store Allocation
              </button>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span> Updating...
                  </>
                ) : (
                  'Update Product'
                )}
              </button>
              <button
                type="button"
                className="reset-btn"
                onClick={resetForm}
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UpdateProduct;
