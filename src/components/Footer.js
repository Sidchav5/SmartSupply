// src/components/Footer.js
import React from 'react';

function Footer() {
  return (
    <footer>
      <div className="footer-container">
        <div className="footer-logo">
          <p><i className="fa-solid fa-utensils"></i> SmartSupply360</p>
        </div>
        <div className="footer-links">
          <a href="/">Home</a>
          <a href="/blogs">Blog Page</a>
          <a href="/about">About Us</a>
          <a href="/contact">Contact</a>
          <a href="/privacy">Privacy Policy</a>
        </div>
        <div className="footer-social">
          <a href="/facebook"><i className="fa-brands fa-facebook"></i></a>
          <a href="/instagram"><i className="fa-brands fa-instagram"></i></a>
          <a href="/twitter"><i className="fa-brands fa-twitter"></i></a>
          <a href="/youtube"><i className="fa-brands fa-youtube"></i></a>
        </div>
        <div className="footer-credit">
          <p>© 2025 SmartSupply360. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;