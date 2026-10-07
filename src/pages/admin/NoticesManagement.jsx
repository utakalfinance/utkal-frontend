import React, { useState, useMemo, useEffect } from 'react';
import { 
  Bell, 
  RefreshCw, 
  PlusCircle, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

import { NoticeSummaryCards } from '../../components/admin/notices/NoticeSummaryCards';
import { NoticeFilters } from '../../components/admin/notices/NoticeFilters';
import { NoticeTable } from '../../components/admin/notices/NoticeTable';
import { NoticeFormModal } from '../../components/admin/notices/NoticeFormModal';
import { NoticeDetailsModal } from '../../components/admin/notices/NoticeDetailsModal';

export function NoticesManagement() {
  const { 
    notices = [], 
    members = [], 
    createNewNotice,
    updateNoticeRecord,
    publishNoticeRecord,
    archiveNoticeRecord,
    deleteNoticeRecord,
    refreshData,
    markAllNoticesAsSeen,
  } = useAdmin();

  useEffect(() => {
    if (typeof markAllNoticesAsSeen === 'function') {
      markAllNoticesAsSeen();
    }
  }, [markAllNoticesAsSeen]);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [audienceFilter, setAudienceFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [notification, setNotification] = useState('');

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification('');
    }, 4000);
  };

  const handleRefresh = () => {
    if (typeof refreshData === 'function') {
      refreshData();
    }
    showNotification('Notices list refreshed.');
  };

  // Filter Notices
  const filteredNotices = useMemo(() => {
    return notices.filter((n) => {
      // 1. Search Term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const id = (n.noticeId || n.id || '').toLowerCase();
        const title = (n.title || '').toLowerCase();
        const category = (n.category || '').toLowerCase();
        const content = (n.content || n.description || '').toLowerCase();
        const audience = (n.audience || '').toLowerCase();

        const matches = 
          id.includes(query) ||
          title.includes(query) ||
          category.includes(query) ||
          content.includes(query) ||
          audience.includes(query);

        if (!matches) return false;
      }

      // 2. Status Filter
      if (statusFilter !== 'all') {
        const status = (n.status || 'Draft').toLowerCase();
        if (status !== statusFilter.toLowerCase()) return false;
      }

      // 3. Category Filter
      if (categoryFilter !== 'all') {
        const category = (n.category || 'General').toLowerCase();
        if (category !== categoryFilter.toLowerCase()) return false;
      }

      // 4. Audience Filter
      if (audienceFilter !== 'all') {
        const audience = (n.audience || 'All Members').toLowerCase();
        if (audience !== audienceFilter.toLowerCase()) return false;
      }

      // 5. Date Filter
      if (dateFilter !== 'all') {
        const createdDateStr = n.createdAt || n.createdDate || n.date;
        if (!createdDateStr) return true;
        const nDate = new Date(createdDateStr);
        const now = new Date();

        if (dateFilter === 'today') {
          const todayStr = now.toISOString().split('T')[0];
          const nStr = nDate.toISOString().split('T')[0];
          if (todayStr !== nStr) return false;
        } else if (dateFilter === 'this_week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (nDate < weekAgo) return false;
        } else if (dateFilter === 'this_month') {
          if (nDate.getMonth() !== now.getMonth() || nDate.getFullYear() !== now.getFullYear()) {
            return false;
          }
        } else if (dateFilter === 'custom') {
          if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            if (nDate < start) return false;
          }
          if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            if (nDate > end) return false;
          }
        }
      }

      return true;
    }).sort((a, b) => {
      // Sort newest created first
      const dateA = new Date(a.createdAt || a.createdDate || a.date || 0);
      const dateB = new Date(b.createdAt || b.createdDate || b.date || 0);
      return dateB - dateA;
    });
  }, [
    notices, 
    searchTerm, 
    statusFilter, 
    categoryFilter, 
    audienceFilter, 
    dateFilter, 
    startDate, 
    endDate
  ]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setAudienceFilter('all');
    setDateFilter('all');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  // Pagination Math
  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage);
  const paginatedNotices = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredNotices.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredNotices, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Create / Edit submission
  const handleFormSubmit = (formData) => {
    if (selectedNotice && selectedNotice.id) {
      // Update
      const id = selectedNotice.noticeId || selectedNotice.id;
      if (typeof updateNoticeRecord === 'function') {
        updateNoticeRecord(id, formData);
      }
      showNotification('Notice updated successfully.');
    } else {
      // Create
      if (typeof createNewNotice === 'function') {
        const created = createNewNotice(formData);
        showNotification(`Notice ${created.noticeId || created.id} created successfully.`);
      } else {
        showNotification('Notice created successfully.');
      }
    }
  };

  // View Details
  const handleViewDetails = (notice) => {
    setSelectedNotice(notice);
    setIsDetailsModalOpen(true);
  };

  // Edit Click
  const handleEditClick = (notice) => {
    setSelectedNotice(notice);
    setIsDetailsModalOpen(false);
    setIsFormModalOpen(true);
  };

  // Publish Notice
  const handlePublishNotice = (notice) => {
    const id = notice.noticeId || notice.id;
    if (window.confirm(`Publish notice "${notice.title}" now?`)) {
      if (typeof publishNoticeRecord === 'function') {
        publishNoticeRecord(id);
      }
      if (selectedNotice) {
        setSelectedNotice((prev) => (prev ? { ...prev, status: 'Published' } : null));
      }
      showNotification('Notice published successfully.');
    }
  };

  // Archive Notice
  const handleArchiveNotice = (notice) => {
    const id = notice.noticeId || notice.id;
    if (window.confirm(`Archive notice "${notice.title}"?`)) {
      if (typeof archiveNoticeRecord === 'function') {
        archiveNoticeRecord(id);
      }
      if (selectedNotice) {
        setSelectedNotice((prev) => (prev ? { ...prev, status: 'Archived' } : null));
      }
      showNotification('Notice archived successfully.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-[#0B1528] text-white px-5 py-3 rounded-xl shadow-2xl border border-blue-500/40 flex items-center gap-3 animate-fade-in">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{notification}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#004085]">
              <Bell className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Notices Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Create and manage official announcements for members and users.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            title="Refresh notices list"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => {
              setSelectedNotice(null);
              setIsFormModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#004085] hover:bg-blue-900 shadow-sm transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-blue-200" />
            <span>+ Create Notice</span>
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <NoticeSummaryCards notices={notices} />

      {/* FILTERS TOOLBAR */}
      <NoticeFilters
        searchTerm={searchTerm}
        setSearchTerm={(val) => { setSearchTerm(val); setCurrentPage(1); }}
        statusFilter={statusFilter}
        setStatusFilter={(val) => { setStatusFilter(val); setCurrentPage(1); }}
        categoryFilter={categoryFilter}
        setCategoryFilter={(val) => { setCategoryFilter(val); setCurrentPage(1); }}
        audienceFilter={audienceFilter}
        setAudienceFilter={(val) => { setAudienceFilter(val); setCurrentPage(1); }}
        dateFilter={dateFilter}
        setDateFilter={(val) => { setDateFilter(val); setCurrentPage(1); }}
        startDate={startDate}
        setStartDate={(val) => { setStartDate(val); setCurrentPage(1); }}
        endDate={endDate}
        setEndDate={(val) => { setEndDate(val); setCurrentPage(1); }}
        onResetFilters={handleResetFilters}
      />

      {/* NOTICE LIST / TABLE */}
      <NoticeTable
        notices={paginatedNotices}
        onViewDetails={handleViewDetails}
        onEditNotice={handleEditClick}
        onPublishNotice={handlePublishNotice}
        onArchiveNotice={handleArchiveNotice}
        onCreateClick={() => {
          setSelectedNotice(null);
          setIsFormModalOpen(true);
        }}
      />

      {/* PAGINATION */}
      {filteredNotices.length > 0 && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-bold text-slate-800">
              {Math.min(currentPage * itemsPerPage, filteredNotices.length)}
            </span>{' '}
            of <span className="font-bold text-slate-800">{filteredNotices.length}</span> notice records
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors ${
                currentPage === 1
                  ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <div className="flex items-center gap-1 px-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    page === currentPage
                      ? 'bg-[#004085] text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors ${
                currentPage === totalPages
                  ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer'
              }`}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* CREATE / EDIT FORM MODAL */}
      <NoticeFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedNotice(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={selectedNotice}
        members={members}
      />

      {/* NOTICE DETAILS MODAL */}
      <NoticeDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedNotice(null);
        }}
        notice={selectedNotice}
        onEdit={handleEditClick}
        onPublish={handlePublishNotice}
        onArchive={handleArchiveNotice}
      />
    </div>
  );
}
