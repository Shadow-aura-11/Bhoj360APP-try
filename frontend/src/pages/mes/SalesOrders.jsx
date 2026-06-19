import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingCart, Plus, Clipboard, CheckCircle, Package } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function SalesOrders() {
  const { tenantId } = useParams();
  const api = createApi(tenantId);
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    delivery_date: '',
    items: [{ item_id: '', quantity: 1, unit_price: 0 }]
  });

  const fetchOrders = async () => {
    try {
      const { data } = await api.get(`/r/${tenantId}/sales-orders`);
      setOrders(data);
    } catch (err) {
      toast.error('Failed to load sales orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    const { data } = await api.get(`/r/${tenantId}/items`);
    setItems(data);
  };

  useEffect(() => {
    fetchOrders();
    fetchItems();
  }, [tenantId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/r/${tenantId}/sales-orders`, formData);
      toast.success('Sales order created');
      setShowShowForm(false);
      fetchOrders();
    } catch (err) {
      toast.error('Failed to create order');
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="text-blue-600" /> Sales Orders
          </h1>
          <p className="text-slate-500 text-sm">Manage enterprise sales and customer demand</p>
        </div>
        <button
          onClick={() => setShowShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus size={18} /> New Sales Order
        </button>
      </header>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Create New Order</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Customer Name</label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-lg p-2 mt-1"
                  value={formData.customer_name}
                  onChange={e => setFormData({...formData, customer_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Delivery Date</label>
                <input
                  type="date"
                  required
                  className="w-full border rounded-lg p-2 mt-1"
                  value={formData.delivery_date}
                  onChange={e => setFormData({...formData, delivery_date: e.target.value})}
                />
              </div>
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold">Create Order</button>
              <button type="button" onClick={() => setShowShowForm(false)} className="w-full text-slate-500">Cancel</button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
            <tr>
              <th className="p-4">Order #</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-slate-50 transition">
                <td className="p-4 font-mono font-bold text-blue-600">{order.order_number}</td>
                <td className="p-4">{order.customer_name}</td>
                <td className="p-4 text-slate-500">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase">
                    {order.status}
                  </span>
                </td>
                <td className="p-4 text-right font-bold">₹{order.total_amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
