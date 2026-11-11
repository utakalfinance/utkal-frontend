import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import { DistrictSummaryCards } from '../../components/admin/districts/DistrictSummaryCards';
import { DistrictTable } from '../../components/admin/districts/DistrictTable';
import { DistrictModal } from '../../components/admin/districts/DistrictModal';
import { DistrictDetailsModal } from '../../components/admin/districts/DistrictDetailsModal';
import {
  getDistrictsApi,
  createDistrictApi,
  updateDistrictApi,
  updateDistrictStatusApi,
} from '../../services/districtService';

export function DistrictManagement() {
  const [districts, setDistricts] = useState([]);
  const [summary, setSummary] = useState({
    totalDistricts: 0,
    activeDistricts: 0,
    inactiveDistricts: 0,
    totalDistrictAdmins: 0,
  });

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [stateFilter, setStateFilter] = useState('All');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit'
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsDistrictId, setDetailsDistrictId] = useState(null);

  // Toast message
  const [toastMessage, setToastMessage] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  const fetchDistricts = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setIsRefreshing(true);
    setError(null);

    try {
      const data = await getDistrictsApi({
        search: searchQuery,
        status: statusFilter,
        state: stateFilter,
      });

      setDistricts(data.districts || []);
      setSummary(data.summary || {});
    } catch (err) {
      console.error('Error fetching districts:', err);
      setError(err.message || 'Failed to load districts from MongoDB');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [searchQuery, statusFilter, stateFilter]);

  useEffect(() => {
    fetchDistricts();
  }, [fetchDistricts]);

  // Handle Create District
  const handleCreateDistrict = async (payload) => {
    const res = await createDistrictApi(payload);
    showToast(res.message || 'District registered successfully!', 'success');
    await fetchDistricts(true);
  };

  // Handle Edit District
  const handleUpdateDistrict = async (payload) => {
    if (!selectedDistrict?._id) return;
    const res = await updateDistrictApi(selectedDistrict._id, payload);
    showToast(res.message || 'District updated successfully!', 'success');
    await fetchDistricts(true);
  };

  // Handle Status Toggle (Activate / Deactivate)
  const handleToggleStatus = async (dist) => {
    const newStatus = (dist.status || 'active').toLowerCase() === 'active' ? 'inactive' : 'active';
    setActionLoadingId(dist._id);

    try {
      const res = await updateDistrictStatusApi(dist._id, newStatus);
      showToast(res.message || `District status updated to ${newStatus}`, 'success');
      await fetchDistricts(true);
    } catch (err) {
      showToast(err.message || 'Failed to update district status', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openCreateModal = () => {
    setSelectedDistrict(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  const openEditModal = (dist) => {
    setSelectedDistrict(dist);
    setFormMode('edit');
    setIsFormModalOpen(true);
  };

  const openDetailsModal = (dist) => {
    setDetailsDistrictId(dist._id);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      {/* TOAST ALERT NOTIFICATION */}
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
            className="text-slate-400 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              District Management
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
              <Building2 className="w-3 h-3 text-blue-700" />
              <span>Regional Circles</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Manage operational districts and regional branches.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchDistricts(true)}
            disabled={isRefreshing}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-xs transition-colors cursor-pointer"
            title="Refresh district records"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {/* PRIMARY BUTTON: + ADD NEW DISTRICT */}
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-[#004085] hover:bg-[#003366] text-white rounded-xl text-xs font-black shadow-md shadow-blue-900/20 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add New District</span>
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
            onClick={() => fetchDistricts()}
            className="text-xs underline hover:text-rose-900 font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {/* SUMMARY CARDS (REAL DATABASE DATA) */}
      <DistrictSummaryCards summary={summary} />

      {/* DISTRICT TABLE & FILTERS */}
      <DistrictTable
        districts={districts}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        stateFilter={stateFilter}
        onStateFilterChange={setStateFilter}
        onViewDetails={openDetailsModal}
        onEditDistrict={openEditModal}
        onToggleStatus={handleToggleStatus}
        actionLoadingId={actionLoadingId}
      />

      {/* ADD / EDIT DISTRICT MODAL */}
      <DistrictModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={formMode === 'edit' ? handleUpdateDistrict : handleCreateDistrict}
        initialData={selectedDistrict}
        mode={formMode}
      />

      {/* DISTRICT DETAILS MODAL */}
      <DistrictDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setDetailsDistrictId(null);
        }}
        districtId={detailsDistrictId}
      />
    </div>
  );
}

export default DistrictManagement;
