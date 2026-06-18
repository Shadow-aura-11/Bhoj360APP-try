import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  User,
  CreditCard,
  Plus,
  Minus,
  Trash2,
  Package,
  BadgeCheck
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

const GmsPosTerminal = () => {
  const { gymId } = useParams();
  const api = createApi(gymId);
  const [cart, setCart] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchMember, setSearchMember] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, invRes] = await Promise.all([
          api.get('/members'),
          api.get('/inventory')
        ]);
        setMembers(membersRes.data || []);
        setProducts(invRes.data || []);
      } catch (err) { /* silent */ }
    };
    fetchData();
  }, [gymId]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, i.qty + delta);
        return { ...i, qty: newQty };
      }
      return i;
    }));
  };

  const total = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

  const handleCheckout = async (method) => {
    if (cart.length === 0) return toast.error("Cart is empty");

    setLoading(true);
    try {
      await api.post('/sales', {
        member_id: selectedMember?.id || null,
        total_amount: total,
        payment_method: method,
        items: cart
      });
      toast.success(`Sale completed successfully via ${method}!`);
      setCart([]);
      setSelectedMember(null);
    } catch (err) {
      toast.error("Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(m =>
    m.full_name.toLowerCase().includes(searchMember.toLowerCase()) || m.phone.includes(searchMember)
  ).slice(0, 5);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-100 font-body">
      {/* Products Side */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-blue-600" /> Supplement & Gear POS
          </h1>
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search products..." className="w-full pl-10 pr-4 py-2 rounded-lg border-none bg-white shadow-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map(p => (
            <div
              key={p.id}
              onClick={() => addToCart(p)}
              className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-500 cursor-pointer transition group"
            >
              <div className="w-full aspect-square bg-slate-50 rounded-xl mb-4 flex items-center justify-center">
                <Package className="w-10 h-10 text-slate-200 group-hover:text-blue-200 transition" />
              </div>
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">{p.category}</p>
              <h4 className="font-bold text-slate-800 mb-1 leading-tight">{p.name}</h4>
              <p className="font-black text-blue-600">${p.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cart & Checkout Side */}
      <div className="w-full lg:w-96 bg-white border-l border-slate-200 flex flex-col">
        {/* Member Selector */}
        <div className="p-6 border-b border-slate-100">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Member Search</label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchMember}
              onChange={(e) => setSearchMember(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm"
            />
            {searchMember && !selectedMember && (
              <div className="absolute top-full left-0 w-full bg-white border border-slate-100 shadow-xl rounded-b-xl z-20 mt-1 overflow-hidden">
                {filteredMembers.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedMember(m); setSearchMember(''); }}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 text-xs border-b border-slate-50 flex items-center justify-between"
                  >
                    <span>{m.full_name} ({m.phone})</span>
                    <Plus className="w-3 h-3 text-blue-500" />
                  </button>
                ))}
              </div>
            )}
          </div>
          {selectedMember && (
            <div className="mt-3 p-3 bg-blue-50 rounded-xl flex items-center justify-between border border-blue-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                  {selectedMember.full_name[0]}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-blue-700 leading-none">{selectedMember.full_name}</p>
                  <p className="text-[9px] text-blue-500 font-mono mt-0.5">{selectedMember.phone}</p>
                </div>
              </div>
              <button onClick={() => setSelectedMember(null)} className="text-blue-400 hover:text-blue-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          <h3 className="font-bold text-slate-800 mb-2">Cart Summary</h3>
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <ShoppingBag className="w-12 h-12 text-slate-100 mb-2" />
              <p className="text-slate-400 text-sm italic">Add items to start a sale</p>
            </div>
          ) : cart.map(item => (
            <div key={item.id} className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-700">{item.name}</p>
                <p className="text-xs text-slate-400 font-medium">${item.price.toFixed(2)} each</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-3 bg-slate-100 rounded-lg p-1">
                  <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-white rounded shadow-sm transition"><Minus className="w-3 h-3" /></button>
                  <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-white rounded shadow-sm transition"><Plus className="w-3 h-3" /></button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-xs text-rose-500 font-bold hover:underline">Remove</button>
              </div>
            </div>
          ))}
        </div>

        {/* Totals & Checkout */}
        <div className="p-6 bg-slate-50 border-t border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <span className="text-slate-500 font-bold">Total Payable</span>
            <span className="text-2xl font-black text-slate-800">${total.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleCheckout('Cash')}
              disabled={loading}
              className="py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition shadow-sm flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Cash
            </button>
            <button
              onClick={() => handleCheckout('Card/UPI')}
              disabled={loading}
              className="py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" /> Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GmsPosTerminal;
