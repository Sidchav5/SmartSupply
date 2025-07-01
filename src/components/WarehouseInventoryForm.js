import React, { useState } from 'react';
import axios from 'axios';
import './WarehouseInventoryForm.css';
import Navbar from './Navbar';
import Footer from './Footer';

function WarehouseInventoryForm() {
  const [product, setProduct] = useState({
  product_id: '',
  name: '',
  total_quantity: '',
  online_quantity: '',
  offline_allocations: [{ manager_id: '', quantity: '' }],
  image_base64: ''
});


  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validate = () => {
    const newErrors = {};
    
    if (!product.product_id) newErrors.product_id = 'Product ID is required';
    if (!product.name) newErrors.name = 'Product name is required';
    if (!product.total_quantity || product.total_quantity < 0) 
      newErrors.total_quantity = 'Valid total quantity is required';
    if (!product.online_quantity || product.online_quantity < 0 || 
        Number(product.online_quantity) > Number(product.total_quantity)) 
      newErrors.online_quantity = 'Online quantity must be ≤ total quantity';
    
    product.offline_allocations.forEach((alloc, index) => {
      if (!alloc.manager_id) 
        newErrors[`manager_id_${index}`] = 'Manager ID is required';
      if (!alloc.quantity || alloc.quantity < 0) 
        newErrors[`quantity_${index}`] = 'Valid quantity is required';
    });

    const totalAllocated = product.offline_allocations.reduce(
      (sum, alloc) => sum + Number(alloc.quantity || 0), 0
    ) + Number(product.online_quantity || 0);
    
    if (totalAllocated > Number(product.total_quantity)) {
      newErrors.allocation = 'Total allocated exceeds available quantity';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setProduct({ ...product, image_base64: reader.result.split(',')[1] }); // Store base64 only
    };
    reader.readAsDataURL(file);
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
    // Clear error when user types
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleAllocationChange = (index, field, value) => {
    const updatedAllocations = [...product.offline_allocations];
    updatedAllocations[index][field] = value;
    setProduct({ ...product, offline_allocations: updatedAllocations });
    // Clear error when user types
    if (errors[`${field}_${index}`]) {
      setErrors({ ...errors, [`${field}_${index}`]: '' });
    }
  };

  const addAllocation = () => {
    setProduct({
      ...product,
      offline_allocations: [...product.offline_allocations, { manager_id: '', quantity: '' }]
    });
  };

  const removeAllocation = (index) => {
    const updatedAllocations = [...product.offline_allocations];
    updatedAllocations.splice(index, 1);
    setProduct({ ...product, offline_allocations: updatedAllocations });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:5000/warehouse/add_product', product);
      setSuccessMessage('Product and stock allocation added successfully!');
      setProduct({
        product_id: '',
        name: '',
        total_quantity: '',
        online_quantity: '',
        offline_allocations: [{ manager_id: '', quantity: '' }]
      });
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error(err);
      setErrors({ submit: err.response?.data?.message || 'Error while adding product' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar/>
      <div className="inventory-form-container">
        <div className="form-card">
          <h2 className="form-title">Warehouse Stock Allocation</h2>
          <p className="form-subtitle">Manage product inventory and distribution</p>
          
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}
          
          {errors.submit && (
            <div className="error-message">{errors.submit}</div>
          )}
          
          {errors.allocation && (
            <div className="error-message">{errors.allocation}</div>
          )}

          <form onSubmit={handleSubmit} className="inventory-form">
            <div className="form-group">
              <label htmlFor="product_id">Product ID</label>
              <input
                id="product_id"
                name="product_id"
                placeholder="Enter product ID"
                value={product.product_id}
                onChange={handleChange}
                className={errors.product_id ? 'input-error' : ''}
              />
              {errors.product_id && <span className="error-text">{errors.product_id}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="name">Product Name</label>
              <input
                id="name"
                name="name"
                placeholder="Enter product name"
                value={product.name}
                onChange={handleChange}
                className={errors.name ? 'input-error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
  <label htmlFor="image">Product Image</label>
  <input
    id="image"
    name="image"
    type="file"
    accept="image/*"
    onChange={(e) => handleImageUpload(e)}
  />
</div>


            <div className="form-row">
              <div className="form-group">
                <label htmlFor="total_quantity">Total Quantity</label>
                <input
                  id="total_quantity"
                  name="total_quantity"
                  type="number"
                  min="0"
                  placeholder="Total available"
                  value={product.total_quantity}
                  onChange={handleChange}
                  className={errors.total_quantity ? 'input-error' : ''}
                />
                {errors.total_quantity && <span className="error-text">{errors.total_quantity}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="online_quantity">Online Quantity</label>
                <input
                  id="online_quantity"
                  name="online_quantity"
                  type="number"
                  min="0"
                  placeholder="Online store"
                  value={product.online_quantity}
                  onChange={handleChange}
                  className={errors.online_quantity ? 'input-error' : ''}
                />
                {errors.online_quantity && <span className="error-text">{errors.online_quantity}</span>}
              </div>
            </div>

            <div className="allocations-section">
              <h4 className="section-title">Offline Store Allocations</h4>
              
              {product.offline_allocations.map((alloc, index) => (
                <div key={index} className="allocation-group">
                  <div className="form-group">
                    <label htmlFor={`manager_id_${index}`}>Manager ID</label>
                    <input
                      id={`manager_id_${index}`}
                      placeholder="Manager ID"
                      value={alloc.manager_id}
                      onChange={(e) => handleAllocationChange(index, 'manager_id', e.target.value)}
                      className={errors[`manager_id_${index}`] ? 'input-error' : ''}
                    />
                    {errors[`manager_id_${index}`] && (
                      <span className="error-text">{errors[`manager_id_${index}`]}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor={`quantity_${index}`}>Quantity</label>
                    <input
                      id={`quantity_${index}`}
                      type="number"
                      min="0"
                      placeholder="Quantity"
                      value={alloc.quantity}
                      onChange={(e) => handleAllocationChange(index, 'quantity', e.target.value)}
                      className={errors[`quantity_${index}`] ? 'input-error' : ''}
                    />
                    {errors[`quantity_${index}`] && (
                      <span className="error-text">{errors[`quantity_${index}`]}</span>
                    )}
                  </div>

                  {product.offline_allocations.length > 1 && (
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeAllocation(index)}
                      aria-label="Remove allocation"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addAllocation}
                className="add-btn"
              >
                + Add Store Allocation
              </button>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Allocation'}
            </button>
          </form>
        </div>
      </div>
      <Footer/>
    </>
  );
}

export default WarehouseInventoryForm;