import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  Building2,
} from 'lucide-react';
import { DistrictAdminSummaryCards } from '../../components/admin/districtAdmins/DistrictAdminSummaryCards';
import { DistrictAdminTable } from '../../components/admin/districtAdmins/DistrictAdminTable';
import { AddDistrictAdminModal } from '../../components/admin/districtAdmins/AddDistrictAdminModal';
import { DistrictAdminDetailsModal } from '../../components/admin/districtAdmins/DistrictAdminDetailsModal';
import { EditDistrictAdminModal } from '../../components/admin/districtAdmins/EditDistrictAdminModal';
import { ReassignDistrictModal } from '../../components/admin/districtAdmins/ReassignDistrictModal';
import { ResetPasswordModal } from '../../components/admin/districtAdmins/ResetPasswordModal';
import {
  getDistrictAdminsApi,
  createDistrictAdminApi,
  updateDistrictAdminApi,
  reassignDistrictApi,
  toggleDistrictAdminStatusApi,
  resetDistrictAdminPasswordApi,
} from '../../services/districtAdminService';
import { getDistrictsApi } from '../../services/districtService';

export function DistrictAdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [summary, setSummary] = useState({
    totalDistrictAdmins: 0,
    activeDistrictAdmins: 0,
    inactiveDistrictAdmins: 0,
    assignedDistricts: 0,
  });

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);

  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // Fetch district list for assignment dropdowns
  const fetchDistrictsList = useCallback(async () => {
    try {
      const res = await getDistrictsApi({ status: 'active' });
      if (res && res.districts) {
        setDistricts(res.districts);
      }
    } catch (err) {
      console.warn('Could not load districts for dropdown:', err);
    }
  }, []);

  // Fetch district admins
  const fetchAdmins = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setLoading(true);
      setIsRefreshing(true);
      setError(null);

      try {
        const res = await getDistrictAdminsApi({
          search: searchQuery,
          status: statusFilter,
          districtId: districtFilter,
        });

        if (res && res.success) {
          setAdmins(res.admins || []);
          if (res.summary) {
            setSummary(res.summary);
          }
        }
      } catch (err) {
        console.error('Error loading district admins:', err);
        setError(err.message || 'Failed to load district administrators');
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [searchQuery, statusFilter, districtFilter]
  );

  useEffect(() => {
    fetchDistrictsList();
  }, [fetchDistrictsList]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // Action handlers
  const handleCreateAdmin = async (formData) => {
    const res = await createDistrictAdminApi(formData);
    showToast(`District admin for ${res.admin?.assignedDistrict} created successfully`);
    fetchAdmins(true);
    return res;
  };

  const handleUpdateAdmin = async (id, data) => {
    await updateDistrictAdminApi(id, data);
    showToast('Administrator details updated successfully');
    fetchAdmins(true);
  };

  const handleReassignDistrict = async (id, newDistrictId) => {
    const res = await reassignDistrictApi(id, newDistrictId);
    showToast(res.message || 'District successfully reassigned');
    fetchAdmins(true);
  };

  const handleToggleStatus = async (admin) => {
    const id = admin._id || admin.id;
    setActionLoadingId(id);
    try {
      const res = await toggleDistrictAdminStatusApi(id);
      showToast(res.message || 'Status updated');
      fetchAdmins(true);
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResetPassword = async (id, customPassword) => {
    const res = await resetDistrictAdminPasswordApi(id, customPassword);
    showToast(res.message || 'Password reset successfully');
    return res;
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top duration-300">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-xs font-semibold ${
              toastMessage.type === 'error'
                ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{toastMessage.message}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                District Admin Management
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Register and oversee nodal circle administrators, assign districts, and manage access credentials
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchAdmins(false)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
            title="Refresh district admins"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs hover:shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add District Admin</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <DistrictAdminSummaryCards summary={summary} loading={loading} />

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, mobile, district..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 w-1/2 md:w-auto">
            <span className="text-xs text-slate-500 shrink-0 font-medium hidden sm:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-36 px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* District Filter */}
          <div className="flex items-center gap-1.5 w-1/2 md:w-auto">
            <span className="text-xs text-slate-500 shrink-0 font-medium hidden sm:inline">District:</span>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full md:w-44 px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Districts</option>
              {districts.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchAdmins(false)}
            className="underline font-bold hover:text-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* District Admin Table */}
      <DistrictAdminTable
        admins={admins}
        loading={loading}
        onViewDetails={(admin) => {
          setSelectedAdmin(admin);
          setIsDetailsModalOpen(true);
        }}
        onEdit={(admin) => {
          setSelectedAdmin(admin);
          setIsEditModalOpen(true);
        }}
        onChangeDistrict={(admin) => {
          setSelectedAdmin(admin);
          setIsReassignModalOpen(true);
        }}
        onToggleStatus={handleToggleStatus}
        onResetPassword={(admin) => {
          setSelectedAdmin(admin);
          setIsResetPasswordModalOpen(true);
        }}
        actionLoadingId={actionLoadingId}
      />

      {/* Modals */}
      <AddDistrictAdminModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateAdmin}
        districts={districts}
      />

      <DistrictAdminDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedAdmin(null);
        }}
        adminId={selectedAdmin?._id || selectedAdmin?.id}
      />

      <EditDistrictAdminModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAdmin(null);
        }}
        onSubmit={handleUpdateAdmin}
        admin={selectedAdmin}
      />

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

      <ResetPasswordModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => {
          setIsResetPasswordModalOpen(false);
          setSelectedAdmin(null);
        }}
        onSubmit={handleResetPassword}
        admin={selectedAdmin}
      />
    </div>
  );
}

export default DistrictAdminManagement;
