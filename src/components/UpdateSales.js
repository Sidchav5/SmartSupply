import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './UpdateSales.css';

function UpdateSales({ managerId }) {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState({});
  const [form, setForm] = useState({ product_id: '', quantity_sold: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/warehouse/availability')
      .then(res => setProducts(res.data));
    axios.get(`http://localhost:5000/marketplace/today-sales`, { params: { manager_id: managerId } })
      .then(res => {
        const obj = {};
        res.data.sales.forEach(s => obj[s.product_id] = s.quantity_sold);
        setSales(obj);
      });
  }, [managerId]);

  const handleSubmit = e => {
    e.preventDefault();
    axios.post('http://localhost:5000/marketplace/update-sales', { manager_id: managerId, ...form })
      .then(res => {
        setMessage(res.data.message);
        setSales(prev => ({ ...prev, [form.product_id]: (prev[form.product_id]||0) + Number(form.quantity_sold) }));
      })
      .catch(err => setMessage(err.response?.data?.message));
  };

  return (
    <div className="update-sales-form">
      <h2>Update Daily Sales</h2>
      <form onSubmit={handleSubmit}>
        <label>Product:</label>
        <select name="product_id" onChange={e => setForm({...form, product_id: e.target.value})}>
          <option value="">--Select--</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} (Allocated: {p.offline_store_allocations.find(a=>a.manager_id===managerId)?.quantity || 0}, Sold: {sales[p.id]||0})
            </option>
          ))}
        </select>
        <label>Quantity Sold:</label>
        <input type="number" name="quantity_sold" min="1"
               onChange={e => setForm({...form, quantity_sold: e.target.value})}
               required />
        <button type="submit">Submit</button>
      </form>
      {message && <p className="form-message">{message}</p>}
    </div>
  );
}

export default UpdateSales;
