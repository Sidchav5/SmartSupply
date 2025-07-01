// src/components/HeroSection.js
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './HeroSection.css';
import RoleCards from './RoleCards';

function HeroSection() {
  return (
    <header>
      <div className="hero-section">
        <Navbar />
        <div className="poster">
          <p className="poster-name">
            SmartSupply360 – Intelligent Food Inventory & Distribution Platform !!
          </p>
        </div>
        <div className="poster-info">
          <p>
            Welcome to SmartSupply360 – It is your intelligent food inventory and distribution optimizer. View product freshness,
            availability, store pricing, and smart delivery options — all in real time, powered by AI and IoT.
          </p>
          <div className="cta-buttons">
            <a href="/register" className="btn btn-warning mx-2">Get Started</a>
             
            <a href="/about" className="btn btn-outline-light">Learn More</a>
          </div>
        </div>
        
      </div>
      <RoleCards/>
      <Footer />
    </header>
  );
}

export default HeroSection;