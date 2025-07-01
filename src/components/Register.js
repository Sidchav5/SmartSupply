import React, { useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './Footer';
import './Register.css';

function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Consumer',
    location: '',
    manager_id: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await axios.post('http://localhost:5000/register', form);
      setMessage({ text: res.data.message, type: 'success' });
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Registration failed. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="register-page">
        <Navbar />
        <div className="register-container">
          <div className="register-card">
            <h2 className="register-title">Create Your Account</h2>

            {message.text && (
              <div className={`register-message ${message.type}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="register-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  onChange={handleChange}
                  required
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Account Type</label>
                <select
                  id="role"
                  name="role"
                  onChange={handleChange}
                  className="role-selector"
                  value={form.role}
                >
                  <option value="Consumer">Consumer</option>
                  <option value="Marketplace Manager">Marketplace Manager</option>
                  <option value="Warehouse Manager">Warehouse Manager</option>
                </select>
              </div>

              {/* Extra fields for Marketplace Manager */}
              {form.role === 'Marketplace Manager' && (
                <>
                  <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      placeholder="Enter location"
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="manager_id">Manager ID</label>
                    <input
                      id="manager_id"
                      name="manager_id"
                      type="text"
                      placeholder="Enter manager ID"
                      onChange={handleChange}
                      required
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="register-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registering...' : 'Register'}
              </button>
            </form>

            <div className="login-redirect">
              Already have an account? <a href="/login">Log in</a>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

export default Register;
