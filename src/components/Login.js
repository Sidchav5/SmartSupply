import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import './Login.css';

function Login() {
  const [form, setForm] = useState({ email: '', password: '', role: 'Consumer' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    const roleMap = {
      'Consumer': 'consumer',
      'Marketplace Manager': 'marketplace_manager',
      'Warehouse Manager': 'warehouse_manager'
    };

    const redirectMap = {
      'Consumer': '/consumer',
      'Marketplace Manager': '/marketplace',
      'Warehouse Manager': '/warehouse'
    };

    const route = roleMap[form.role];

    try {
      const res = await axios.post(`http://localhost:5000/login/${route}`, form);
      setMessage({
        text: `${res.data.message}, Welcome ${res.data.name}`,
        type: 'success'
      });

      // Redirect to role-specific page after short delay
      setTimeout(() => {
        navigate(redirectMap[form.role]);
      }, 1000);

    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Login failed. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="login-page">
        <div className="login-container">
          <div className="login-card">
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">Please enter your details to sign in</p>

            {message.text && (
              <div className={`login-message ${message.type}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
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
                <div className="password-input">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <i className="eye-icon">👁️</i> : <i className="eye-icon">🔒</i>}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="role">Account Type</label>
                <select
                  id="role"
                  name="role"
                  onChange={handleChange}
                  className="role-selector"
                >
                  <option value="Consumer">Consumer</option>
                  <option value="Marketplace Manager">Marketplace Manager</option>
                  <option value="Warehouse Manager">Warehouse Manager</option>
                </select>
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="register-redirect">
              Don't have an account? <a href="/register">Sign up</a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Login;
