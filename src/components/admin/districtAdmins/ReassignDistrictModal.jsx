import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin, AlertCircle, ArrowRight } from 'lucide-react';

export function ReassignDistrictModal({
  isOpen,
  onClose,
  onSubmit,
  admin,
  districts = [],
}) {
  const [targetDistrictId, setTargetDistrictId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (isOpen && admin) {
      setTargetDistrictId('');
      setServerError('');
    }
  }, [isOpen, admin]);

  if (!isOpen || !admin) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetDistrictId) {
      setServerError('Please select a target circle district');
      return;
    }

    setSubmitting(true);
    setServerError('');
    try {
      await onSubmit(admin._id || admin.id, targetDistrictId);
      onClose();
    } catch (err) {
      setServerError(err.message || 'Failed to reassign district');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTargetDistrict = districts.find((d) => d._id === targetDistrictId);

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden max-h-[82vh] flex flex-col my-auto text-left animate-slide-up">
        {/* Header - Fixed */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Reassign Circle District
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transfer {admin.name} to another district
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
            {serverError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Current Assignment Badge */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Current Assignment
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {admin.assignedDistrict || 'Unassigned'}
                </span>
                {admin.districtCode && (
                  <span className="text-xs font-mono text-slate-500 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-md">
                    {admin.districtCode}
                  </span>
                )}
              </div>
            </div>

            {/* New District Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Transfer to District <span className="text-red-500">*</span>
              </label>
              <select
                value={targetDistrictId}
                onChange={(e) => setTargetDistrictId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select New District</option>
                {districts
                  .filter((d) => d._id !== admin.districtId)
                  .map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} {d.code ? `(${d.code})` : ''} - {d.assignedAdmin?.name ? `(Current: ${d.assignedAdmin.name})` : '(Vacant)'}
                    </option>
                  ))}
              </select>
            </div>

            {/* Transfer Preview */}
            {selectedTargetDistrict && (
              <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 rounded-xl text-xs text-indigo-900 dark:text-indigo-300 flex items-center justify-between">
                <div>
                  <span className="text-slate-500">From:</span> <span className="font-semibold">{admin.assignedDistrict}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-600" />
                <div>
                  <span className="text-slate-500">To:</span> <span className="font-bold">{selectedTargetDistrict.name}</span>
                </div>
              </div>
            )}

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Reassigning will grant this administrator permissions to view and verify loan applications submitted under the new circle only.
            </p>
          </div>

          {/* Pinned Footer */}
          <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !targetDistrictId}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-black rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Reassigning...' : 'Confirm Reassignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
