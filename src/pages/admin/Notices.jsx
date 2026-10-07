import React, { useState, useEffect } from 'react';
import { Plus, Bell, Edit2, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export function Notices() {
  const { notices, addNotice, updateNotice, deleteNotice, markAllNoticesAsSeen } = useAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (typeof markAllNoticesAsSeen === 'function') {
      markAllNoticesAsSeen();
    }
  }, [markAllNoticesAsSeen]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('High');
  const [status, setStatus] = useState('Active');

  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setPriority('High');
    setStatus('Active');
    setModalOpen(true);
  };

  const handleOpenEdit = (notice) => {
    setEditingId(notice.id);
    setTitle(notice.title);
    setDescription(notice.description);
    setPriority(notice.priority || 'High');
    setStatus(notice.status || 'Active');
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    if (editingId) {
      updateNotice(editingId, { title, description, priority, status });
    } else {
      addNotice({ title, description, priority, status });
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Notice Board Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Publish official board announcements, regulatory AGM notices, and member circulars.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#004085] hover:bg-blue-900 text-white font-black text-xs uppercase tracking-wider shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Add Notice</span>
        </button>
      </div>

      {/* NOTICES LIST */}
      <div className="grid grid-cols-1 gap-4">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3 relative hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      notice.priority === 'High'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : notice.priority === 'Medium'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {notice.priority} Priority
                  </span>

                  <span className="text-[11px] font-bold text-slate-400 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{notice.date}</span>
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-900 tracking-tight pt-1">{notice.title}</h3>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(notice)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-slate-100 transition-colors"
                  title="Edit Notice"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteNotice(notice.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                  title="Delete Notice"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-normal">{notice.description}</p>
          </div>
        ))}
      </div>

      {/* ADD / EDIT NOTICE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-8 w-[calc(100%-24px)] max-w-lg max-h-[85vh] overflow-y-auto space-y-5 animate-fade-in text-left">
            <h3 className="text-lg font-black text-slate-900">
              {editingId ? 'Edit Official Notice' : 'Publish New Notice'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Notice Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Annual General Body Meeting 2026 Notice"
                  className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-3 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Description / Details</label>
                <textarea
                  required
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide complete text of the notice..."
                  className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-3 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-3 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Normal">Normal</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-3 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#004085] hover:bg-blue-900 text-white font-black text-xs uppercase tracking-wider shadow-md cursor-pointer"
                >
                  Save Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notices;
