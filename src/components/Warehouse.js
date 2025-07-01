import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Warehouse.css';
import Navbar from './Navbar';
import Footer from './Footer';

function Warehouse() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Add Inventory",
      description: "Add new items to your warehouse inventory system.",
      icon: "https://cdn-icons-png.flaticon.com/512/2910/2910768.png",
      action: "/warehouse/add-inventory"
    },
    {
      title: "Product Availability",
      description: "Check real-time availability of products across locations.",
      icon: "https://cdn-icons-png.flaticon.com/128/1625/1625048.png",
      action: "/warehouse/availability"
    },
    {
      title: "Suggest Allocation",
      description: "Get AI-powered suggestions for optimal product allocation.",
      icon: "https://cdn-icons-png.flaticon.com/512/1995/1995463.png",
      action: "/warehouse/allocation"
    },
    {
      title: "Generate Reports",
      description: "Create detailed inventory and performance reports.",
      icon: "https://cdn-icons-png.flaticon.com/512/3652/3652191.png",
      action: "/warehouse/reports"
    }
  ];

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <>
      <Navbar/>
      <div className="warehouse-dashboard">
        <div className="dashboard-header">
          <h1>Warehouse Manager Dashboard</h1>
          <p className="dashboard-subtitle">Welcome to your management control panel</p>
        </div>

        <div className="dashboard-cards">
          {cards.map((card, index) => (
            <div 
              className="dashboard-card" 
              key={index}
              onClick={() => handleCardClick(card.action)}
            >
              <div className="card-icon-container">
                <img src={card.icon} alt={card.title} className="card-icon" />
              </div>
              <div className="card-content">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
              <button className="card-action-button">
                Access Tool
                <span className="arrow-icon">→</span>
              </button>
            </div>
          ))}
        </div>
      </div>
      <Footer/>
    </>
  );
}

export default Warehouse;