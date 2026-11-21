import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Edit,
  FileText,
  Trash2,
  UserCheck,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

export function ApplicationTable({
  applications,
  onApprove,
  onReject,
  onEdit,
  onViewReceipt,
  onDelete,
  districts = [],
}) {
  const navigate = useNavigate();
  const [openDropdownId, setOpenDropdownId] = useState(null);

  useEffect(() => {
    const handleOutsideClick = () => setOpenDropdownId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const getBranchCode = (app) => {
    if (app.branchCode) return app.branchCode;
    if (app.districtCode) return app.districtCode;
    if (districts && districts.length > 0) {
      const branchText = `${app.branch || ''} ${app.district || ''}`.toLowerCase();
      const matched = districts.find((d) => {
        const dName = (d.name || '').toLowerCase().trim();
        return dName && branchText.includes(dName);
      });
      if (matched && matched.code) return matched.code;
    }
    return '075101';
  };

  return (
    <div className="w-full">
      {/* MOBILE CARDS VIEW (Phone screens < 768px) */}
      <div className="block md:hidden space-y-3">
        {applications.map((app) => {
          const statusLower = (app.status || '').toLowerCase();
          const isApproved = statusLower === 'approved';
          const isRejected = statusLower === 'rejected';
          const isPending = statusLower === 'pending';
          const uploadedKycCount = [app.photoUrl, app.idProofUrl, app.addressProofUrl, app.signatureUrl, app.paymentReceiptUrl].filter(Boolean).length;

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

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">KYC Verification Status</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold inline-flex items-center gap-1 ${
                  isApproved
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : uploadedKycCount >= 3
                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {isApproved ? '5/5 Verified' : `${uploadedKycCount}/5 Uploaded`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs items-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Payment Status</span>
                  <div className="mt-0.5">
                    <span className="font-extrabold text-emerald-700 text-xs">₹{app.totalPaid || 200}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Branch</span>
                  <span className="font-bold text-slate-800 text-[11px] truncate block">{app.branch || 'Bhubaneswar HQ'}</span>
                  <span className="text-[9px] text-slate-400 font-mono block">Code: {getBranchCode(app)}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch gap-2">
                <div className="grid grid-cols-2 gap-1.5 w-full">
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
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit && onEdit(app);
                    }}
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
                  <div className="space-y-2 w-full pt-1">
                    <div className="relative w-full">
                      <div className="grid grid-cols-2 gap-2 w-full">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === app.id ? null : app.id);
                          }}
                          className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                          title="Choose Approval Option"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdownId === app.id ? 'rotate-180' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onReject(app)}
                          className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-colors cursor-pointer"
                          title="Reject Application"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>

                      {/* Dropdown Options for Mobile */}
                      {openDropdownId === app.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="mt-2 w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-left space-y-1 animate-fade-in"
                        >
                          <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Select Approval Role
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenDropdownId(null);
                              onApprove(app, 'member');
                            }}
                            className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 transition-all flex items-start gap-2.5 cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                              <UserCheck className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-black text-slate-900">Approve as Member</div>
                              <div className="text-[10px] text-slate-500">Regular Member with loans & savings</div>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenDropdownId(null);
                              onApprove(app, 'associate');
                            }}
                            className="w-full text-left p-2.5 rounded-xl hover:bg-blue-50 border border-slate-100 hover:border-blue-200 transition-all flex items-start gap-2.5 cursor-pointer"
                          >
                            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                              <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-black text-slate-900">Approve as Associate</div>
                              <div className="text-[10px] text-slate-500">Associate role for customer sourcing & earnings</div>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
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
              <th className="py-3 px-4">SHARE &amp; FEE</th>
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
              const uploadedKycCount = [app.photoUrl, app.idProofUrl, app.addressProofUrl, app.signatureUrl, app.paymentReceiptUrl].filter(Boolean).length;

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
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">Code: {getBranchCode(app)}</div>
                  </td>

                  {/* 4. SHARE & FEE */}
                  <td className="py-3.5 px-4 space-y-0.5" onClick={(e) => e.stopPropagation()}>
                    <div className="font-black text-slate-900 text-xs">₹{app.totalPaid || 200}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Ref: {app.utrNo || 'UPI_ATTACHED'}
                    </div>
                  </td>

                  {/* 5. KYC DOCUMENTS */}
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold inline-flex items-center gap-1 ${
                      isApproved
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : uploadedKycCount >= 3
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {isApproved ? '5/5 Verified' : `${uploadedKycCount}/5 Uploaded`}
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
                      onClick={() => navigate(`/admin-dashboard/applications/${app.id}`)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-[11px] transition-colors cursor-pointer"
                      title="View Dossier"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit && onEdit(app);
                      }}
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
                        <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(openDropdownId === app.id ? null : app.id);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-all shadow-2xs cursor-pointer"
                            title="Approve Application"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            <span>Approve</span>
                            <ChevronDown className={`w-3 h-3 text-white transition-transform ${openDropdownId === app.id ? 'rotate-180' : ''}`} />
                          </button>

                          {openDropdownId === app.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 mt-1.5 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-[100] text-left animate-fade-in"
                            >
                              <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                Choose Approval Role
                              </div>
                              <div className="space-y-1 mt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    onApprove(app, 'member');
                                  }}
                                  className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 transition-all flex items-start gap-2.5 cursor-pointer group"
                                >
                                  <div className="w-7 h-7 rounded-lg bg-emerald-100 group-hover:bg-emerald-600 text-emerald-700 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                                    <UserCheck className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="text-xs font-black text-slate-900 group-hover:text-emerald-800">
                                      Approve as Member
                                    </div>
                                    <div className="text-[10px] text-slate-500 leading-tight">
                                      Regular Member with deposit & loan access
                                    </div>
                                  </div>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    onApprove(app, 'associate');
                                  }}
                                  className="w-full text-left p-2.5 rounded-xl hover:bg-blue-50 border border-slate-100 hover:border-blue-200 transition-all flex items-start gap-2.5 cursor-pointer group"
                                >
                                  <div className="w-7 h-7 rounded-lg bg-blue-100 group-hover:bg-blue-600 text-blue-700 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                                    <ShieldCheck className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="text-xs font-black text-slate-900 group-hover:text-blue-800">
                                      Approve as Associate
                                    </div>
                                    <div className="text-[10px] text-slate-500 leading-tight">
                                      Associate Member for customer sourcing & earnings
                                    </div>
                                  </div>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => onReject(app)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/90 font-bold text-[11px] transition-colors cursor-pointer"
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

