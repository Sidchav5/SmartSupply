import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="nav-bar">
      <div className="nav-name-text">
        <i className="fa-solid fa-warehouse"></i>
        SmartSupply360
      </div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/register">Register</Link>
        <Link to="/login">Login</Link>
        <Link to="/about">About Us</Link>
      </div>
    </nav>
  );
}

export default Navbar;
