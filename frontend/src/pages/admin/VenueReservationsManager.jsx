import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, User, Phone, Users, Clock, Edit2, Trash2, Plus, Sparkles, CheckCircle2, HelpCircle } from 'lucide-react';
import DashboardShell from '../../components/Layout/DashboardShell';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function VenueReservationsManager() {
  const { restaurantId } = useParams();
  const api = createApi(restaurantId);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDayBookings, setSelectedDayBookings] = useState([]);
  const [editingBooking, setEditingBooking] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    event_type: 'Party',
    event_date: '',
    event_time: 'Lunch',
    guest_count: 50,
    notes: '',
    status: 'Discussion',
    customer_father_name: '',
    customer_village: '',
    customer_aadhaar: '',
    venue_areas: ''
  });
  
  const [availableAreas, setAvailableAreas] = useState([
    'Banquet Hall',
    'Main Lawn',
    'AC Rooms',
    'Poolside Area',
    'Terrace Garden',
    'Conference Hall'
  ]);
  const [customAreaInput, setCustomAreaInput] = useState('');
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list'
  const [filterPlace, setFilterPlace] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/venues');
      setBookings(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load venue bookings');
    } finally {
      setLoading(false);
    }
  };

  // Helper date lists for calendar layout
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Pad previous month days
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Present month days
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getBookingsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(b => b.event_date === dateStr);
  };

  const getDayStatusColor = (dayBookings) => {
    if (dayBookings.length === 0) return 'border-emerald-100 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'; // Available
    
    // Check if any is booked/confirmed
    const hasConfirmed = dayBookings.some(b => b.status === 'Confirmed');
    if (hasConfirmed) return 'border-indigo-200 bg-indigo-50 text-indigo-900 hover:bg-indigo-100'; // Booked
    
    const hasDiscussion = dayBookings.some(b => b.status === 'Discussion');
    if (hasDiscussion) return 'border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100'; // Discussion

    return 'border-slate-200 bg-slate-50 text-slate-655 hover:bg-slate-100';
  };

  const handleDayClick = (date) => {
    if (!date) return;
    const dateStr = date.toISOString().split('T')[0];
    const dayBookings = getBookingsForDate(date);
    setSelectedDay(date);
    setSelectedDayBookings(dayBookings);

    // Populate form with defaults for add mode
    setEditingBooking(null);
    setFormData({
      customer_name: '',
      customer_phone: '',
      event_type: 'Party',
      event_date: dateStr,
      event_time: 'Lunch',
      guest_count: 50,
      notes: '',
      status: 'Discussion',
      customer_father_name: '',
      customer_village: '',
      customer_aadhaar: '',
      venue_areas: ''
    });
    setShowModal(true);
  };

  const handleAddBookingDirectly = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setSelectedDay(new Date());
    setEditingBooking(null);
    setFormData({
      customer_name: '',
      customer_phone: '',
      event_type: 'Party',
      event_date: todayStr,
      event_time: 'Lunch',
      guest_count: 50,
      notes: '',
      status: 'Discussion',
      customer_father_name: '',
      customer_village: '',
      customer_aadhaar: '',
      venue_areas: ''
    });
    setShowModal(true);
  };

  const handleEditBooking = (booking) => {
    setEditingBooking(booking);
    setFormData({
      customer_name: booking.customer_name,
      customer_phone: booking.customer_phone,
      event_type: booking.event_type,
      event_date: booking.event_date,
      event_time: booking.event_time,
      guest_count: booking.guest_count,
      notes: booking.notes || '',
      status: booking.status,
      customer_father_name: booking.customer_father_name || '',
      customer_village: booking.customer_village || '',
      customer_aadhaar: booking.customer_aadhaar || '',
      venue_areas: booking.venue_areas || ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        id: editingBooking?.id
      };
      await api.post('/venues', payload);
      toast.success(editingBooking ? 'Reservation modified' : 'Reservation added');
      setShowModal(false);
      fetchBookings();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save reservation');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this venue booking?')) return;
    try {
      await api.delete(`/venues/${id}`);
      toast.success('Reservation deleted');
      setShowModal(false);
      fetchBookings();
    } catch (err) {
      console.error(err);
      toast.error('Failed to cancel reservation');
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (filterPlace) {
      const matchArea = b.venue_areas && b.venue_areas.toLowerCase().includes(filterPlace.toLowerCase());
      const matchVillage = b.customer_village && b.customer_village.toLowerCase().includes(filterPlace.toLowerCase());
      if (!matchArea && !matchVillage) return false;
    }
    if (filterDate && b.event_date !== filterDate) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = b.customer_name && b.customer_name.toLowerCase().includes(q);
      const matchPhone = b.customer_phone && b.customer_phone.includes(q);
      const matchType = b.event_type && b.event_type.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchType) return false;
    }
    return true;
  });

  const days = getDaysInMonth(currentDate);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <DashboardShell title="Venue Bookings" restaurantId={restaurantId} role="admin">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Simple Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <div>
            <h1 className="font-display font-black text-2xl text-slate-800 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Venue Bookings
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Manage lawn, banquet hall, and party venue bookings.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 mr-2">
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'calendar' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Calendar View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'list' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                List View ({filteredBookings.length})
              </button>
            </div>

            <button
              onClick={() => {
                const areaName = prompt("Enter new venue area name:");
                if (areaName && areaName.trim()) {
                  const trimmed = areaName.trim();
                  if (!availableAreas.includes(trimmed)) {
                    setAvailableAreas([...availableAreas, trimmed]);
                    toast.success(`Venue Area "${trimmed}" added!`);
                  } else {
                    toast.error("Area already exists!");
                  }
                }
              }}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add Venue Area
            </button>
            <button
              onClick={handleAddBookingDirectly}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition-all shadow-md hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-3.5 h-3.5" /> Book Venue
            </button>
          </div>
        </div>

        {viewMode === 'calendar' && (
          <>
            {/* Legend */}
            <div className="flex gap-4 p-4 bg-white border border-slate-150 rounded-2xl text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-50 border border-emerald-200"></span> Available / Open
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-50 border border-amber-200"></span> Under Discussion
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-indigo-50 border border-indigo-200"></span> Booked / Confirmed
              </span>
            </div>

            {/* Calendar Card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden animate-fade-in">
              {/* Calendar Controller */}
              <div className="p-6 border-b border-slate-150 flex items-center justify-between">
                <h2 className="font-display font-bold text-xl text-slate-800">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2.5 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-2.5 hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>


          {/* Grid Layout */}
          <div className="grid grid-cols-7 gap-px bg-slate-200 p-px">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="bg-slate-50 py-3 text-center text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">
                <span className="md:hidden">{d[0]}</span>
                <span className="hidden md:inline">{d}</span>
              </div>
            ))}

            {days.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="bg-white min-h-[50px] md:min-h-[100px]" />;
              const dayBookings = getBookingsForDate(day);
              const colorClass = getDayStatusColor(dayBookings);

              return (
                <div
                  key={day.toString()}
                  onClick={() => handleDayClick(day)}
                  className={`bg-white min-h-[55px] md:min-h-[110px] p-1.5 md:p-3 border-t border-slate-100 flex flex-col justify-between cursor-pointer transition-all ${colorClass}`}
                >
                  <div className="text-xs md:text-sm font-bold font-mono">
                    {day.getDate()}
                  </div>

                  <div className="hidden md:block mt-2 space-y-1">
                    {dayBookings.slice(0, 2).map((b) => (
                      <div
                        key={b.id}
                        className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase truncate"
                        style={{
                          backgroundColor: b.status === 'Confirmed' ? '#e0e7ff' : '#fef3c7',
                          color: b.status === 'Confirmed' ? '#3730a3' : '#92400e'
                        }}
                      >
                        {b.event_type}: {b.customer_name}
                      </div>
                    ))}
                    {dayBookings.length > 2 && (
                      <div className="text-[9px] text-slate-500 font-bold pl-1">
                        + {dayBookings.length - 2} more
                      </div>
                    )}
                  </div>

                  {/* Mobile Status Dots */}
                  <div className="flex md:hidden justify-center gap-1 mt-1">
                    {dayBookings.slice(0, 3).map((b) => (
                      <span
                        key={b.id}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor: b.status === 'Confirmed' ? '#4f46e5' : '#d97706'
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    )}

    {viewMode === 'list' && (
      <div className="space-y-6 animate-fade-in">
        {/* Filters Bar */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Filter by Place (Area / Village)
            </label>
            <input
              type="text"
              value={filterPlace}
              onChange={(e) => setFilterPlace(e.target.value)}
              placeholder="e.g. Main Lawn, Delhi..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Filter by Date
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Search Name / Phone / Event
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reservation..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>
        </div>

        {/* List / Cards */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 shadow-sm">
            <p className="text-sm">No reservations matching your filters.</p>
            <button
              onClick={() => {
                setFilterPlace('');
                setFilterDate('');
                setSearchQuery('');
              }}
              className="mt-3 text-xs text-indigo-600 font-bold hover:underline"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBookings.map((b) => (
              <div key={b.id} className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg ${
                        b.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {b.status}
                      </span>
                      <span className="text-xs text-slate-400 font-bold font-mono">{b.event_date} ({b.event_time})</span>
                    </div>
                    
                    {/* Inline Status Toggle/Edit */}
                    <select
                      value={b.status}
                      onChange={async (e) => {
                        try {
                          const newStatus = e.target.value;
                          await api.post('/venues', { ...b, status: newStatus });
                          toast.success("Status updated successfully!");
                          fetchBookings();
                        } catch (err) {
                          toast.error("Failed to update status");
                        }
                      }}
                      className="px-2 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold uppercase rounded-lg focus:outline-none"
                    >
                      <option value="Discussion">Discussion</option>
                      <option value="Confirmed">Confirmed</option>
                    </select>
                  </div>

                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{b.event_type} Booking</h4>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{b.customer_name}</span>
                        {b.customer_father_name && <span className="text-slate-400">(S/o {b.customer_father_name})</span>}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">Phone: {b.customer_phone}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-semibold text-slate-400 block">Guests</span>
                      <span className="text-xs font-bold text-slate-700">{b.guest_count}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 mt-3 pt-3 flex flex-wrap gap-2 text-[10px] text-slate-500">
                    {b.customer_village && (
                      <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                        Place: <strong>{b.customer_village}</strong>
                      </span>
                    )}
                    {b.venue_areas && (
                      <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md">
                        Areas: <strong>{b.venue_areas}</strong>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setSelectedDay(new Date(b.event_date));
                      setSelectedDayBookings(bookings.filter(x => x.event_date === b.event_date));
                      handleEditBooking(b);
                      setShowModal(true);
                    }}
                    className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 transition-all"
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="px-3 py-1.5 hover:bg-rose-50 text-rose-600 rounded-xl font-bold text-xs transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}

        {/* Modal for Day view & booking addition */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-200 max-h-[90vh]">
              
              {/* Left Side: Existing Day Bookings */}
              <div className="w-full md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-slate-150 overflow-y-auto">
                <h3 className="font-display font-black text-lg text-slate-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Bookings for {selectedDay?.toDateString()}
                </h3>

                {selectedDayBookings.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">
                    <p className="text-sm">No reservations on this date.</p>
                    <p className="text-xs mt-1">Fill the form to reserve the venue.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedDayBookings.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => handleEditBooking(b)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          editingBooking?.id === b.id 
                            ? 'border-indigo-600 bg-indigo-50/30' 
                            : 'border-slate-200 hover:border-slate-350'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-lg ${
                            b.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {b.status}
                          </span>
                          <span className="text-xs text-slate-400 font-bold font-mono">{b.event_time}</span>
                        </div>

                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                          {b.event_type} Booking
                        </h4>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            <span>{b.customer_name}</span>
                          </div>
                          {b.customer_father_name && (
                            <div className="flex items-center gap-1">
                              <span className="font-bold">S/o:</span>
                              <span>{b.customer_father_name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{b.customer_phone}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            <span>{b.guest_count} guests</span>
                          </div>
                          {b.customer_village && (
                            <div className="col-span-2 flex items-center gap-1">
                              <span className="font-bold text-slate-400">Village:</span>
                              <span>{b.customer_village}</span>
                            </div>
                          )}
                          {b.customer_aadhaar && (
                            <div className="col-span-2 flex items-center gap-1">
                              <span className="font-bold text-slate-400">Aadhaar:</span>
                              <span className="font-mono">{b.customer_aadhaar}</span>
                            </div>
                          )}
                          {b.venue_areas && (
                            <div className="col-span-2 flex items-center gap-1 bg-indigo-50/50 p-1.5 rounded-lg border border-indigo-100/40 mt-1">
                              <span className="font-bold text-indigo-600">Areas:</span>
                              <span className="text-indigo-800 font-semibold">{b.venue_areas}</span>
                            </div>
                          )}
                        </div>

                        {b.notes && (
                          <p className="text-xs text-slate-400 mt-2 italic bg-slate-50 p-2 rounded-lg">
                            "{b.notes}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Side: Form to add/edit */}
              <form onSubmit={handleSubmit} className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-4">
                  <h3 className="font-display font-black text-lg text-slate-800">
                    {editingBooking ? 'Edit Booking details' : 'New Venue Booking'}
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Customer Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.customer_name}
                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white"
                        placeholder="Customer name"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.customer_phone}
                        onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white"
                        placeholder="Phone number"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Father's Name
                      </label>
                      <input
                        type="text"
                        value={formData.customer_father_name}
                        onChange={(e) => setFormData({ ...formData, customer_father_name: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white"
                        placeholder="Father's name"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Village / Town
                      </label>
                      <input
                        type="text"
                        value={formData.customer_village}
                        onChange={(e) => setFormData({ ...formData, customer_village: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white"
                        placeholder="Village / Town"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Aadhaar Number
                      </label>
                      <input
                        type="text"
                        value={formData.customer_aadhaar}
                        onChange={(e) => setFormData({ ...formData, customer_aadhaar: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white"
                        placeholder="12-digit Aadhaar"
                      />
                    </div>
                    
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Function Type
                      </label>
                      <select
                        value={formData.event_type}
                        onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm"
                      >
                        <option>Party</option>
                        <option>Engagement</option>
                        <option>Marriage</option>
                        <option>Corporate</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Areas Selector */}
                  <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl space-y-3 col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Venue Areas Required (Select Multiple)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableAreas.map((area) => {
                        const isSelected = formData.venue_areas ? formData.venue_areas.split(', ').map(x => x.trim()).includes(area) : false;
                        return (
                          <button
                            key={area}
                            type="button"
                            onClick={() => {
                              const currentAreas = formData.venue_areas ? formData.venue_areas.split(', ').map(x => x.trim()).filter(Boolean) : [];
                              let nextAreas;
                              if (isSelected) {
                                nextAreas = currentAreas.filter(a => a !== area);
                              } else {
                                nextAreas = [...currentAreas, area];
                              }
                              setFormData({ ...formData, venue_areas: nextAreas.join(', ') });
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                              isSelected 
                                ? 'bg-indigo-600 border-indigo-600 text-white font-bold' 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {area}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customAreaInput}
                        onChange={(e) => setCustomAreaInput(e.target.value)}
                        placeholder="Add custom area..."
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const trimmed = customAreaInput.trim();
                          if (trimmed && !availableAreas.includes(trimmed)) {
                            setAvailableAreas([...availableAreas, trimmed]);
                            const currentAreas = formData.venue_areas ? formData.venue_areas.split(', ').map(x => x.trim()).filter(Boolean) : [];
                            setFormData({ ...formData, venue_areas: [...currentAreas, trimmed].join(', ') });
                            setCustomAreaInput('');
                          }
                        }}
                        className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-xl font-bold text-xs transition-colors"
                      >
                        + Add Area
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Event Date
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.event_date}
                        onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Time Slot
                      </label>
                      <select
                        value={formData.event_time}
                        onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm"
                      >
                        <option>Lunch</option>
                        <option>Dinner</option>
                        <option>Full Day</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Expected Guests
                      </label>
                      <input
                        type="number"
                        value={formData.guest_count}
                        onChange={(e) => setFormData({ ...formData, guest_count: parseInt(e.target.value) })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Booking Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm"
                      >
                        <option>Discussion</option>
                        <option>Confirmed</option>
                        <option>Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Special Requirements / Decor
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm h-16 resize-none focus:bg-white"
                      placeholder="e.g. DJ, Sound setup, Specific color themes..."
                    />
                  </div>
                </div>

                <div className="pt-6 flex gap-2">
                  {editingBooking && (
                    <button
                      type="button"
                      onClick={() => handleDelete(editingBooking.id)}
                      className="px-4 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-sm font-semibold transition-colors"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md"
                  >
                    {editingBooking ? 'Save Changes' : 'Confirm Booking'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </DashboardShell>
  );
}
