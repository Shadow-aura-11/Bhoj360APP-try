import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Brain, TrendingUp, Users, Target, Zap, ChevronRight, Info } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function AIAnalytics() {
  const { id: tenantId } = useParams();
  const api = createApi(tenantId);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/rms/products');
      setProducts(data);
      if (data.length > 0) setSelectedProduct(data[0].id);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const getForecast = async (productId) => {
    try {
      const { data } = await api.get(`/rms/forecast/${productId}`);
      setForecast(data);
    } catch (err) {
      toast.error('Failed to generate forecast');
    }
  };

  useEffect(() => {
    if (selectedProduct) getForecast(selectedProduct);
  }, [selectedProduct]);

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
          <Brain className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">AI Intelligence Hub</h1>
          <p className="text-slate-500 mt-1">Predictive models and automated decision insights.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Product Demand Forecasting */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-indigo-500" />
                  Demand Forecasting
                </h2>
                <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">Next 30 Days Prediction</p>
              </div>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {forecast ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                    <p className="text-sm font-bold text-indigo-600 mb-1">Predicted Units</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black text-indigo-900">{forecast.predicted_demand}</span>
                      <span className="text-indigo-500 font-bold">units</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Confidence</p>
                      <p className="text-lg font-black text-slate-800">84.2%</p>
                    </div>
                    <div className="flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Risk</p>
                      <p className="text-lg font-black text-emerald-600">Low</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                   <h4 className="text-sm font-black text-slate-800">AI Recommendation</h4>
                   <div className="p-4 bg-slate-900 text-white rounded-2xl relative overflow-hidden">
                      <Zap className="absolute -right-4 -bottom-4 w-20 h-20 text-slate-800 opacity-50" />
                      <p className="text-xs leading-relaxed relative z-10">
                        Historical data shows a seasonal surge in {products.find(p => p.id == selectedProduct)?.category}.
                        Increase stock levels by 20% before the weekend to avoid stockouts.
                      </p>
                   </div>
                   <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-500 transition-all flex items-center justify-center gap-2">
                     Automate Reorder
                     <ChevronRight className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 italic">Analysing historical sales patterns...</div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
              <h3 className="font-black text-slate-900 flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-rose-500" />
                Price Optimization
              </h3>
              <p className="text-sm text-slate-500 mb-6">Real-time margin analysis and competitive pricing suggestions.</p>
              <div className="space-y-3">
                 {[1,2].map(i => (
                   <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Item Name {i}</p>
                        <p className="text-[10px] text-emerald-600 font-bold mt-1">Sug. Increase: +₹45</p>
                      </div>
                      <button className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-200 transition-colors">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                      </button>
                   </div>
                 ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
               <h3 className="font-black text-slate-900 flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-blue-500" />
                System Insights
              </h3>
              <div className="space-y-4">
                <div className="border-l-4 border-amber-400 pl-4 py-1">
                  <p className="text-xs font-bold text-slate-800">Supply Chain Delay</p>
                  <p className="text-[10px] text-slate-400 mt-1">Supplier 'Global Tech' has 3 days average delay increase.</p>
                </div>
                <div className="border-l-4 border-emerald-400 pl-4 py-1">
                  <p className="text-xs font-bold text-slate-800">Loyalty Surge</p>
                  <p className="text-[10px] text-slate-400 mt-1">Customer redemptions up 14% this week.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Customer Segmentation */}
        <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl shadow-slate-900/40 h-fit">
           <h2 className="text-xl font-black flex items-center gap-2 mb-8">
             <Users className="w-6 h-6 text-blue-400" />
             AI Customer Segments
           </h2>
           <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span className="text-blue-400">Power Shoppers</span>
                  <span>42%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[42%]" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span className="text-emerald-400">Regulars</span>
                  <span>38%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[38%]" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span className="text-rose-400">At Risk</span>
                  <span>20%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 w-[20%]" />
                </div>
              </div>
           </div>

           <div className="mt-12 p-6 bg-slate-800/50 rounded-3xl border border-slate-700">
              <h4 className="text-sm font-bold text-blue-400 mb-2 italic">Segment Action</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                24 'At Risk' VIPs haven't visited in 14 days. Suggesting a 15% discount coupon via WhatsApp to re-engage.
              </p>
              <button className="w-full mt-4 py-3 bg-white text-slate-900 rounded-xl font-black text-xs uppercase tracking-tighter hover:bg-slate-100 transition-all">
                Execute Campaign
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
