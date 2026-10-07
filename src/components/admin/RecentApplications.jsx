import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, ArrowRight, FileText } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { StatusBadge } from './StatusBadge';

export function RecentApplications({ activeFilter = 'ALL', onResetFilter }) {
  const { applications } = useAdmin();
  const navigate = useNavigate();

  const filteredApps = applications.filter((a) => {
    const s = (a.status || '').toLowerCase();
    if (activeFilter === 'PENDING') {
      return s === 'pending' || s === 'submitted' || s === 'correction required' || s === 'correction_required';
    }
    if (activeFilter === 'APPROVED') {
      return s === 'approved';
    }
    if (activeFilter === 'PAYMENTS') {
      return Boolean(a.totalPaid || a.payment?.amount || a.paymentReceiptUrl);
    }
    return true;
  });

  const recent = filteredApps.slice(0, 7);

  const getFilterTitle = () => {
    if (activeFilter === 'PENDING') return 'Pending Review Applications';
    if (activeFilter === 'APPROVED') return 'Approved Member Applications';
    if (activeFilter === 'PAYMENTS') return 'Applications with Payment Records';
    return 'Recent Statutory Applications';
  };

  const getFilterBadge = () => {
    if (activeFilter === 'PENDING') return { text: 'PENDING', bg: 'bg-amber-100 text-amber-800' };
    if (activeFilter === 'APPROVED') return { text: 'APPROVED', bg: 'bg-emerald-100 text-emerald-800' };
    if (activeFilter === 'PAYMENTS') return { text: 'PAYMENTS', bg: 'bg-blue-100 text-blue-800' };
    return { text: 'ALL', bg: 'bg-slate-100 text-slate-700' };
  };

  const badge = getFilterBadge();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden text-left space-y-0">
      <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-700" />
              <span>{getFilterTitle()}</span>
            </h3>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.bg}`}>
              {filteredApps.length} total
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {activeFilter === 'ALL'
              ? 'Latest membership registrations submitted for statutory approval.'
              : `Showing records filtered by ${getFilterTitle().toLowerCase()}.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeFilter !== 'ALL' && (
            <button
              type="button"
              onClick={onResetFilter}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-colors cursor-pointer"
            >
              Show All
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (activeFilter === 'PAYMENTS') {
                navigate('/admin-dashboard/payments');
              } else {
                navigate('/admin-dashboard/applications');
              }
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors cursor-pointer"
          >
            <span>View Full Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* MOBILE CARDS VIEW (Phone screens < 640px) */}
      <div className="block sm:hidden divide-y divide-slate-100 p-3 space-y-3">
        {recent.map((app) => (
          <div key={app.id} className="bg-slate-50/70 rounded-xl p-3.5 space-y-2 border border-slate-200/60">
            <div className="flex items-center justify-between">
              <span className="font-mono font-extrabold text-blue-700 text-xs">{app.id}</span>
              <StatusBadge status={app.status} />
            </div>

            <div className="flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-900">{app.applicantName}</div>
                <div className="text-[11px] text-slate-500 font-mono">{app.mobile}</div>
              </div>
              <div className="text-right">
                <div className="font-black text-slate-900">₹{app.totalPaid || 200}</div>
                <div className="text-[10px] text-slate-400">{app.date}</div>
              </div>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => navigate(`/admin-dashboard/applications/${app.id}`)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Dossier</span>
              </button>
            </div>
          </div>
        ))}
        {recent.length === 0 && (
          <div className="py-8 text-center text-slate-500 text-xs font-medium">
            No statutory applications submitted yet.
          </div>
        )}
      </div>

      {/* DESKTOP/TABLET TABLE VIEW (sm+ screens >= 640px) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4">APPLICATION ID</th>
              <th className="py-3 px-4">APPLICANT</th>
              <th className="py-3 px-4">MOBILE</th>
              <th className="py-3 px-4">DATE</th>
              <th className="py-3 px-4">PAYMENT</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {recent.map((app) => (
              <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-mono font-extrabold text-blue-700">{app.id}</td>
                <td className="py-3 px-4 font-bold text-slate-900">{app.applicantName}</td>
                <td className="py-3 px-4 font-mono">{app.mobile}</td>
                <td className="py-3 px-4 text-slate-500">{app.date}</td>
                <td className="py-3 px-4 font-extrabold text-slate-900">₹{app.totalPaid || 200}</td>
                <td className="py-3 px-4">
                  <StatusBadge status={app.status} />
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => navigate(`/admin-dashboard/applications/${app.id}`)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>
                </td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr>
                <td colSpan="7" className="py-10 text-center text-slate-500 text-xs font-medium">
                  No applications submitted yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecentApplications;
