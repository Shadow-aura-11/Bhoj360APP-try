import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingCart, User, CreditCard, Tag, Search, Plus, Trash2, CheckCircle } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function SpaPOS() {
  const { restaurantId } = useParams();
  const api = createApi(restaurantId);
  const [services, setServices] = useState([]);
  const [cart, setCart] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [servicesRes, customersRes] = await Promise.all([
        api.get('/spa/services'),
        api.get('/spa/customers')
      ]);
      setServices(servicesRes.data);
      setCustomers(customersRes.data);
    } catch (err) {
      toast.error('Failed to load POS data');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (service) => {
    setCart([...cart, { ...service, cartId: Date.now() }]);
    toast.success(`${service.name} added to bill`);
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    try {
      await api.post('/spa/billing', {
        customer_id: selectedCustomer?.id,
        total_amount: total,
        tax_amount: total * 0.05,
        grand_total: total * 1.05,
        payment_method: 'Card',
        notes: 'POS Transaction'
      });
      toast.success('Checkout completed successfully');
      setCart([]);
      setSelectedCustomer(null);
    } catch (err) {
      toast.error('Checkout failed');
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-body">
      {/* Left: Service Selection */}
      <div className="flex-1 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Wellness POS</h1>
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search treatments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
          {services.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map(service => (
            <div
              key={service.id}
              onClick={() => addToCart(service)}
              className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all group"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">{service.category}</span>
                <span className="font-bold text-slate-800">₹{service.price}</span>
              </div>
              <h3 className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{service.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{service.duration_minutes} mins</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Checkout Sidebar */}
      <div className="w-96 bg-white border-l border-slate-200 p-6 flex flex-col shadow-xl">
        <div className="flex items-center gap-2 mb-8 pb-4 border-b border-slate-100">
          <ShoppingCart className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-800">Current Bill</h2>
        </div>

        {/* Customer Selection */}
        <div className="mb-6">
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Select Customer</label>
          <select
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
            onChange={(e) => {
              const c = customers.find(x => x.id === parseInt(e.target.value));
              setSelectedCustomer(c);
            }}
          >
            <option value="">Walk-in Customer</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
            ))}
          </select>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-6">
          {cart.length === 0 ? (
            <div className="text-center py-20 text-slate-300">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm italic">Add services to start billing</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.cartId} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl group">
                <div>
                  <p className="text-sm font-bold text-slate-700">{item.name}</p>
                  <p className="text-xs text-slate-400">₹{item.price}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.cartId)}
                  className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Totals */}
        <div className="border-t border-slate-100 pt-6 space-y-2">
          <div className="flex justify-between text-sm text-slate-500">
            <span>Subtotal</span>
            <span>₹{total}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-500">
            <span>GST (5%)</span>
            <span>₹{Math.round(total * 0.05)}</span>
          </div>
          <div className="flex justify-between text-xl font-black text-slate-800 pt-2">
            <span>Total</span>
            <span className="text-blue-600">₹{Math.round(total * 1.05)}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl mt-6 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-200"
          >
            <CheckCircle className="w-5 h-5" />
            Complete Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
