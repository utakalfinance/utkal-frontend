import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  ShieldCheck,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  MapPin,
  Users,
} from 'lucide-react';

// Modals
import { AddDistrictAdminModal } from '../../components/admin/districtAdmins/AddDistrictAdminModal';
import { ReassignDistrictModal } from '../../components/admin/districtAdmins/ReassignDistrictModal';
import { DistrictSummaryCards } from '../../components/admin/districts/DistrictSummaryCards';
import { DistrictTable } from '../../components/admin/districts/DistrictTable';
import { DistrictModal } from '../../components/admin/districts/DistrictModal';
import { DistrictDetailsModal } from '../../components/admin/districts/DistrictDetailsModal';

// Services
import {
  getDistrictAdminsApi,
  createDistrictAdminApi,
  reassignDistrictApi,
} from '../../services/districtAdminService';
import {
  getDistrictsApi,
  createDistrictApi,
  updateDistrictApi,
  updateDistrictStatusApi,
  deleteDistrictApi,
} from '../../services/districtService';

/**
 * DistrictUnifiedManagement
 * Dedicated District Management Portal for Super Admin.
 * Oversees operational circles, branch offices, and assigned District Administrators.
 */
export function DistrictUnifiedManagement() {
  // Toast Notification state
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // Districts Data & Filter State
  const [districts, setDistricts] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [districtSummary, setDistrictSummary] = useState({
    totalDistricts: 0,
    activeDistricts: 0,
    inactiveDistricts: 0,
    totalDistrictAdmins: 0,
  });
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [districtSearch, setDistrictSearch] = useState('');
  const [districtStatusFilter, setDistrictStatusFilter] = useState('All');
  const [districtStateFilter, setDistrictStateFilter] = useState('All');
  const [districtActionLoadingId, setDistrictActionLoadingId] = useState(null);

  // Modals for Districts
  const [isDistrictModalOpen, setIsDistrictModalOpen] = useState(false);
  const [districtModalMode, setDistrictModalMode] = useState('create');
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [isDistrictDetailsModalOpen, setIsDistrictDetailsModalOpen] = useState(false);
  const [detailsDistrictId, setDetailsDistrictId] = useState(null);

  // Modals for Admin Assignment
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [preselectedDistrictId, setPreselectedDistrictId] = useState('');
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // General loading / error
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // =========================================================================
  // DATA FETCHING
  // =========================================================================
  const fetchDistricts = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setLoadingDistricts(true);
      setError(null);
      try {
        const [res, adminsRes] = await Promise.all([
          getDistrictsApi({
            search: districtSearch,
            status: districtStatusFilter,
            state: districtStateFilter,
          }),
          getDistrictAdminsApi({}).catch(() => null),
        ]);

        setDistricts(res.districts || []);
        if (res.summary) setDistrictSummary(res.summary);
        if (adminsRes?.admins) setAdmins(adminsRes.admins);
      } catch (err) {
        console.error('Error fetching districts:', err);
        setError(err.message || 'Failed to load operational circles');
      } finally {
        setLoadingDistricts(false);
      }
    },
    [districtSearch, districtStatusFilter, districtStateFilter]
  );

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await fetchDistricts(true);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchDistricts();
  }, [fetchDistricts]);

  // =========================================================================
  // ADMIN ACTION HANDLERS
  // =========================================================================
  const handleCreateAdmin = async (formData) => {
    const res = await createDistrictAdminApi(formData);
    showToast(`District Administrator for ${res.admin?.assignedDistrict || 'district'} registered successfully!`);
    await fetchDistricts(true);
    return res;
  };

  const handleReassignDistrict = async (id, newDistrictId) => {
    const res = await reassignDistrictApi(id, newDistrictId);
    showToast(res.message || 'District successfully reassigned!');
    await fetchDistricts(true);
  };

  const handleAssignAdminFromDistrict = (district) => {
    const distId = district?._id || district?.id || district;
    const hasAdmin = district?.assignedAdmin?.name && district?.assignedAdmin?.name !== 'Unassigned';

    if (hasAdmin && district.assignedAdmin?.userId) {
      const existingAdmin = admins.find(
        (a) => (a._id || a.id)?.toString() === district.assignedAdmin.userId?.toString()
      ) || {
        _id: district.assignedAdmin.userId,
        name: district.assignedAdmin.name,
        email: district.assignedAdmin.email,
        assignedDistrict: district.name,
        districtId: distId,
      };
      setSelectedAdmin(existingAdmin);
      setIsReassignModalOpen(true);
    } else {
      setPreselectedDistrictId(distId);
      setIsAddAdminModalOpen(true);
    }
  };

  // =========================================================================
  // DISTRICT CIRCLE ACTION HANDLERS
  // =========================================================================
  const handleCreateDistrict = async (payload) => {
    const res = await createDistrictApi(payload);
    showToast(res.message || 'District circle registered successfully!', 'success');
    await fetchDistricts(true);
  };

  const handleUpdateDistrict = async (payload) => {
    if (!selectedDistrict?._id) return;
    const res = await updateDistrictApi(selectedDistrict._id, payload);
    showToast(res.message || 'District circle updated successfully!', 'success');
    await fetchDistricts(true);
  };

  const handleToggleDistrictStatus = async (dist) => {
    const newStatus = (dist.status || 'active').toLowerCase() === 'active' ? 'inactive' : 'active';
    setDistrictActionLoadingId(dist._id);
    try {
      const res = await updateDistrictStatusApi(dist._id, newStatus);
      showToast(res.message || `District status updated to ${newStatus}`, 'success');
      await fetchDistricts(true);
    } catch (err) {
      showToast(err.message || 'Failed to update district status', 'error');
    } finally {
      setDistrictActionLoadingId(null);
    }
  };

  const handleDeleteDistrict = async (dist) => {
    if (!dist?._id) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete district "${dist.name}" (${dist.code})?\nThis action cannot be undone.`
    );
    if (!confirmDelete) return;

    setDistrictActionLoadingId(dist._id);
    try {
      const res = await deleteDistrictApi(dist._id);
      showToast(res.message || `District '${dist.name}' deleted successfully`, 'success');
      await fetchDistricts(true);
    } catch (err) {
      showToast(err.message || 'Failed to delete district', 'error');
    } finally {
      setDistrictActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 text-left pb-12 font-sans select-none">
      {/* FLOATING TOAST NOTIFICATION */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border text-xs font-bold animate-slide-up ${
            toastMessage.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastMessage.message}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TOP HEADER SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#004085] border border-blue-200/80 flex items-center justify-center font-black shrink-0 shadow-2xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                District Management
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-[#004085] border border-blue-200">
                Regional Circles
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Oversee operational circles, branch offices, and designated District Administrators.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-2xs transition-colors cursor-pointer"
            title="Refresh district records"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#004085]' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedDistrict(null);
              setDistrictModalMode('create');
              setIsDistrictModalOpen(true);
            }}
            className="px-4 py-2.5 bg-[#004085] hover:bg-[#003366] text-white rounded-xl text-xs font-black shadow-md shadow-blue-900/20 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add District &amp; Admin</span>
          </button>
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={handleRefreshAll}
            className="text-xs underline hover:text-rose-900 font-bold cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <DistrictSummaryCards summary={districtSummary} />

      {/* DISTRICT CIRCLES TABLE & FILTERS */}
      <DistrictTable
        districts={districts}
        loading={loadingDistricts}
        searchQuery={districtSearch}
        onSearchChange={setDistrictSearch}
        statusFilter={districtStatusFilter}
        onStatusFilterChange={setDistrictStatusFilter}
        stateFilter={districtStateFilter}
        onStateFilterChange={setDistrictStateFilter}
        onViewDetails={(dist) => {
          setDetailsDistrictId(dist._id);
          setIsDistrictDetailsModalOpen(true);
        }}
        onEditDistrict={(dist) => {
          setSelectedDistrict(dist);
          setDistrictModalMode('edit');
          setIsDistrictModalOpen(true);
        }}
        onToggleStatus={handleToggleDistrictStatus}
        onAssignAdmin={handleAssignAdminFromDistrict}
        onDeleteDistrict={handleDeleteDistrict}
        actionLoadingId={districtActionLoadingId}
      />

      {/* =================================================================== */}
      {/* MODALS */}
      {/* =================================================================== */}
      {/* 1. ADD DISTRICT ADMIN MODAL */}
      <AddDistrictAdminModal
        isOpen={isAddAdminModalOpen}
        onClose={() => {
          setIsAddAdminModalOpen(false);
          setPreselectedDistrictId('');
        }}
        onSubmit={handleCreateAdmin}
        districts={districts}
        initialDistrictId={preselectedDistrictId}
      />

      {/* 2. REASSIGN DISTRICT ADMIN MODAL */}
      <ReassignDistrictModal
        isOpen={isReassignModalOpen}
        onClose={() => {
          setIsReassignModalOpen(false);
          setSelectedAdmin(null);
        }}
        onSubmit={handleReassignDistrict}
        admin={selectedAdmin}
        districts={districts}
      />

      {/* 3. CREATE / EDIT DISTRICT MODAL */}
      <DistrictModal
        isOpen={isDistrictModalOpen}
        onClose={() => setIsDistrictModalOpen(false)}
        onSubmit={districtModalMode === 'edit' ? handleUpdateDistrict : handleCreateDistrict}
        initialData={selectedDistrict}
        mode={districtModalMode}
      />

      {/* 4. DISTRICT DETAILS MODAL */}
      <DistrictDetailsModal
        isOpen={isDistrictDetailsModalOpen}
        onClose={() => {
          setIsDistrictDetailsModalOpen(false);
          setDetailsDistrictId(null);
        }}
        districtId={detailsDistrictId}
        onAssignAdmin={handleAssignAdminFromDistrict}
      />
    </div>
  );
}

export default DistrictUnifiedManagement;
