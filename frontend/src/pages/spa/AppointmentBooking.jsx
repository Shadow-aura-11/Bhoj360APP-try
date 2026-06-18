import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, User, Briefcase, Plus, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';
import { format, addDays, startOfWeek, addWeeks, subWeeks } from 'date-fns';

export default function AppointmentBooking() {
  const { restaurantId } = useParams();
  const api = createApi(restaurantId);
  const [appointments, setAppointments] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    customer_id: '',
    therapist_id: '',
    service_id: '',
    appointment_date: format(new Date(), 'yyyy-MM-dd'),
    appointment_time: '10:00',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    try {
      const [apptsRes, therapistsRes, servicesRes, customersRes] = await Promise.all([
        api.get(`/appointments?date=${format(currentDate, 'yyyy-MM-dd')}`),
        api.get('/therapists'),
        api.get('/spa/services'),
        api.get('/spa/customers')
      ]);
      setAppointments(apptsRes.data);
      setTherapists(therapistsRes.data);
      setServices(servicesRes.data);
      setCustomers(customersRes.data);
    } catch (err) {
      toast.error('Failed to load booking data');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      const service = services.find(s => s.id === parseInt(newAppointment.service_id));
      await api.post('/appointments', {
        ...newAppointment,
        duration_minutes: service?.duration_minutes || 60,
        total_price: service?.price || 0
      });
      toast.success('Appointment booked!');
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error('Booking failed');
    }
  };

  const timeSlots = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-body">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-600" /> Appointment Scheduler
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage treatments and therapist availability</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all"
        >
          <Plus className="w-5 h-5" /> Book Appointment
        </button>
      </div>

      {/* Calendar Header */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentDate(addDays(currentDate, -1))} className="p-2 hover:bg-slate-50 rounded-lg border border-slate-100 transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </button>
          <h2 className="text-lg font-black text-slate-800 min-w-[150px] text-center">
            {format(currentDate, 'EEEE, MMM dd')}
          </h2>
          <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className="p-2 hover:bg-slate-50 rounded-lg border border-slate-100 transition-colors">
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <button onClick={() => setCurrentDate(new Date())} className="text-sm font-bold text-blue-600 hover:underline">Go to Today</button>
      </div>

      {/* Booking Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[100px_1fr] divide-x divide-slate-100">
          {/* Time Sidebar */}
          <div className="bg-slate-50/50">
            {timeSlots.map(time => (
              <div key={time} className="h-32 p-4 border-b border-slate-100 flex flex-col items-center justify-start">
                <span className="text-xs font-black text-slate-400 font-mono">{time}</span>
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="relative">
            {timeSlots.map(time => (
              <div key={time} className="h-32 border-b border-slate-100 relative group">
                <div className="absolute inset-0 group-hover:bg-blue-50/10 transition-colors pointer-events-none" />
                <div className="p-2 flex flex-wrap gap-2">
                  {appointments.filter(a => a.appointment_time.startsWith(time.split(':')[0])).map(appt => (
                    <div
                      key={appt.id}
                      className={`min-w-[200px] p-3 rounded-2xl border shadow-sm transition-all ${
                        appt.status === 'completed' ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold text-blue-600 uppercase">{appt.service_name}</span>
                        {appt.status === 'completed' && <Check className="w-3 h-3 text-emerald-600" />}
                      </div>
                      <p className="text-sm font-bold text-slate-800">{appt.customer_name}</p>
                      <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-500">
                        <User className="w-3 h-3" />
                        <span className="font-semibold">{appt.therapist_name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl animate-slide-up">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">New Appointment</h2>
            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Customer</label>
                <select
                  required
                  value={newAppointment.customer_id}
                  onChange={(e) => setNewAppointment({...newAppointment, customer_id: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Service</label>
                  <select
                    required
                    value={newAppointment.service_id}
                    onChange={(e) => setNewAppointment({...newAppointment, service_id: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Service</option>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Therapist</label>
                  <select
                    required
                    value={newAppointment.therapist_id}
                    onChange={(e) => setNewAppointment({...newAppointment, therapist_id: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Therapist</option>
                    {therapists.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Date</label>
                  <input
                    type="date"
                    required
                    value={newAppointment.appointment_date}
                    onChange={(e) => setNewAppointment({...newAppointment, appointment_date: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Time</label>
                  <select
                    required
                    value={newAppointment.appointment_time}
                    onChange={(e) => setNewAppointment({...newAppointment, appointment_time: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  >
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-100"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
