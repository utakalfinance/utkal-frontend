import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, CheckCircle2, XCircle, Clock, Edit, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';

export function ApplicationTable({ applications, onApprove, onReject, onEdit, onViewReceipt, onDelete }) {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      {/* MOBILE CARDS VIEW (Phone screens < 768px) */}
      <div className="block md:hidden space-y-3">
        {applications.map((app) => {
          const statusLower = (app.status || '').toLowerCase();
          const isApproved = statusLower === 'approved';
          const isRejected = statusLower === 'rejected';
          const isPending = statusLower === 'pending';

          return (
            <div
              key={app.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3 shadow-xs text-left"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <span className="font-mono font-extrabold text-[#0b1c3d] text-xs block">{app.id}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{app.date}</span>
                </div>
                <div>
                  {isApproved && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#e6f7ed] text-[#00a854] border border-emerald-300 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Approved</span>
                    </span>
                  )}
                  {isRejected && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-300 inline-flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      <span>Rejected</span>
                    </span>
                  )}
                  {isPending && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Pending</span>
                    </span>
                  )}
                  {!isApproved && !isRejected && !isPending && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 inline-block">
                      {app.status}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <div className="font-extrabold text-slate-900 text-sm">{app.applicantName}</div>
                <div className="text-[11px] text-slate-500 font-mono">{app.email}</div>
                <div className="text-[11px] text-slate-500 font-mono">{app.mobile}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs items-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Payment Status</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-extrabold text-emerald-700 text-xs">₹{app.totalPaid || 200}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewReceipt && onViewReceipt(app);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-[10px] border border-blue-200 inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <ImageIcon className="w-3 h-3 text-blue-600" />
                      <span>Receipt</span>
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Branch</span>
                  <span className="font-bold text-slate-800 text-[11px] truncate block">{app.branch || 'Bhubaneswar HQ'}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch gap-2">
                <div className="grid grid-cols-3 gap-1.5 w-full">
                  <button
                    type="button"
                    onClick={() => navigate(`/admin-dashboard/applications/${app.id}`)}
                    className="inline-flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onViewReceipt && onViewReceipt(app)}
                    className="inline-flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200/80 font-bold text-xs transition-colors cursor-pointer"
                    title="View Receipt Screenshot"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Receipt</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onEdit && onEdit(app)}
                    className="inline-flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-amber-700" />
                    <span>Edit</span>
                  </button>
                </div>

                {isRejected && (
                  <button
                    type="button"
                    onClick={() => onDelete && onDelete(app)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/90 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Delete Rejected Application</span>
                  </button>
                )}

                {isPending && (
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => onApprove(app)}
                      className="inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onReject(app)}
                      className="inline-flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {applications.length === 0 && (
          <div className="py-10 text-center text-slate-500 text-xs bg-white rounded-2xl border border-slate-200">
            No membership applications found.
          </div>
        )}
      </div>

      {/* DESKTOP/TABLET TABLE VIEW (md+ screens >= 768px) */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200/80">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200/90 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4">APPLICATION ID</th>
              <th className="py-3 px-4">APPLICANT DETAILS</th>
              <th className="py-3 px-4">ASSIGNED BRANCH</th>
              <th className="py-3 px-4">SHARE &amp; FEE (RECEIPT)</th>
              <th className="py-3 px-4">KYC DOCUMENTS</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {applications.map((app) => {
              const initial = app.applicantName
                ? app.applicantName.replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.)\s+/i, '').charAt(0).toUpperCase()
                : 'A';

              const statusLower = (app.status || '').toLowerCase();
              const isApproved = statusLower === 'approved';
              const isRejected = statusLower === 'rejected';
              const isPending = statusLower === 'pending';

              return (
                <tr
                  key={app.id}
                  onClick={() => navigate(`/admin-dashboard/applications/${app.id}`)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  {/* 1. APPLICATION ID & DATE */}
                  <td className="py-3.5 px-4 font-mono">
                    <div className="font-extrabold text-[#0b1c3d] text-xs">{app.id}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{app.date}</div>
                  </td>

                  {/* 2. APPLICANT DETAILS WITH AVATAR */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#0b1c3d] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-slate-900 text-xs truncate">
                          {app.applicantName}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate max-w-[200px]">
                          {app.mobile} • {app.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 3. ASSIGNED BRANCH & CODE */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-800 text-xs">{app.branch || 'Bhubaneswar HQ (Nayapalli, IRC Village)'}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">Code: 075101</div>
                  </td>

                  {/* 4. SHARE & FEE & RECEIPT */}
                  <td className="py-3.5 px-4 space-y-1" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-xs">₹{app.totalPaid || 200}</span>
                      <button
                        type="button"
                        onClick={() => onViewReceipt && onViewReceipt(app)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] border border-blue-200 transition-colors shadow-2xs cursor-pointer"
                        title="Click to inspect Payment Screenshot"
                      >
                        <ImageIcon className="w-3 h-3 text-blue-600" />
                        <span>View Receipt</span>
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Ref: {app.utrNo || 'UPI_ATTACHED'}
                    </div>
                  </td>

                  {/* 5. KYC DOCUMENTS */}
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold inline-flex items-center gap-1 ${
                      isApproved ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {isApproved ? '5/5 Verified' : '0/5 Verified'}
                    </span>
                  </td>

                  {/* 6. STATUS */}
                  <td className="py-3.5 px-4 space-y-1">
                    <div>
                      {isApproved && (
                        <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#e6f7ed] text-[#00a854] border border-emerald-300 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approved</span>
                        </span>
                      )}

                      {isRejected && (
                        <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-rose-50 text-rose-700 border border-rose-300 inline-flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Rejected</span>
                        </span>
                      )}

                      {isPending && (
                        <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending</span>
                        </span>
                      )}

                      {!isApproved && !isRejected && !isPending && (
                        <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 inline-block">
                          {app.status}
                        </span>
                      )}
                    </div>

                    {isApproved && (
                      <div className="text-[10px] font-mono text-slate-400 font-bold">
                        {app.memberId || app.id}
                      </div>
                    )}
                  </td>

                  {/* 7. ACTIONS */}
                  <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onViewReceipt && onViewReceipt(app)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold text-[11px] transition-colors cursor-pointer"
                      title="Inspect Payment Receipt"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Receipt</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate(`/admin-dashboard/applications/${app.id}`)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-[11px] transition-colors cursor-pointer"
                      title="View Dossier"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onEdit && onEdit(app)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-bold text-[11px] transition-colors cursor-pointer"
                      title="Edit Application"
                    >
                      <Edit className="w-3.5 h-3.5 text-amber-700" />
                      <span>Edit</span>
                    </button>

                    {isRejected && (
                      <button
                        type="button"
                        onClick={() => onDelete && onDelete(app)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] transition-colors cursor-pointer"
                        title="Delete Rejected Application"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Delete</span>
                      </button>
                    )}

                    {isPending && (
                      <>
                        <button
                          type="button"
                          onClick={() => onApprove(app)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] transition-colors cursor-pointer"
                          title="Approve Application"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onReject(app)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition-colors cursor-pointer"
                          title="Reject Application"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}

            {applications.length === 0 && (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-500 text-xs font-medium">
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

export default ApplicationTable;

