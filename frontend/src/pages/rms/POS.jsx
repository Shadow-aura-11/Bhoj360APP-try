import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingCart, Search, User, CreditCard, Tag, Trash2, Plus, Minus, CheckCircle } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function POS() {
  const { id: tenantId } = useParams();
  const api = createApi(tenantId);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/rms/products');
      setProducts(data);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.product_id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.id,
        name: product.name,
        price: product.sale_price,
        quantity: 1
      }]);
    }
  };

  const updateQty = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.product_id === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        return newQty === 0 ? null : { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.18; // 18% GST example
  const total = subtotal + tax;

  const handleCheckout = async (method) => {
    if (cart.length === 0) return toast.error('Cart is empty');
    try {
      await api.post('/rms/sales', {
        store_id: 1,
        customer_id: customer?.id,
        items: cart,
        payment_method: method,
        cash_received: method === 'cash' ? total : 0
      });
      toast.success('Sale completed successfully!');
      setCart([]);
      setCustomer(null);
    } catch (err) {
      toast.error('Checkout failed');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode === search
  );

  return (
    <div className="flex h-[calc(100vh-64px)] bg-slate-50 font-sans">
      {/* Left: Product Selection */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Scan barcode or search name/SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 shadow-sm text-lg"
          />
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-6">
          {loading ? (
             [1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-white rounded-2xl animate-pulse border border-slate-100" />)
          ) : filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white border border-slate-200 p-4 rounded-2xl text-left hover:border-blue-400 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block mb-2 uppercase">
                  {product.sku}
                </div>
                <h3 className="font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">{product.category}</p>
              </div>
              <div className="mt-4 flex justify-between items-end">
                <span className="text-lg font-black text-slate-900">₹{product.sale_price}</span>
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Plus className="w-5 h-5" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Cart & Checkout */}
      <div className="w-96 bg-white border-l border-slate-200 flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
              Active Cart
            </h2>
            <button
              onClick={() => setCart([])}
              className="text-slate-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
          <button className="w-full p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-500 text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors">
            <User className="w-4 h-4" />
            {customer ? customer.name : 'Attach Customer'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-20 opacity-30">
              <Tag className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm font-bold">Cart is empty</p>
            </div>
          ) : cart.map(item => (
            <div key={item.product_id} className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.name}</h4>
                <p className="text-[11px] font-mono text-slate-500 mt-1">₹{item.price} × {item.quantity}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQty(item.product_id, -1)} className="w-7 h-7 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-600">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-4 text-center text-sm font-black">{item.quantity}</span>
                <button onClick={() => updateQty(item.product_id, 1)} className="w-7 h-7 bg-white border border-slate-200 rounded-lg flex items-center justify-center hover:bg-blue-50 hover:text-blue-600">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-slate-900 text-white rounded-t-[32px]">
          <div className="space-y-2 mb-6 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="font-mono">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Tax (GST 18%)</span>
              <span className="font-mono">₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-black mt-4 pt-4 border-t border-slate-800">
              <span>Total</span>
              <span className="text-blue-400">₹{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleCheckout('cash')}
              className="py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold flex flex-col items-center gap-1 transition-all"
            >
              <CreditCard className="w-5 h-5 text-emerald-400" />
              Cash
            </button>
            <button
              onClick={() => handleCheckout('upi')}
              className="py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold flex flex-col items-center gap-1 transition-all shadow-lg shadow-blue-600/20"
            >
              <CheckCircle className="w-5 h-5" />
              Digital/UPI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
