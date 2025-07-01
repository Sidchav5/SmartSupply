import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HeroSection from './components/HeroSection';
import Login from './components/Login';
import Register from './components/Register';
import Consumer from './components/Consumer';
import MarketPlace from './components/MarketPlace';
import Warehouse from './components/Warehouse';
import WarehouseInventoryForm from './components/WarehouseInventoryForm';
import WarehouseAvailability from './components/WarehouseAvailability';
import UpdateSales from './components/UpdateSales';

// ...other imports

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {/* Add more routes as needed */}
        
         {/* login router */}
        <Route path="/consumer" element={<Consumer />} />
        <Route path="/marketplace" element={<MarketPlace />} />
        <Route path="/warehouse" element={<Warehouse />} />

         {/* warehouse routes */}
         <Route path="/warehouse/add-inventory" element={<WarehouseInventoryForm />} />
          <Route path="/warehouse/availability" element={<WarehouseAvailability />} />

          {/* warehouse routes */}
           <Route path="/warehouse/add-inventory" element={<WarehouseInventoryForm />} />
      </Routes>
    </Router>
  );
}

export default App;
