import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Mail,
  Phone,
  AtSign,
  MapPin,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { getDistrictAdminByIdApi } from '../../../services/districtAdminService';

export function DistrictAdminDetailsModal({
  isOpen,
  onClose,
  adminId,
}) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && adminId) {
      setLoading(true);
      setError('');
      getDistrictAdminByIdApi(adminId)
        .then((data) => setAdmin(data))
        .catch((err) => setError(err.message || 'Failed to load details'))
        .finally(() => setLoading(false));
    }
  }, [isOpen, adminId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                District Administrator Profile
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verified circle administration dossier
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent" />
              <p className="mt-3 text-xs text-slate-500">Loading administrator details...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs">{error}</div>
          ) : admin ? (
            <div className="space-y-5">
              {/* Profile Card */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
                  {admin.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {admin.name}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        admin.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-600 border border-slate-300 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {admin.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    @{admin.username}
                  </p>
                  <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                    <MapPin className="w-3 h-3" />
                    <span>{admin.assignedDistrict || 'Unassigned'} Circle</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Contact & Access Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email Address</span>
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 break-all">
                      {admin.email}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                      <Phone className="w-3.5 h-3.5" />
                      <span>Mobile Number</span>
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                      {admin.mobile || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* District Loan Statistics */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Circle Loan Statistics ({admin.assignedDistrict})
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20">
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase">
                      Total Loans
                    </p>
                    <p className="text-xl font-bold text-blue-900 dark:text-blue-200 mt-1">
                      {admin.stats?.totalLoans ?? 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold uppercase">
                      Pending
                    </p>
                    <p className="text-xl font-bold text-amber-900 dark:text-amber-200 mt-1">
                      {admin.stats?.pendingVerifications ?? 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20">
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">
                      Verified
                    </p>
                    <p className="text-xl font-bold text-emerald-900 dark:text-emerald-200 mt-1">
                      {admin.stats?.verifiedLoans ?? 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Created: {new Date(admin.createdAt).toLocaleDateString('en-GB')}</span>
                <span>Account Role: district_admin</span>
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
