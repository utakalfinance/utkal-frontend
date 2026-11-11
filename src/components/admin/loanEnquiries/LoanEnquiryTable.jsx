import React from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  PhoneCall,
  UserCheck,
  XCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

function EnquiryStatusBadge({ status }) {
  const s = String(status || 'New').trim();

  if (s === 'New') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-50 text-amber-800 border border-amber-200">
        <Sparkles className="w-3 h-3 text-amber-600 animate-pulse" />
        <span>New</span>
      </span>
    );
  }

  if (s === 'Contacted') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
        <PhoneCall className="w-3 h-3 text-purple-600" />
        <span>Contacted</span>
      </span>
    );
  }

  if (s === 'Membership Registration Informed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
        <ShieldCheck className="w-3 h-3 text-blue-600" />
        <span>Membership Informed</span>
      </span>
    );
  }

  if (s === 'Converted') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <UserCheck className="w-3 h-3 text-emerald-600" />
        <span>Converted</span>
      </span>
    );
  }

  if (s === 'Closed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200">
        <XCircle className="w-3 h-3 text-slate-500" />
        <span>Closed</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
      <span>{s}</span>
    </span>
  );
}

function formatDate(dateVal) {
  if (!dateVal) return '—';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return String(dateVal);
  }
}

export function LoanEnquiryTable({
  enquiries = [],
  loading = false,
  error = null,
  onViewDetails,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  itemsPerPage = 10,
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center shadow-xs">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-700">Loading loan enquiries from MongoDB...</p>
        <p className="text-xs text-slate-400 mt-1">Connecting to official database records</p>
      </div>
    );
  }

  if (error) {
    const isAuthError =
      typeof error === 'string' &&
      (error.toLowerCase().includes('not authorized') ||
        error.toLowerCase().includes('token') ||
        error.toLowerCase().includes('unauthorized'));

    return (
      <div className="bg-white rounded-3xl border border-red-200 p-8 text-center shadow-xs">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-900">Unable to Load Enquiries</h4>
        <p className="text-xs text-red-600 mt-1 max-w-md mx-auto">{error}</p>
        {isAuthError && (
          <div className="mt-4">
            <Link
              to="/admin-login"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-700/20"
            >
              <span>Sign In to Admin Portal</span>
            </Link>
          </div>
        )}
      </div>
    );
  }

  if (enquiries.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center shadow-xs">
        <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Clock className="w-7 h-7" />
        </div>
        <h4 className="text-base font-bold text-slate-900">No Loan Enquiries Found</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No records match your selected search or filter criteria. Newly submitted visitor enquiries will appear here in real-time.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
      {/* Responsive Table Container */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4 sm:px-6">Enquiry ID</th>
              <th className="py-3.5 px-4 sm:px-6">Full Name</th>
              <th className="py-3.5 px-4 sm:px-6">Mobile Number</th>
              <th className="py-3.5 px-4 sm:px-6">Email Address</th>
              <th className="py-3.5 px-4 sm:px-6">Submission Date</th>
              <th className="py-3.5 px-4 sm:px-6">Status</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {enquiries.map((enq) => {
              const isNew = enq.status === 'New';

              return (
                <tr
                  key={enq._id || enq.enquiryId}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isNew ? 'bg-amber-50/20' : ''
                  }`}
                >
                  {/* 1. Enquiry ID */}
                  <td className="py-3.5 px-4 sm:px-6 font-mono font-black text-blue-700 whitespace-nowrap">
                    {enq.enquiryId}
                  </td>

                  {/* 2. Full Name */}
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span>{enq.fullName}</span>
                      {isNew && (
                        <span className="w-2 h-2 rounded-full bg-amber-500" title="Unread / New" />
                      )}
                    </div>
                  </td>

                  {/* 3. Mobile Number */}
                  <td className="py-3.5 px-4 sm:px-6 text-slate-700 font-mono whitespace-nowrap">
                    <a
                      href={`tel:${enq.mobileNumber}`}
                      className="hover:text-blue-600 hover:underline flex items-center gap-1.5"
                      title="Click to dial"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>+91 {enq.mobileNumber}</span>
                    </a>
                  </td>

                  {/* 4. Email Address */}
                  <td className="py-3.5 px-4 sm:px-6 text-slate-600 whitespace-nowrap">
                    <a
                      href={`mailto:${enq.email}`}
                      className="hover:text-blue-600 hover:underline flex items-center gap-1.5"
                      title="Click to email"
                    >
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate max-w-[180px] sm:max-w-xs">{enq.email}</span>
                    </a>
                  </td>

                  {/* 5. Submission Date */}
                  <td className="py-3.5 px-4 sm:px-6 text-slate-500 text-xs whitespace-nowrap">
                    {formatDate(enq.submittedAt || enq.createdAt)}
                  </td>

                  {/* 6. Status */}
                  <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                    <EnquiryStatusBadge status={enq.status} />
                  </td>

                  {/* 7. Actions */}
                  <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onViewDetails && onViewDetails(enq)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs transition-all shadow-2xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 sm:px-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 bg-slate-50/40">
          <span>
            Page <strong className="font-bold text-slate-900">{currentPage}</strong> of{' '}
            <strong className="font-bold text-slate-900">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoanEnquiryTable;
