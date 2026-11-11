import React from 'react';
import {
  MapPin,
  Building2,
  Eye,
  Edit2,
  Power,
  Search,
  Filter,
  Users,
  Coins,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  MoreVertical,
  UserPlus,
  Trash2,
} from 'lucide-react';

export function DistrictTable({
  districts = [],
  loading = false,
  searchQuery = '',
  onSearchChange,
  statusFilter = 'All',
  onStatusFilterChange,
  stateFilter = 'All',
  onStateFilterChange,
  onViewDetails,
  onEditDistrict,
  onToggleStatus,
  onAssignAdmin,
  onDeleteDistrict,
  actionLoadingId = null,
}) {
  const statesList = Array.from(new Set(['Odisha', ...districts.map((d) => d.state).filter(Boolean)]));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden text-left space-y-0">
      {/* FILTER & SEARCH BAR */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* SEARCH INPUT */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search district name, code, address..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition-all"
            />
          </div>

          {/* STATUS FILTER */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Inactive">Inactive Only</option>
            </select>
          </div>

          {/* STATE FILTER */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
              State:
            </span>
            <select
              value={stateFilter}
              onChange={(e) => onStateFilterChange(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              <option value="All">All States</option>
              {statesList.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{districts.length}</span> {districts.length === 1 ? 'district' : 'districts'}
        </div>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-black tracking-wider uppercase text-[10px]">
              <th className="py-3 px-5">District Name</th>
              <th className="py-3 px-4">Code</th>
              <th className="py-3 px-4">State</th>
              <th className="py-3 px-4">Branch / Office Address</th>
              <th className="py-3 px-4">Assigned Admin</th>
              <th className="py-3 px-4 text-center">Members</th>
              <th className="py-3 px-4 text-center">Loans</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {loading ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <div className="inline-flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span>Loading operational districts from MongoDB...</span>
                  </div>
                </td>
              </tr>
            ) : districts.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-slate-700">No operational districts found.</p>
                  <p className="text-xs text-slate-400">
                    Click "+ Add New District" above to register an operational circle and regional branch.
                  </p>
                </td>
              </tr>
            ) : (
              districts.map((dist) => {
                const isActive = (dist.status || 'active').toLowerCase() === 'active';
                const isPendingAction = actionLoadingId === dist._id;

                return (
                  <tr key={dist._id} className="hover:bg-slate-50/60 transition-colors">
                    {/* 1. DISTRICT NAME */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                            isActive
                              ? 'bg-blue-50 border-blue-100 text-blue-700'
                              : 'bg-slate-100 border-slate-200 text-slate-400'
                          }`}
                        >
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 text-xs">{dist.name}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[160px]">{dist.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* 2. CODE */}
                    <td className="py-3.5 px-4 font-mono font-black text-blue-700">
                      <span className="bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200/50">
                        {dist.code}
                      </span>
                    </td>

                    {/* 3. STATE */}
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {dist.state || 'Odisha'}
                    </td>

                    {/* 4. ADDRESS */}
                    <td className="py-3.5 px-4 max-w-[220px]">
                      <p className="text-slate-800 text-xs truncate" title={dist.address}>
                        {dist.address}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">Ph: {dist.contactNumber}</p>
                    </td>

                    {/* 5. ASSIGNED ADMIN */}
                    <td className="py-3.5 px-4">
                      {dist.assignedAdmin?.name && dist.assignedAdmin.name !== 'Unassigned' ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="truncate max-w-[130px]" title={dist.assignedAdmin.name}>
                            {dist.assignedAdmin.name}
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onAssignAdmin?.(dist)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#004085] font-black text-[11px] border border-blue-200 transition-colors cursor-pointer shadow-2xs group"
                          title={`Assign District Admin for ${dist.name}`}
                        >
                          <UserPlus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                          <span>+ Assign Admin</span>
                        </button>
                      )}
                    </td>

                    {/* 6. TOTAL MEMBERS */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono font-black text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md">
                        {dist.totalMembers || 0}
                      </span>
                    </td>

                    {/* 7. TOTAL LOAN APPLICATIONS */}
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                      {dist.totalLoanApplications || 0}
                    </td>

                    {/* 8. STATUS */}
                    <td className="py-3.5 px-4 text-center">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-600 border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <span>Inactive</span>
                        </span>
                      )}
                    </td>

                    {/* 9. ACTIONS */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* ASSIGN / CHANGE ADMIN */}
                        {onAssignAdmin && (
                          <button
                            type="button"
                            onClick={() => onAssignAdmin(dist)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                            title={
                              dist.assignedAdmin?.name && dist.assignedAdmin.name !== 'Unassigned'
                                ? `Change or Add Admin for ${dist.name}`
                                : `Assign District Admin for ${dist.name}`
                            }
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        )}

                        {/* VIEW DETAILS */}
                        <button
                          type="button"
                          onClick={() => onViewDetails(dist)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="View District Details & Records"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* EDIT DISTRICT */}
                        <button
                          type="button"
                          onClick={() => onEditDistrict(dist)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="Edit District Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* ACTIVATE / DEACTIVATE */}
                        <button
                          type="button"
                          disabled={isPendingAction}
                          onClick={() => onToggleStatus(dist)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isActive
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                          }`}
                          title={isActive ? 'Deactivate District' : 'Activate District'}
                        >
                          {isPendingAction ? (
                            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Power className="w-4 h-4" />
                          )}
                        </button>

                        {/* DELETE DISTRICT */}
                        {onDeleteDistrict && (
                          <button
                            type="button"
                            onClick={() => onDeleteDistrict(dist)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete District"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE RESPONSIVE CARDS (Phone & Tablet < 1024px) */}
      <div className="block lg:hidden divide-y divide-slate-100 p-3 space-y-3">
        {loading ? (
          <div className="py-8 text-center text-slate-400">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Loading districts...</p>
          </div>
        ) : districts.length === 0 ? (
          <div className="py-8 text-center text-slate-400 space-y-1">
            <Building2 className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700 text-xs">No districts registered</p>
          </div>
        ) : (
          districts.map((dist) => {
            const isActive = (dist.status || 'active').toLowerCase() === 'active';
            const isPendingAction = actionLoadingId === dist._id;

            return (
              <div key={dist._id} className="bg-slate-50/70 rounded-xl p-3.5 space-y-3 border border-slate-200/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-black text-slate-900 text-xs block">{dist.name}</span>
                      <span className="font-mono text-[10px] text-blue-700 font-bold">{dist.code}</span>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black border ${
                      isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-0.5">
                  <p className="text-[11px] truncate">{dist.address}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Ph: {dist.contactNumber} • {dist.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2 rounded-lg border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Members</span>
                    <span className="font-black text-slate-900 font-mono">{dist.totalMembers || 0}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Loan Requests</span>
                    <span className="font-black text-slate-900 font-mono">{dist.totalLoanApplications || 0}</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200/80 col-span-2 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Admin</span>
                      <span className="font-bold text-slate-900 text-xs">
                        {dist.assignedAdmin?.name && dist.assignedAdmin.name !== 'Unassigned'
                          ? dist.assignedAdmin.name
                          : 'Unassigned'}
                      </span>
                    </div>
                    {onAssignAdmin && (!dist.assignedAdmin?.name || dist.assignedAdmin.name === 'Unassigned') && (
                      <button
                        type="button"
                        onClick={() => onAssignAdmin(dist)}
                        className="px-2 py-1 rounded-md bg-blue-50 text-[#004085] font-black text-[10px] border border-blue-200 cursor-pointer"
                      >
                        + Assign Admin
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60">
                  {onAssignAdmin && (
                    <button
                      type="button"
                      onClick={() => onAssignAdmin(dist)}
                      className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg inline-flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Assign</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onViewDetails(dist)}
                    className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-blue-700 bg-white border border-slate-200 rounded-lg inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Details</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditDistrict(dist)}
                    className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-indigo-700 bg-white border border-slate-200 rounded-lg inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    disabled={isPendingAction}
                    onClick={() => onToggleStatus(dist)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg inline-flex items-center gap-1 cursor-pointer ${
                      isActive
                        ? 'text-rose-600 hover:bg-rose-50 border border-rose-200/60 bg-white'
                        : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200 bg-white'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{isActive ? 'Deactivate' : 'Activate'}</span>
                  </button>
                  {onDeleteDistrict && (
                    <button
                      type="button"
                      onClick={() => onDeleteDistrict(dist)}
                      className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200/60 bg-white rounded-lg inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default DistrictTable;
