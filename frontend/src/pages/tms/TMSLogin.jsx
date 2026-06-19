import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, Plane, ArrowRight, Download, Briefcase } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function TMSLogin() {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null); // 'admin' | 'manager' | 'employee'
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [tenantName, setTenantName] = useState('Travel Management');
  const [loading, setLoading] = useState(false);
  const [themeColor, setThemeColor] = useState('#fafaf9');

  const api = createApi(tenantId, 'tms');

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const { data } = await api.get('/health');
        if (data.name) setTenantName(data.name);
      } catch (err) {
        console.error(err);
      }
    };
    if (tenantId) loadDetails();
  }, [tenantId]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!employeeId || !password) {
      toast.error('Please enter your Employee ID and password');
      return;
    }

    try {
      setLoading(true);
      // For now, we use a mock login that validates against the employee list
      // In a real system, this would be a proper /auth endpoint on the TMS service
      const { data: employees } = await api.get('/employees');
      const employee = employees.find(e => e.employee_id === employeeId);

      if (employee) {
        localStorage.setItem('session', JSON.stringify({
          role: employee.role,
          tenantId: tenantId, // Using tenantId key for compatibility with ProtectedRoute
          employeeId: employee.employee_id,
          name: employee.name,
          tenantType: 'tms'
        }));

        toast.success(`Welcome, ${employee.name}`);
        navigate(`/t/${tenantId}`);
      } else {
        toast.error('Invalid Employee ID or password');
      }
    } catch (err) {
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-body">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-blue-600 p-10 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
            <Plane size={32} />
          </div>
          <h1 className="text-2xl font-bold font-display">{tenantName}</h1>
          <p className="text-blue-100 mt-2 opacity-80 text-sm font-medium">Enterprise Travel Portal</p>
        </div>

        <div className="p-8 md:p-10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Employee Identifier</label>
              <div className="relative">
                <Briefcase size={18} className="absolute left-4 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. EMP001"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono font-bold"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Security Password</label>
              <div className="relative">
                <Shield size={18} className="absolute left-4 top-3.5 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all tracking-widest"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Enter Portal'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Authorized personnel only. All access is logged and monitored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
