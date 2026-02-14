import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Infrastructure', 'Academics', 'Hostel', 'Library', 'Cafeteria', 'Sports & Recreation', 'Transportation', 'Security', 'Fees & Finance', 'Laboratory', 'WiFi & Internet', 'Cleanliness', 'Faculty & Staff', 'Administration', 'Exam & Evaluation', 'Others'];
const PRIORITIES = [
  { value: 'urgent', label: 'Urgent', class: 'bg-red-500 text-white font-semibold' },
  { value: 'high', label: 'High', class: 'bg-orange-400 text-white font-medium' },
  { value: 'medium', label: 'Medium', class: 'bg-amber-300 text-amber-900 font-medium' },
  { value: 'low', label: 'Low', class: 'bg-emerald-200 text-emerald-800 font-medium' },
];
const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-slate-200 text-slate-700',
};

const API_BASE = '';
const UPLOAD_URL = (path) => (path ? `${API_BASE}/uploads/complaints/${path}` : null);

export default function StudentDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Infrastructure');
  const [priority, setPriority] = useState('medium');
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user, logout } = useAuth();

  const fetchComplaints = () => {
    axios.get('/api/complaints').then(({ data }) => {
      setComplaints(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('Infrastructure');
    setPriority('medium');
    setAttachments([]);
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const startEdit = (c) => {
    setEditingId(c._id);
    setTitle(c.title);
    setDescription(c.description);
    setCategory(c.category);
    setPriority(c.priority || 'medium');
    setAttachments([]);
    setError('');
  };

  const isPending2Days = (createdAt) => {
    const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return days >= 2;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('priority', priority);
      attachments.forEach((file) => formData.append('attachments', file));
      await axios.post('/api/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      resetForm();
      fetchComplaints();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('priority', priority);
      attachments.forEach((file) => formData.append('attachments', file));
      await axios.patch(`/api/complaints/${editingId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      resetForm();
      fetchComplaints();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw this complaint?')) return;
    try {
      await axios.post(`/api/complaints/${id}/withdraw`);
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to withdraw');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-md border-b border-indigo-100">
        <div className="max-w-4xl mx-auto px-4 py-4 grid grid-cols-3 items-center">
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

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-700">My Complaints</h2>
          {!editingId && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 text-sm font-medium shadow-md"
            >
              {showForm ? 'Cancel' : 'Raise Complaint'}
            </button>
          )}
        </div>

        {(showForm || editingId) && (
          <form
            onSubmit={editingId ? handleEdit : handleCreate}
            className="mb-8 p-6 bg-white/90 backdrop-blur rounded-xl shadow-lg border border-indigo-100 space-y-4"
          >
            <h3 className="font-semibold text-slate-800">
              {editingId ? 'Edit Complaint' : 'New Complaint'}
            </h3>
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Attachments {editingId && '(add more)'}
              </label>
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx"
                onChange={(e) => setAttachments(Array.from(e.target.files))}
                className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-indigo-50 file:text-indigo-700"
              />
              <p className="text-xs text-slate-500 mt-1">
                Images (jpg, png, gif, webp) or documents (pdf, doc, docx). Max 5 files, 5MB each.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Submit Complaint'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-slate-500">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg border border-indigo-100 p-8 text-center text-slate-500">
            No complaints yet. Click &quot;Raise Complaint&quot; to create one.
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((c) => (
              <div
                key={c._id}
                className="bg-white/90 backdrop-blur rounded-xl shadow-md border border-indigo-100 p-4 hover:shadow-lg hover:border-indigo-200 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-slate-800">{c.title}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        PRIORITIES.find((p) => p.value === (c.priority || 'medium'))?.class || 'bg-slate-100'
                      }`}
                    >
                      {c.priority || 'medium'}
                    </span>
                    {c.status === 'pending' && isPending2Days(c.createdAt) && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500 text-white">
                        Pending 2+ days
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        STATUS_COLORS[c.status] || 'bg-slate-100'
                      }`}
                    >
                      {c.status.replace('_', ' ')}
                    </span>
                    {c.status === 'pending' && editingId !== c._id && (
                      <>
                        <button
                          onClick={() => startEdit(c)}
                          className="text-xs text-indigo-600 font-medium hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleWithdraw(c._id)}
                          className="text-xs text-red-600 font-medium hover:underline"
                        >
                          Withdraw
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-2">{c.description}</p>
                {c.attachments && c.attachments.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {c.attachments.map((a, i) => (
                      <a
                        key={i}
                        href={UPLOAD_URL(a.filename)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-1 bg-slate-100 rounded hover:bg-slate-200 text-indigo-600"
                      >
                        {a.originalName}
                      </a>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 text-xs text-slate-500">
                  <span>{c.category}</span>
                  <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
