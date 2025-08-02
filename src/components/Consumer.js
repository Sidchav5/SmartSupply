import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Consumer.css';
import Navbar from './Navbar';
import Footer from './Footer';
function Consumer({ consumerId: initialConsumerId }) {
  const [consumerId, setConsumerId] = useState(initialConsumerId);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orderFormVisible, setOrderFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    payment_mode: 'Online',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedId = localStorage.getItem("consumer_id");
    if (storedId) {
      setConsumerId(parseInt(storedId));
    } else {
      alert("You are not logged in. Please log in again.");
      // window.location.href = "/login";
    }

    setIsLoading(true);
    axios.get("http://localhost:5000/consumer/availability")
      .then(res => {
        setProducts(res.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch products:", err);
        setIsLoading(false);
      });
  }, []);

  const addToCart = product => {
    const qty = parseInt(prompt(`Quantity for "${product.name}"?`, '1'));
    if (!qty || qty <= 0 || qty > product.online_quantity) return;

    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) {
        existing.quantity += qty;
        if (existing.quantity > product.online_quantity) existing.quantity = product.online_quantity;
        return [...prev];
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: qty
      }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product_id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const product = products.find(p => p.id === productId);
    if (product && newQuantity > product.online_quantity) {
      alert(`Only ${product.online_quantity} available in stock`);
      return;
    }

    setCart(prev => 
      prev.map(item => 
        item.product_id === productId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };

  const handleFormChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = e => {
    setFormData(prev => ({ ...prev, payment_mode: e.target.value }));
  };

  const placeOrder = (e) => {
    e.preventDefault();

    const storedId = localStorage.getItem("consumer_id");
    const parsedId = storedId ? parseInt(storedId) : null;

    if (!formData.name || !formData.address || !formData.payment_mode) {
      alert("Please fill all the details");
      return;
    }

    if (!parsedId) {
      alert("Consumer not logged in. Please login again.");
      window.location.href = "/login";
      return;
    }

    axios.post("http://localhost:5000/consumer/place_order", {
      consumer_id: parsedId,
      name: formData.name,
      address: formData.address,
      payment_mode: formData.payment_mode,
      cart,
    })
      .then((res) => {
        alert(`Order #${res.data.order_id} placed. Total ₹${res.data.total}`);
        setCart([]);
        setFormData({ name: "", address: "", payment_mode: "Online" });
        setOrderFormVisible(false);
        return axios.get("http://localhost:5000/consumer/availability");
      })
      .then((r) => setProducts(r.data))
      .catch((err) => {
        alert("Failed to place order. " + (err.response?.data?.error || err.message));
      });
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <>
    <Navbar/>
    <div className="consumer-store">
      <header className="store-header">
        <h1 className="store-title">FreshMart Grocery</h1>
        <p className="store-subtitle">Fresh groceries delivered to your doorstep</p>
      </header>

      {isLoading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      ) : (
        <>
          <section className="product-section">
            <h2 className="section-title">Available Products</h2>
            <div className="product-grid">
              {products.map(p => (
                <div className="product-card" key={p.id}>
                  <div className="product-image-container">
                    <img
                      src={p.image_base64 ? `data:image/png;base64,${p.image_base64}` : 'placeholder.png'}
                      alt={p.name}
                    />
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{p.name}</h3>
                    <p className="product-price">₹{(Number(p.price) || 0).toFixed(2)}</p>
                    <p className={`product-stock ${p.online_quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                      {p.online_quantity > 0 ? `${p.online_quantity} in stock` : 'Out of stock'}
                    </p>
                    <button
                      className="add-to-cart-btn"
                      disabled={p.online_quantity < 1}
                      onClick={() => addToCart(p)}
                    >
                      {p.online_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {cart.length > 0 && (
            <section className="cart-section">
              <div className="cart-panel">
                <div className="cart-header">
                  <h3 className="cart-title">Your Shopping Cart</h3>
                  <span className="cart-count">{cart.length} {cart.length === 1 ? 'item' : 'items'}</span>
                </div>
                
                <div className="cart-items">
                  {cart.map((item, idx) => (
                    <div className="cart-item" key={idx}>
                      <div className="cart-item-info">
                        <span className="cart-item-name">{item.name}</span>
                        <div className="quantity-controls">
                          <button 
                            className="quantity-btn" 
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="item-quantity">{item.quantity}</span>
                          <button 
                            className="quantity-btn" 
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="cart-item-right">
                        <span className="cart-item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                        <button 
                          className="remove-item-btn"
                          onClick={() => removeFromCart(item.product_id)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="cart-footer">
                  <div className="cart-total">
                    <span>Total:</span>
                    <span className="total-amount">₹{calculateTotal().toFixed(2)}</span>
                  </div>
                  <button 
                    className="checkout-btn" 
                    onClick={() => setOrderFormVisible(true)}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </section>
          )}

          {orderFormVisible && (
            <section className="order-form-section">
              <form className="order-form" onSubmit={placeOrder}>
                <h3 className="form-title">Checkout Information</h3>
                
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="address">Delivery Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    placeholder="Enter your complete delivery address"
                    rows="4"
                    required
                  />
                </div>
                
                <div className="form-group payment-mode">
                  <label>Payment Method</label>
                  <div className="payment-options">
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="payment_mode"
                        value="Online"
                        checked={formData.payment_mode === 'Online'}
                        onChange={handlePaymentChange}
                      />
                      <span>Online Payment</span>
                    </label>
                    <label className="payment-option">
                      <input
                        type="radio"
                        name="payment_mode"
                        value="Cash on Delivery"
                        checked={formData.payment_mode === 'Cash on Delivery'}
                        onChange={handlePaymentChange}
                      />
                      <span>Cash on Delivery</span>
                    </label>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setOrderFormVisible(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="submit-order-btn"
                  >
                    Place Order
                  </button>
                </div>
              </form>
            </section>
          )}
        </>
      )}
    </div>
    <Footer/>
    </>
  );
}

export default Consumer;