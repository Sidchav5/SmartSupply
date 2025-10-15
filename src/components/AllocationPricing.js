import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./AllocationPricing.css";

const AllocationPricing = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Suggest Allocation",
      description: "AI-powered suggestions for optimal warehouse and store allocation.",
      icon: "https://cdn-icons-png.flaticon.com/512/1995/1995463.png",
      action: "/warehouse/suggest-allocation"
    },
    {
      title: "Decide Dynamic Price",
      description: "Simulate and update product prices dynamically based on demand & stock.",
      icon: "https://cdn-icons-png.flaticon.com/512/1041/1041916.png",
      action: "/warehouse/dynamic-price"
    }
  ];

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <>
      <Navbar />
      <div className="allocation-pricing-container">
        <h1>Allocation & Pricing</h1>
        <p className="subtitle">Choose a tool to manage allocation or pricing</p>

        <div className="cards-container">
          {cards.map((card, index) => (
            <div 
              key={index} 
              className="allocation-card" 
              onClick={() => handleCardClick(card.action)}
            >
              <div className="card-icon-container">
                <img src={card.icon} alt={card.title} className="card-icon" />
              </div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <button className="card-button">
                Access Tool <span className="arrow">→</span>
              </button>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AllocationPricing;
