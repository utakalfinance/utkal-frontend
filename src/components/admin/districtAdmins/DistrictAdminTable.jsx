import React, { useState } from 'react';
import {
  Eye,
  Edit2,
  MapPin,
  KeyRound,
  UserCheck,
  UserX,
  MoreVertical,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';

export function DistrictAdminTable({
  admins = [],
  loading = false,
  onViewDetails,
  onEdit,
  onChangeDistrict,
  onToggleStatus,
  onResetPassword,
  actionLoadingId = null,
}) {
  const [activeMenuId, setActiveMenuId] = useState(null);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-xs">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#004085] border-t-transparent" />
        <p className="mt-3 text-xs font-bold text-slate-500">Loading district administrators...</p>
      </div>
    );
  }

  if (!admins || admins.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-xs">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-[#004085] mx-auto flex items-center justify-center mb-4 border border-blue-100">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h3 className="text-base font-black text-slate-900">No District Admins Found</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
          No district administrators match the current criteria or have been created yet. Click "+ Add District Partner" above to register an administrator for an approved circle.
        </p>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden text-left">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200/90 text-[10px] font-black text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Administrator</th>
              <th className="py-3.5 px-4">Contact Info</th>
              <th className="py-3.5 px-4">Assigned District</th>
              <th className="py-3.5 px-4 text-center">Account Status</th>
              <th className="py-3.5 px-4">Created Date</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium">
            {admins.map((admin) => {
              const id = admin._id || admin.id;
              const isActive = admin.status === 'active';
              const isActionBusy = actionLoadingId === id;

              return (
                <tr
                  key={id}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* Name & Username */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#004085] border border-blue-200/80 font-black flex items-center justify-center shrink-0 text-xs shadow-2xs">
                        {admin.name?.charAt(0)?.toUpperCase() || 'D'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span className="truncate">{admin.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                          <span>@{admin.username || 'admin'}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Email & Mobile */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{admin.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{admin.mobile || 'N/A'}</span>
                      </div>
                    </div>
                  </td>

                  {/* Assigned District */}
                  <td className="py-3.5 px-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{admin.assignedDistrict || 'Unassigned'}</span>
                      {admin.districtCode && (
                        <span className="font-mono text-[10px] text-blue-500 border-l border-blue-200 pl-1">
                          {admin.districtCode}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Account Status */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                        }`}
                      />
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {/* Created Date */}
                  <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(admin.createdAt)}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* View Details */}
                      <button
                        type="button"
                        onClick={() => onViewDetails(admin)}
                        title="View Details & District Stats"
                        className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => onEdit(admin)}
                        title="Edit Details"
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Change District */}
                      <button
                        type="button"
                        onClick={() => onChangeDistrict(admin)}
                        title="Reassign Circle District"
                        className="p-1.5 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <MapPin className="w-4 h-4" />
                      </button>

                      {/* Toggle Status */}
                      <button
                        type="button"
                        onClick={() => onToggleStatus(admin)}
                        disabled={isActionBusy}
                        title={isActive ? 'Deactivate Account' : 'Activate Account'}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isActive
                            ? 'text-slate-500 hover:text-amber-700 hover:bg-amber-50'
                            : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>

                      {/* Reset Password */}
                      <button
                        type="button"
                        onClick={() => onResetPassword(admin)}
                        title="Reset Account Password"
                        className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
