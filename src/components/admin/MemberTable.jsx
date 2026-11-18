import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, UserX, UserCheck, Edit, MapPin } from 'lucide-react';
import { MemberStatusBadge } from './MemberStatusBadge';

export function MemberTable({ members = [], onToggleStatus, onEdit }) {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      {/* MOBILE CARDS VIEW (Phone screens < 768px) */}
      <div className="block md:hidden space-y-3">
        {members.map((m) => {
          const memberId = m.memberId || m.id;
          const appId = m.applicationId || m.app?.id || 'NUF-1001';
          const name = m.applicantName || m.name;
          const isAssociate = m.role === 'associate' || m.isAssociate === true;

          return (
            <div
              key={memberId}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3 shadow-xs text-left"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <span className="font-mono font-black text-[#0b1c3d] text-xs block">{memberId}</span>
                  <span className="text-[10px] text-blue-700 font-mono font-bold block mt-0.5">App ID: {appId}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {isAssociate ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      Associate
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                      Regular
                    </span>
                  )}
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    <MapPin className="w-2.5 h-2.5" />
                    <span>{m.district || m.addressDetails?.district || m.addressDetails?.commDistrict || 'Odisha'}</span>
                  </span>
                  <MemberStatusBadge status={m.membershipStatus} />
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <div className="font-extrabold text-slate-900 text-sm">{name}</div>
                <div className="text-[11px] text-slate-500 font-mono">{m.email}</div>
                <div className="text-[11px] text-slate-500 font-mono">{m.mobile}</div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                Joining Date: <strong className="text-slate-700 font-bold">{m.joiningDate}</strong>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch gap-2">
                <div className="grid grid-cols-2 gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => navigate(`/admin-dashboard/members/${memberId}`)}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onEdit && onEdit(m)}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Edit className="w-4 h-4 text-amber-700" />
                    <span>Edit Profile</span>
                  </button>
                </div>

                {onToggleStatus && (
                  <button
                    type="button"
                    onClick={() =>
                      onToggleStatus(memberId, m.membershipStatus === 'Active' ? 'Inactive' : 'Active')
                    }
                    className={`w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      m.membershipStatus === 'Active'
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {m.membershipStatus === 'Active' ? (
                      <>
                        <UserX className="w-4 h-4" />
                        <span>Deactivate Member</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Activate Member</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {members.length === 0 && (
          <div className="py-10 text-center text-slate-500 text-xs bg-white rounded-2xl border border-slate-200">
            No registered members found.
          </div>
        )}
      </div>

      {/* DESKTOP/TABLET TABLE VIEW (md+ screens >= 768px) */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200/90">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200/90 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="py-3.5 px-4">MEMBER ID</th>
              <th className="py-3.5 px-4">APPLICATION ID</th>
              <th className="py-3.5 px-4">MEMBER NAME</th>
              <th className="py-3.5 px-4">MEMBERSHIP CLASS</th>
              <th className="py-3.5 px-4">DISTRICT</th>
              <th className="py-3.5 px-4">EMAIL</th>
              <th className="py-3.5 px-4">MOBILE</th>
              <th className="py-3.5 px-4">JOINING DATE</th>
              <th className="py-3.5 px-4">MEMBERSHIP STATUS</th>
              <th className="py-3.5 px-4 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {members.map((m) => {
              const memberId = m.memberId || m.id;
              const appId = m.applicationId || m.app?.id || 'NUF-1001';
              const name = m.applicantName || m.name;
              const districtName = m.district || m.addressDetails?.district || m.addressDetails?.commDistrict || 'Odisha Circle';
              const isAssociate = m.role === 'associate' || m.isAssociate === true;

              return (
                <tr
                  key={memberId}
                  onClick={() => navigate(`/admin-dashboard/members/${memberId}`)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4 font-mono font-black text-[#0b1c3d]">{memberId}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{appId}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{name}</td>
                  <td className="py-3.5 px-4">
                    {isAssociate ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        Associate Member
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200">
                        {m.membershipType || 'Regular Member'}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60 text-[10px] font-bold">
                      <MapPin className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                      <span>{districtName}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500 max-w-[160px] truncate">{m.email}</td>
                  <td className="py-3.5 px-4 font-mono">{m.mobile}</td>
                  <td className="py-3.5 px-4 text-slate-500">{m.joiningDate}</td>
                  <td className="py-3.5 px-4">
                    <MemberStatusBadge status={m.membershipStatus} />
                  </td>
                  <td
                    className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => navigate(`/admin-dashboard/members/${memberId}`)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-[11px] transition-colors cursor-pointer"
                      title="View Member Profile"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onEdit && onEdit(m)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-bold text-[11px] transition-colors cursor-pointer"
                      title="Edit Member Details"
                    >
                      <Edit className="w-3.5 h-3.5 text-amber-700" />
                      <span>Edit</span>
                    </button>

                    {onToggleStatus && (
                      <button
                        type="button"
                        onClick={() =>
                          onToggleStatus(memberId, m.membershipStatus === 'Active' ? 'Inactive' : 'Active')
                        }
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                          m.membershipStatus === 'Active'
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                        }`}
                        title={m.membershipStatus === 'Active' ? 'Deactivate Member' : 'Activate Member'}
                      >
                        {m.membershipStatus === 'Active' ? (
                          <>
                            <UserX className="w-3.5 h-3.5" />
                            <span>Deactivate</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Activate</span>
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}

            {members.length === 0 && (
              <tr>
                <td colSpan="8" className="py-12 text-center text-slate-500 text-xs font-medium">
                  No members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MemberTable;
