import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  Filter,
  Download,
  MoreVertical,
  UserCheck
} from 'lucide-react';
import DashboardShell from '../../components/Layout/DashboardShell';
import { createApi } from '../../api/client';
import toast from 'react-hot-toast';

export default function AttendeeManager() {
  const { restaurantId, tenantId } = useParams();
  const currentId = tenantId || restaurantId;
  const api = createApi(currentId);

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data);
      if (res.data.length > 0) {
        setSelectedEventId(res.data[0].id);
        fetchAttendees(res.data[0].id);
      }
    } catch (err) {
      toast.error('Failed to load events');
    }
  };

  const fetchAttendees = async (eventId) => {
    try {
      setLoading(true);
      const res = await api.get(`/events/${eventId}/attendees`);
      setAttendees(res.data);
    } catch (err) {
      toast.error('Failed to load attendees');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (attendeeId) => {
    try {
      await api.post(`/attendees/${attendeeId}/checkin`);
      toast.success('Attendee checked in');
      fetchAttendees(selectedEventId);
    } catch (err) {
      toast.error('Check-in failed');
    }
  };

  const filteredAttendees = attendees.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.email && a.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const content = (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <div>
            <h1 className="font-display font-black text-2xl text-slate-800 tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600" />
              Attendees
            </h1>
            <div className="mt-2 flex items-center gap-3">
              <select
                value={selectedEventId}
                onChange={(e) => { setSelectedEventId(e.target.value); fetchAttendees(e.target.value); }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
              >
                {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-2xl text-xs transition-all border border-slate-200 hover:bg-slate-200">
              <Download className="w-4 h-4" /> Export List
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md">
              <Plus className="w-4 h-4" /> Register Attendee
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase mr-2">Quick Stats:</span>
              <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-black uppercase">
                {attendees.length} Total
              </div>
              <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase">
                {attendees.filter(a => a.status === 'Checked-in').length} Present
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 text-left border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Attendee</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Registration Date</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAttendees.map((attendee) => (
                  <tr key={attendee.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                          {attendee.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{attendee.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Ticket ID: #{attendee.ticket_id || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{attendee.email || 'No email'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{attendee.phone || 'No phone'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                        attendee.status === 'Checked-in'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {attendee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(attendee.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {attendee.status !== 'Checked-in' && (
                          <button
                            onClick={() => handleCheckIn(attendee.id)}
                            className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all"
                            title="Check-in"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAttendees.length === 0 && (
            <div className="py-20 text-center">
              <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 text-sm font-medium">No attendees found for this event.</p>
            </div>
          )}
        </div>
      </div>
  );

  if (tenantId) {
    return content;
  }

  return (
    <DashboardShell title="Attendee Management" restaurantId={restaurantId} role="admin">
      {content}
    </DashboardShell>
  );
}
