import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Building2,
  MapPin,
  Mail,
  Phone,
  Users,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Calendar,
  FileText,
  User,
  ArrowRight,
  UserPlus,
} from 'lucide-react';
import { getDistrictByIdApi } from '../../../services/districtService';

export function DistrictDetailsModal({ isOpen, onClose, districtId, onAssignAdmin }) {
  const [district, setDistrict] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !districtId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    getDistrictByIdApi(districtId)
      .then((data) => {
        if (isMounted) setDistrict(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load district details');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, districtId]);

  if (!isOpen) return null;

  const isActive = (district?.status || 'active').toLowerCase() === 'active';

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden text-left animate-slide-up max-h-[82vh] flex flex-col my-auto">
        {/* HEADER */}
        <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#004085] text-white flex items-center justify-center font-bold shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  {district?.name || 'District Overview'}
                </h3>
                {district?.code && (
                  <span className="font-mono text-[10px] font-black bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                    {district.code}
                  </span>
                )}
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {isActive ? 'Active Circle' : 'Inactive Circle'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Regional branch operational overview and live compliance statistics.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          {loading ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs">Fetching real-time records from MongoDB...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center">
              {error}
            </div>
          ) : district ? (
            <>
              {/* 1. DISTRICT SUMMARY METRICS (4 BOXES) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Approved Members
                  </span>
                  <p className="text-xl font-black text-slate-900 font-mono">
                    {district.totalMembers || 0}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified KYC
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Applications
                  </span>
                  <p className="text-xl font-black text-slate-900 font-mono">
                    {district.totalApplications || 0}
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Membership Submissions
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Loan Requests
                  </span>
                  <p className="text-xl font-black text-slate-900 font-mono">
                    {district.totalLoanApplications || 0}
                  </p>
                  <span className="text-[10px] text-blue-700 font-bold">
                    Credit Inquiries
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Approved Loans
                  </span>
                  <p className="text-xl font-black text-emerald-700 font-mono">
                    {district.approvedLoans || 0}
                  </p>
                  <span className="text-[10px] text-amber-700 font-bold">
                    {district.pendingLoanVerifications || 0} Pending Field Verif
                  </span>
                </div>
              </div>

              {/* 2. CONTACT & BRANCH DETAILS */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-700" />
                  <span>Branch Office &amp; Contact Details</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Office Address</span>
                    <p className="font-bold text-slate-800">{district.address}</p>
                    <p className="text-[11px] text-slate-500">{district.state || 'Odisha'}, India</p>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Contact Information</span>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{district.contactNumber}</span>
                    </p>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5 pt-0.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{district.email}</span>
                    </p>
                  </div>
                </div>

                {district.description && (
                  <div className="pt-2 border-t border-slate-100 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                      Circle Notes
                    </span>
                    <p className="text-slate-600 leading-relaxed font-medium">{district.description}</p>
                  </div>
                )}
              </div>

              {/* 3. ASSIGNED DISTRICT ADMIN (PHASE 3 PREPARATION) */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Designated District Admin</span>
                  </h4>
                  <span className="text-[9px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                    Role-Based Access
                  </span>
                </div>

                {district.assignedAdmin?.name && district.assignedAdmin.name !== 'Unassigned' ? (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900">{district.assignedAdmin.name}</p>
                        <p className="text-[11px] text-slate-500">{district.assignedAdmin.email || 'Email not listed'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-slate-600 font-bold hidden sm:inline">
                        {district.assignedAdmin.phone}
                      </span>
                      {onAssignAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onAssignAdmin(district);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                          title="Change / Reassign Admin"
                        >
                          Change
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-800">No District Admin Appointed</p>
                      <p className="text-[11px] text-slate-500">
                        Assign an administrator so they can log in at <span className="font-mono font-semibold">/district-admin/login</span> and open this district dashboard.
                      </p>
                    </div>
                    {onAssignAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onAssignAdmin(district);
                        }}
                        className="px-3.5 py-2 bg-[#004085] hover:bg-[#003366] text-white rounded-xl text-xs font-black shadow-xs cursor-pointer inline-flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>+ Add District Admin</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* 4. DISTRICT ACTIVITY SUMMARY (RECENT AUDIT RECORDS) */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-700" />
                    <span>Recent District Activity &amp; Records</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">Live MongoDB</span>
                </div>

                {district.recentMembers && district.recentMembers.length > 0 ? (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Recently Registered Members
                    </span>
                    <div className="divide-y divide-slate-100">
                      {district.recentMembers.map((m) => (
                        <div key={m._id} className="py-2 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-extrabold text-slate-900">{m.name}</p>
                            <span className="font-mono text-[10px] text-blue-700 font-bold">{m.memberId}</span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">
                            {m.joiningDate || new Date(m.createdAt).toLocaleDateString('en-GB')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center text-slate-400 text-xs">
                    No members registered under this district yet.
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between shrink-0 text-xs">
          <span className="text-slate-400 text-[11px]">
            District Registry ID: {district?._id || '—'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}

export default DistrictDetailsModal;
