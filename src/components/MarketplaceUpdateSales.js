import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MarketplaceUpdateSales.css';
import Navbar from './Navbar';
import Footer from './Footer';
function MarketplaceUpdateSales({ managerId }) {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [available, setAvailable] = useState(0);
  const [alreadySold, setAlreadySold] = useState(0);
  const [soldQty, setSoldQty] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/warehouse/availability');
        const mgrProducts = res.data.filter(p =>
          p.offline_store_allocations.some(o => o.manager_id === managerId)
        );
        setProducts(mgrProducts);
      } catch (error) {
        showNotification('Failed to load products', 'error');
      }
    };

    fetchProducts();
  }, [managerId]);

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ ...notification, show: false }), 5000);
  };

  const onProductChange = async (e) => {
    const productId = e.target.value;
    if (!productId) {
      setSelected(null);
      return;
    }

    const prod = products.find(p => p.id === parseInt(productId));
    setSelected(prod);
    const alloc = prod.offline_store_allocations.find(o => o.manager_id === managerId);
    setAvailable(alloc.quantity);
    
    try {
      const res = await axios.get(`http://localhost:5000/marketplace/sales`, {
        params: { manager_id: managerId, product_id: prod.id }
      });
      setAlreadySold(res.data.sold_quantity || 0);
    } catch (error) {
      showNotification('Failed to fetch sales data', 'error');
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await axios.post('http://localhost:5000/marketplace/update-sales', {
        manager_id: managerId,
        product_id: selected.id,
        sold_quantity: parseInt(soldQty)
      });
      
      showNotification('Sales updated successfully!', 'success');
      setSoldQty('');
      // Refresh the product data
      onProductChange({ target: { value: selected.id } });
    } catch (error) {
      showNotification('Failed to update sales', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const maxAvailable = selected ? available - alreadySold : 0;

  return (
    <>
    <Navbar/>
    <div className="sales-update-container">
      <div className="sales-update-card">
        <div className="card-header">
          <h2>Marketplace Sales Update</h2>
          <p>Record your daily sales transactions</p>
        </div>

        {notification.show && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        <form onSubmit={submit} className="sales-form">
          <div className="form-group">
            <label htmlFor="product-select">Select Product</label>
            <select 
              id="product-select"
              onChange={onProductChange} 
              required
              className="form-select"
            >
              <option value="">-- Select Product --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
              ))}
            </select>
          </div>

          {selected && (
            <>
              <div className="inventory-info">
                <div className="info-item">
                  <span className="info-label">Available Stock:</span>
                  <span className="info-value">{available}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Already Sold:</span>
                  <span className="info-value">{alreadySold}</span>
                </div>
                <div className="info-item highlight">
                  <span className="info-label">Remaining:</span>
                  <span className="info-value">{maxAvailable}</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="sold-quantity">Units Sold Today</label>
                <input
                  id="sold-quantity"
                  type="number" 
                  min="1" 
                  max={maxAvailable}
                  value={soldQty}
                  onChange={e => setSoldQty(e.target.value)} 
                  placeholder="Enter quantity sold"
                  required
                  className="form-input"
                />
                <div className="input-hint">Max: {maxAvailable} units</div>
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="submit-btn"
            disabled={!selected || !soldQty || isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span> Processing...
              </>
            ) : (
              'Update Sales'
            )}
          </button>
        </form>
      </div>
    </div>
    <Footer/>
    </>
  );
}

export default MarketplaceUpdateSales;