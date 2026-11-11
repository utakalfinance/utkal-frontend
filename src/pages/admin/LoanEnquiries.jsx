import React, { useState, useEffect, useCallback } from 'react';
import {
  HelpCircle,
  FileQuestion,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { LoanEnquirySummaryCards } from '../../components/admin/loanEnquiries/LoanEnquirySummaryCards';
import { LoanEnquiryFilters } from '../../components/admin/loanEnquiries/LoanEnquiryFilters';
import { LoanEnquiryTable } from '../../components/admin/loanEnquiries/LoanEnquiryTable';
import { LoanEnquiryDetailsModal } from '../../components/admin/loanEnquiries/LoanEnquiryDetailsModal';
import { getLoanEnquiriesApi } from '../../services/loanEnquiryService';

const ITEMS_PER_PAGE = 10;

export function LoanEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    membershipInformed: 0,
    converted: 0,
    closed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Selected Enquiry for Details Modal
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Fetch enquiries from MongoDB API
  const fetchEnquiries = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setIsRefreshing(true);
    setError(null);

    try {
      const data = await getLoanEnquiriesApi({
        search: searchQuery,
        status: statusFilter,
        dateFilter: dateFilter,
      });

      setEnquiries(data.enquiries || []);
      setSummary(data.summary || {});
    } catch (err) {
      console.error('Error fetching loan enquiries:', err);
      setError(err.message || 'Failed to fetch loan enquiries from server');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [searchQuery, statusFilter, dateFilter]);

  // Initial fetch and on filter changes
  useEffect(() => {
    fetchEnquiries();
    setCurrentPage(1);
  }, [fetchEnquiries]);

  // Handle Enquiry Updates (from Modal)
  const handleEnquiryUpdated = (updatedEnquiry) => {
    setEnquiries((prev) =>
      prev.map((item) =>
        item.enquiryId === updatedEnquiry.enquiryId || item._id === updatedEnquiry._id
          ? updatedEnquiry
          : item
      )
    );
    setSelectedEnquiry(updatedEnquiry);

    // Show temporary feedback toast
    setToastMessage(`Enquiry ${updatedEnquiry.enquiryId} updated to "${updatedEnquiry.status}".`);
    setTimeout(() => setToastMessage(''), 4000);

    // Refresh summary counts in background
    fetchEnquiries(true);
  };

  // Open Details Modal
  const handleOpenDetails = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEnquiry(null);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setDateFilter('All');
  };

  // Summary Card Status Selection
  const handleSummaryStatusSelect = (statusId) => {
    setStatusFilter(statusId);
  };

  // Client-side pagination slice
  const totalPages = Math.ceil(enquiries.length / ITEMS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEnquiries = enquiries.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-10">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-800">
              Visitor Interest Desk
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Statutory Nidhi Protocol
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Loan Enquiries
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Review and track public loan interest submissions. Contact potential borrowers and guide them into official associate membership onboarding (₹200 contribution).
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => fetchEnquiries()}
            disabled={isRefreshing}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Floating Success Toast */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. Dashboard Summary Cards */}
      <LoanEnquirySummaryCards
        summary={summary}
        activeStatus={statusFilter}
        onSelectStatus={handleSummaryStatusSelect}
      />

      {/* 3. Search and Filters */}
      <LoanEnquiryFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
        onReset={handleResetFilters}
        onRefresh={() => fetchEnquiries()}
        isRefreshing={isRefreshing}
        totalCount={summary.total ?? enquiries.length}
        filteredCount={enquiries.length}
      />

      {/* 4. Enquiries Table */}
      <LoanEnquiryTable
        enquiries={paginatedEnquiries}
        loading={loading}
        error={error}
        onViewDetails={handleOpenDetails}
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={ITEMS_PER_PAGE}
      />

      {/* 5. View Details / Action Modal */}
      <LoanEnquiryDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        enquiry={selectedEnquiry}
        onEnquiryUpdated={handleEnquiryUpdated}
      />
    </div>
  );
}

export default LoanEnquiries;
