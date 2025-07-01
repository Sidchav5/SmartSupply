import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import './MarketPlace.css';

export default function Marketplace() {
  const cards = [
    {
      title: "Update the Sales",
      description: "At the end of the day, update the sales of each product to sync with the warehouse.",
      image: "https://source.unsplash.com/400x250/?sales,data",
      buttonText: "Update Sales",
      route: "/marketplace/update-sales"
    },
    {
      title: "Product Availability at Store",
      description: "View the real-time availability of all products at various store locations.",
      image: "https://source.unsplash.com/400x250/?store,inventory",
      buttonText: "View Availability",
      route: "/marketplace/store-availability"
    },
    {
      title: "Generate Reports",
      description: "Generate detailed sales and inventory reports for your stores.",
      image: "https://source.unsplash.com/400x250/?report,analytics",
      buttonText: "Generate",
      route: "/marketplace/generate-reports"
    }
  ];

  return (
    <>
      <Navbar />
      <div className="marketplace-container">
        <h2>Marketplace Manager Dashboard</h2>
        <p>Welcome to the Marketplace Management Panel!</p>
        <div className="card-grid">
          {cards.map((card, index) => (
            <div className="marketplace-card" key={index}>
              <img src={card.image} alt={card.title} className="card-image" />
              <div className="card-body">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <a href={card.route} className="card-button">{card.buttonText}</a>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
