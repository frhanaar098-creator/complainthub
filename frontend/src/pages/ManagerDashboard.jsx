import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Infrastructure', 'Academics', 'Hostel', 'Library', 'Cafeteria', 'Sports & Recreation', 'Transportation', 'Security', 'Fees & Finance', 'Laboratory', 'WiFi & Internet', 'Cleanliness', 'Faculty & Staff', 'Administration', 'Exam & Evaluation', 'Others'];
const PRIORITIES = ['urgent', 'high', 'medium', 'low'];
const STATUSES = ['pending', 'in_progress', 'resolved', 'rejected', 'withdrawn'];
const PRIORITY_COLORS = {
  urgent: 'bg-red-500 text-white font-semibold',
  high: 'bg-orange-400 text-white font-medium',
  medium: 'bg-amber-300 text-amber-900 font-medium',
  low: 'bg-emerald-200 text-emerald-800 font-medium',
};
const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-slate-200 text-slate-700',
};

export default function ManagerDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showWithdrawn, setShowWithdrawn] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { user, logout } = useAuth();

  const fetchComplaints = () => {
    const params = new URLSearchParams();
    if (sort) params.set('sort', sort);
    if (filterStatus) params.set('status', filterStatus);
    if (filterCategory) params.set('category', filterCategory);
    if (filterPriority) params.set('priority', filterPriority);
    if (showWithdrawn) params.set('showWithdrawn', 'true');
    axios.get(`/api/complaints?${params}`).then(({ data }) => {
      setComplaints(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchComplaints();
  }, [sort, filterStatus, filterCategory, filterPriority, showWithdrawn]);

  const updateComplaint = async (id, updates) => {
    try {
      await axios.patch(`/api/complaints/${id}`, updates);
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update');
    }
  };

  const hasGoodResponse = () => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentComplaints = complaints.filter((c) => new Date(c.createdAt).getTime() > weekAgo);
    return complaints.length > 0 && recentComplaints.length === 0;
  };

  const isPending2Days = (createdAt) => {
    const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return days >= 2;
  };

  const removeComplaint = async (id) => {
    try {
      await axios.delete(`/api/complaints/${id}`);
      setDeleteConfirm(null);
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-md border-b border-indigo-100">
        <div className="max-w-6xl mx-auto px-4 py-4 grid grid-cols-3 items-center">
          <div />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent text-center">
            ComplaintHub
          </h1>
          <div className="flex items-center gap-4 justify-end">
            <span className="text-slate-600 text-sm hidden sm:inline">{user?.name}</span>
            <button onClick={logout} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {!loading && hasGoodResponse() && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 shadow-sm">
            <span className="text-green-600 text-lg">✓</span>
            <span className="text-green-800 font-medium">Good response – No new complaints in the past week</span>
          </div>
        )}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <h2 className="text-lg font-semibold text-slate-700">All Complaints</h2>
          <div className="flex flex-wrap gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
            >
              <option value="">Sort by date (newest)</option>
              <option value="date_asc">Date (oldest first)</option>
              <option value="status">Status</option>
              <option value="priority">Priority</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
            >
              <option value="">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
            >
              <option value="">All priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={showWithdrawn}
                onChange={(e) => setShowWithdrawn(e.target.checked)}
              />
              Show withdrawn
            </label>
          </div>
        </div>

        {loading ? (
          <div className="text-slate-500">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg border border-indigo-100 p-8 text-center text-slate-500">
            No complaints found.
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg border border-indigo-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Title</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Priority</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Category</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Student</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Date</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {complaints.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-slate-800 flex items-center gap-2">
                            {c.title}
                            {c.status === 'pending' && isPending2Days(c.createdAt) && (
                              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-red-500 text-white">
                                2+ days
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 max-w-xs truncate">{c.description}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={c.priority || 'medium'}
                          onChange={(e) => updateComplaint(c._id, { status: c.status, priority: e.target.value })}
                          className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${
                            PRIORITY_COLORS[c.priority || 'medium'] || 'bg-slate-100'
                          }`}
                        >
                          {PRIORITIES.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{c.category}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {c.studentId?.name || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={c.status}
                          onChange={(e) => updateComplaint(c._id, { status: e.target.value, priority: c.priority || 'medium' })}
                          className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${
                            STATUS_COLORS[c.status] || 'bg-slate-100'
                          }`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{s.replace('_', ' ')}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {deleteConfirm === c._id ? (
                          <span className="flex gap-2">
                            <button
                              onClick={() => removeComplaint(c._id)}
                              className="text-xs text-red-600 font-medium hover:underline"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-xs text-slate-600 hover:underline"
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(c._id)}
                            className="text-xs text-red-600 font-medium hover:underline"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
