import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HeroSection from './components/HeroSection';
import Login from './components/Login';
import Register from './components/Register';
import Consumer from './components/Consumer';
import MarketPlace from './components/MarketPlace';
import Warehouse from './components/Warehouse';
import WarehouseInventoryForm from './components/WarehouseInventoryForm';
import WarehouseAvailability from './components/WarehouseAvailability';
import MarketplaceUpdateSales from './components/MarketplaceUpdateSales';
import StoreAvailability from "./components/storeManagerAvailability"; // ⬅️ Import new page
import UpdateProduct from './components/UpdateProduct';
import DeleteProduct from './components/DeleteProduct';
// ...other imports
const currentManagerId = localStorage.getItem("manager_id");
const currentConsumerId = localStorage.getItem("consumer_id");

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {/* Add more routes as needed */}
        
         {/* login router */}
        
        <Route path="/marketplace" element={<MarketPlace />} />
        <Route path="/warehouse" element={<Warehouse />} />

         {/* warehouse routes */}
         <Route path="/warehouse/add-inventory" element={<WarehouseInventoryForm />} />
          <Route path="/warehouse/availability" element={<WarehouseAvailability />} />
          <Route path="/warehouse/update_product" element={<UpdateProduct />} />
          <Route path="/warehouse/delete_product" element={<DeleteProduct />} />


          {/* manger routes */}
           <Route path="/marketplace/update-sales" element={<MarketplaceUpdateSales managerId={currentManagerId} />} />
            <Route path="/store/availability" element={<StoreAvailability />} /> {/* ✅ New Route */}

 
<Route path="/consumer" element={<Consumer consumerId={currentConsumerId} />} />



      </Routes>
    </Router>
  );
}

export default App;
