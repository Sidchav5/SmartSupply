# SmartSupply

**SmartSupply** is an AI-powered inventory and supply-chain management platform designed to help businesses manage warehouse stock, allocate inventory intelligently, forecast demand, and dynamically price products.
It enables real-time coordination between warehouse managers, marketplace owners, and consumers — bridging online and offline stock tracking through a seamless web interface.

---

## 🚀 Table of Contents

* [Features](#features)
* [System Architecture](#system-architecture)
* [Tech Stack](#tech-stack)
* [Getting Started](#getting-started)

  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
  * [Run (Development)](#run-development)
  * [Run (Production)](#run-production)
* [Configuration](#configuration)
* [Usage](#usage)

  * [Role-Based Portals](#role-based-portals)
  * [AI Modules](#ai-modules)
* [Dataset & Forecasting](#dataset--forecasting)
* [Visualization](#visualization)
* [Contributing](#contributing)
* [Roadmap](#roadmap)
* [License](#license)
* [Contact](#contact)
* [Acknowledgements](#acknowledgements)

---

## 🌟 Features

* **Multi-role access system**

  * Warehouse Manager, Marketplace Manager, Store Manager, Consumer, and Admin dashboards
* **Inventory allocation system**

  * Intelligent allocation from warehouse to online/offline stores
* **Real-time stock synchronization**

  * Updates reflected across all roles after each sale or allocation
* **Dynamic Pricing Engine**

  * AI-based pricing suggestions using demand, season, stock, and discount trends
* **Sales forecasting module**

  * ML-based predictive model trained on generated datasets
* **Offline & Online JSON-based logging**

  * Daily logs stored as JSON for further CSV export and analysis
* **Product image management**

  * Base64 storage of uploaded product images in MySQL
* **Clean, responsive React UI**

  * Gradient-based, card-style dashboard for all roles
* **Automated data balancing**

  * SMOTE and synthetic data generation for model training (10k+ records)

---

## 🧠 System Architecture

```
Frontend (React + Bootstrap + CSS)
        |
        |--> API Calls (Axios/Fetch)
        |
Backend (Flask)
        |
        |--> Inventory Management
        |--> AI Models (Allocation, Forecasting, Pricing)
        |
Database (MySQL)
        |
        |--> JSON Storage for offline/online logs
```

---

## ⚙️ Tech Stack

**Frontend:**

* React.js
* Bootstrap 5 + Custom CSS
* Axios for API communication
* React Router for navigation

**Backend:**

* Flask (Python)
* Flask-CORS, Flask-RESTful
* Pandas, Scikit-learn, Numpy
* SMOTE for data balancing
* Matplotlib for visualization

**Database:**

* MySQL
* Tables for `users`, `products`, `allocations`, `sales`, etc.

**ML/AI:**

* Demand forecasting (RandomForest, Linear Regression)
* Pricing optimization
* Warehouse stock allocation suggestions

**Auth:**

* JWT-based token authentication

**Deployment (optional):**

* Render / Railway / Vercel (Frontend)
* Docker / Flask-Gunicorn (Backend)

---

## 🧩 Getting Started

### Prerequisites

* Python 3.9+
* Node.js 18+
* MySQL server running locally or on cloud
* Git installed

---

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/Sidchav5/SmartSupply.git
   cd SmartSupply
   ```

2. Setup backend

   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```

3. Setup frontend

   ```bash
   cd frontend
   npm install
   npm start
   ```

4. Open in browser:

   ```
   http://localhost:3000
   ```

---

### Run (Production)

```bash
npm run build
flask run --host=0.0.0.0 --port=5000
```

(Optional: Use Docker Compose for combined build.)

---

## ⚙️ Configuration

Create `.env` files in both `frontend/` and `backend/` directories.

Example for Flask backend:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=smartsupply
JWT_SECRET=supersecretkey
```

---

## 🧭 Usage

### Role-Based Portals

| Role                    | Features                                                 |
| ----------------------- | -------------------------------------------------------- |
| **Warehouse Manager**   | Add/update products, allocate stock, view availability   |
| **Marketplace Manager** | Update daily sales, monitor stock & sales analytics      |
| **Store Manager**       | Update offline sales and view assigned products          |
| **Consumer**            | View product catalog, check freshness, purchase products |
| **Admin**               | Monitor overall performance and manage user roles        |

---

### AI Modules

1. **Smart Allocation** – Suggests optimal distribution of stock to online/offline stores
2. **Dynamic Pricing** – Adjusts product prices using trained regression models
3. **Sales Forecasting** – Predicts demand trends using seasonal & temporal features

---

## 📊 Dataset & Forecasting

* Synthetic dataset (`smart_supply_dataset.csv`) created using SMOTE for balanced product instances.
* ~10,000 records across 15 food items.
* Features: `base_price`, `demand`, `stock`, `day_of_week`, `season`, `discount`, `final_price`.
* Trained models stored in `/backend/models/`.

---

## 📈 Visualization

Visual insights include:

* Product-wise demand vs stock bar charts
* Seasonal sales trends
* Discount vs final price regression plots
* Correlation heatmaps of features

All charts are generated and saved automatically in Google Drive via Colab notebooks.

---

## 🤝 Contributing

1. Fork the repository
2. Create a branch:

   ```bash
   git checkout -b feature/my-feature
   ```
3. Commit changes and push:

   ```bash
   git commit -m "Added new feature"
   git push origin feature/my-feature
   ```
4. Open a Pull Request

Coding guidelines:

* Follow PEP8 & ESLint
* Keep commits atomic and descriptive
* Write meaningful docstrings and comments

---

## 🗺️ Roadmap

* [ ] Add AI-driven reorder alert system
* [ ] Implement warehouse-to-warehouse transfers
* [ ] Integrate supplier portal for purchase orders
* [ ] Add mobile-friendly React Native app
* [ ] Deploy via Docker and CI/CD pipeline

---



## 📬 Contact

**Developer:** Siddhesh Sharad Chavan

* GitHub: [Sidchav5](https://github.com/Sidchav5)
* Email: [csiddhesh768@gmail.com](mailto:csiddhesh768@gmail.com)
* Department of AI & Data Science, VIT Pune

---

## 💡 Acknowledgements

* Bootstrap Icons & Flaticon for UI assets
* scikit-learn for forecasting and regression modeling
* Matplotlib & Pandas for data visualization
* Flask + React ecosystem
* Dataset generation inspired by internal project “RetailIntel360”

---
