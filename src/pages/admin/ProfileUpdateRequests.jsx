import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  AlertCircle,
  FileEdit,
  ArrowRight,
  Eye,
  Check,
  X,
  Loader2,
  RefreshCw,
  ShieldCheck,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from 'lucide-react';
import {
  getProfileUpdateRequestsApi,
  approveProfileUpdateRequestApi,
  rejectProfileUpdateRequestApi,
} from '../../services/profileUpdateService';
import { useAdmin } from '../../context/AdminContext';

export function ProfileUpdateRequests() {
  const { adminUser } = useAdmin();
  const [requests, setRequests] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await getProfileUpdateRequestsApi({ status: filterStatus, search });
      if (res && res.data) {
        setRequests(res.data);
        if (res.counts) setCounts(res.counts);
      }
    } catch (err) {
      console.error('Error fetching profile updates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  const handleOpenReview = (req) => {
    setSelectedRequest(req);
    setAdminRemarks(req.adminRemarks || '');
  };

  const handleApprove = async (reqId) => {
    setIsProcessing(true);
    try {
      await approveProfileUpdateRequestApi(reqId, {
        adminRemarks: adminRemarks.trim() || 'Approved by administrator.',
        reviewerName: adminUser?.name || 'Administrator',
      });
      setFeedback({
        type: 'success',
        message: 'Profile update request approved! Member and User records have been updated.',
      });
      setSelectedRequest(null);
      fetchRequests();
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to approve profile update.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (reqId) => {
    setIsProcessing(true);
    try {
      await rejectProfileUpdateRequestApi(reqId, {
        adminRemarks: adminRemarks.trim() || 'Request rejected by administrator.',
        reviewerName: adminUser?.name || 'Administrator',
      });
      setFeedback({
        type: 'success',
        message: 'Profile update request rejected. Original member data remains unchanged.',
      });
      setSelectedRequest(null);
      fetchRequests();
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to reject profile update.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper to get formatted status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending Approval
          </span>
        );
    }
  };

  // Helper to extract list of changed fields
  const getChangedFieldsList = (prev = {}, req = {}) => {
    const fieldLabels = {
      name: 'Full Name',
      email: 'Email',
      mobile: 'Mobile',
      altMobile: 'Alternate Mobile',
      dob: 'Date of Birth',
      gender: 'Gender',
      occupation: 'Occupation',
      preferredCommunication: 'Communication',
      address: 'Street Address',
      address1: 'Address Line 1',
      address2: 'Address Line 2',
      district: 'District',
      state: 'State',
      pincode: 'PIN Code',
      photoUrl: 'Profile Photo',
    };

    const changes = [];
    Object.keys(fieldLabels).forEach((key) => {
      const pVal = (prev[key] || '').trim();
      const rVal = (req[key] || '').trim();
      if (rVal && rVal !== pVal) {
        changes.push({
          key,
          label: fieldLabels[key],
          oldVal: pVal || '—',
          newVal: rVal,
        });
      }
    });
    return changes;
  };

  return (
    <div className="space-y-6 text-left animate-fade-in pb-12">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Profile Update Requests
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Review and approve member profile changes before updating official records.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchRequests}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs cursor-pointer transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* FEEDBACK NOTIFICATION */}
      {feedback.message && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-2xs animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback({ type: '', message: '' })}
            className="text-xs underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* STATS TILES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Requests
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{counts.total}</span>
        </div>

        <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200 shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
            Pending Review
          </span>
          <span className="text-2xl font-black text-amber-900 mt-1 block">{counts.pending}</span>
        </div>

        <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
            Approved
          </span>
          <span className="text-2xl font-black text-emerald-900 mt-1 block">{counts.approved}</span>
        </div>

        <div className="bg-rose-50/70 rounded-2xl p-4 border border-rose-200 shadow-xs">
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
            Rejected
          </span>
          <span className="text-2xl font-black text-rose-900 mt-1 block">{counts.rejected}</span>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Member ID, Name, Email..."
              className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
            />
          </form>

          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Requests' },
              { id: 'pending', label: 'Pending' },
              { id: 'approved', label: 'Approved' },
              { id: 'rejected', label: 'Rejected' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterStatus === tab.id
                    ? 'bg-[#0B1528] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* REQUESTS LIST */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-semibold">Loading profile update requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No profile update requests found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              There are currently no member profile update requests matching your filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-3.5 px-4">Member</th>
                  <th className="py-3.5 px-4">Requested Changes</th>
                  <th className="py-3.5 px-4">Submitted Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => {
                  const changes = getChangedFieldsList(req.previousValues, req.requestedChanges);
                  const reqDate = req.createdAt
                    ? new Date(req.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'N/A';

                  return (
                    <tr key={req._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* MEMBER INFO */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-sm">
                              {req.memberName || req.requestedChanges?.name || 'Valued Member'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                            <span className="text-[#004085] font-bold">{req.memberId}</span>
                            <span>•</span>
                            <span>{req.email || req.requestedChanges?.email || 'No email'}</span>
                          </div>
                        </div>
                      </td>

                      {/* CHANGED FIELDS PILLS */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1.5 max-w-md">
                          {changes.length > 0 ? (
                            changes.map((c) => (
                              <span
                                key={c.key}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-[#004085] border border-blue-200/80"
                              >
                                <span>{c.label}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">
                              General profile sync
                            </span>
                          )}
                        </div>
                      </td>

                      {/* SUBMITTED DATE */}
                      <td className="py-4 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {reqDate}
                      </td>

                      {/* STATUS BADGE */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {getStatusBadge(req.status)}
                      </td>

                      {/* ACTIONS */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenReview(req)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Review &amp; Compare</span>
                          </button>

                          {req.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(req._id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 transition-colors cursor-pointer"
                                title="Approve Request"
                              >
                                <Check className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Approve</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleReject(req._id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black text-rose-800 bg-rose-100/80 hover:bg-rose-200 transition-colors cursor-pointer"
                                title="Reject Request"
                              >
                                <X className="w-3.5 h-3.5 text-rose-700" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REVIEW & COMPARE MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in text-left">
            {/* MODAL HEADER */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-[#0B1528] to-[#003366] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
                  <FileEdit className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                    Review Profile Update
                    {getStatusBadge(selectedRequest.status)}
                  </h2>
                  <p className="text-[11px] text-slate-300">
                    Member ID: <span className="font-mono text-blue-300 font-bold">{selectedRequest.memberId}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* MEMBER HEADER SUMMARY */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Applicant Name
                  </span>
                  <span className="font-black text-slate-900 text-sm block">
                    {selectedRequest.memberName}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Member ID
                  </span>
                  <span className="font-mono font-bold text-[#004085] text-xs block">
                    {selectedRequest.memberId}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Submission Date
                  </span>
                  <span className="text-slate-700 text-xs font-medium block">
                    {new Date(selectedRequest.createdAt).toLocaleString('en-GB')}
                  </span>
                </div>
              </div>

              {/* SIDE-BY-SIDE COMPARISON TABLE */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Comparison: Original Values vs. Requested Changes</span>
                </h4>

                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-2.5 px-4 w-1/4">Field</th>
                        <th className="py-2.5 px-4 w-3/8 text-slate-500">Current Value (MongoDB)</th>
                        <th className="py-2.5 px-4 w-3/8 text-[#004085]">Requested New Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { label: 'Full Legal Name', key: 'name' },
                        { label: 'Email Address', key: 'email' },
                        { label: 'Primary Mobile', key: 'mobile' },
                        { label: 'Alternate Mobile', key: 'altMobile' },
                        { label: 'Date of Birth', key: 'dob' },
                        { label: 'Gender', key: 'gender' },
                        { label: 'Occupation', key: 'occupation' },
                        { label: 'Communication Channel', key: 'preferredCommunication' },
                        { label: 'Street Address', key: 'address' },
                        { label: 'District', key: 'district' },
                        { label: 'State', key: 'state' },
                        { label: 'Postal PIN Code', key: 'pincode' },
                      ].map((f) => {
                        const oldVal = (selectedRequest.previousValues?.[f.key] || '').trim();
                        const newVal = (selectedRequest.requestedChanges?.[f.key] || '').trim();
                        const isChanged = newVal && newVal !== oldVal;

                        return (
                          <tr
                            key={f.key}
                            className={isChanged ? 'bg-amber-50/40 font-medium' : 'hover:bg-slate-50/50'}
                          >
                            <td className="py-2.5 px-4 font-bold text-slate-700 flex items-center gap-1.5">
                              {isChanged && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />}
                              <span>{f.label}</span>
                            </td>
                            <td className="py-2.5 px-4 text-slate-600 font-mono text-[11px] break-all">
                              {oldVal || '—'}
                            </td>
                            <td className="py-2.5 px-4 font-mono text-[11px] break-all">
                              {isChanged ? (
                                <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 font-extrabold border border-emerald-300">
                                  {newVal}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">No change</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ADMIN REMARKS / NOTES */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Administrator Remarks / Verification Notes
                </label>
                <textarea
                  rows={2}
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  placeholder="e.g. Identity and KYC documents verified with Nayapalli branch records..."
                  disabled={selectedRequest.status !== 'pending'}
                  className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl p-3 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none disabled:opacity-60"
                />
              </div>

              {selectedRequest.reviewedBy && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs">
                  <strong>Reviewed by:</strong> {selectedRequest.reviewedBy} on{' '}
                  {new Date(selectedRequest.reviewedAt).toLocaleString('en-GB')}
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>

              {selectedRequest.status === 'pending' ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleReject(selectedRequest._id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject Request</span>
                  </button>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleApprove(selectedRequest._id)}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>Approve &amp; Apply Changes</span>
                  </button>
                </div>
              ) : (
                <span className="text-xs font-bold text-slate-500">
                  This request has been finalized ({selectedRequest.status}).
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileUpdateRequests;
