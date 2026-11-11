import React, { useState, useEffect, useMemo } from 'react';
import {
  UserPlus,
  Link2,
  QrCode,
  Copy,
  Check,
  Search,
  Filter,
  RefreshCw,
  Users,
  TrendingUp,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  X,
  ChevronRight,
  ShieldCheck,
  Download,
  Share2,
} from 'lucide-react';
import {
  getDistrictReferralsApi,
  createDistrictReferralApi,
  updateDistrictReferralStatusApi,
  getDistrictAssociatesApi,
} from '../../services/districtAdminService';

export default function DistrictReferralManagement() {
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    converted: 0,
    inProcess: 0,
    new: 0,
    investorCount: 0,
  });
  const [associates, setAssociates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Copy state
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedAssociateForLink, setSelectedAssociateForLink] = useState('circle');

  // Current District Partner user
  const storedUser = useMemo(() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  }, []);

  const districtName = storedUser?.assignedDistrict || 'District';
  const partnerCode = storedUser?.username || storedUser?.id?.slice(-6) || 'PARTNER';

  const chosenAssociate = useMemo(() => {
    if (selectedAssociateForLink === 'circle') return null;
    return associates.find(
      (a) => a.memberId === selectedAssociateForLink || a._id === selectedAssociateForLink
    );
  }, [selectedAssociateForLink, associates]);

  const activeCode = chosenAssociate ? chosenAssociate.memberId : partnerCode;
  const activeLabel = chosenAssociate
    ? `${chosenAssociate.name} (${chosenAssociate.memberId})`
    : `${districtName} Circle Lead`;
  const activeReferralLink = `${window.location.origin}/membership-form?ref=${encodeURIComponent(activeCode)}`;
  const activeQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    activeReferralLink
  )}`;

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    mobile: '',
    email: '',
    address: '',
    referralType: 'Member Registration',
    investmentAmount: '',
    tenureMonths: '12',
    associateMemberId: '',
    associateName: '',
    notes: '',
  });

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDistrictReferralsApi({
        search: searchTerm,
        status: statusFilter,
        type: typeFilter,
      });

      setReferrals(res.referrals || []);
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load district referrals:', err);
      setError(err.message || 'Failed to load referrals.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssociates = async () => {
    try {
      const res = await getDistrictAssociatesApi({ limit: 100 });
      setAssociates(res.associates || res.members || []);
    } catch (err) {
      console.warn('Could not load associates for dropdown:', err);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    fetchAssociates();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReferrals();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(activeReferralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleAssociateSelect = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      setFormData((prev) => ({ ...prev, associateMemberId: '', associateName: '' }));
      return;
    }
    const assoc = associates.find((a) => a.memberId === selectedId || a._id === selectedId);
    setFormData((prev) => ({
      ...prev,
      associateMemberId: assoc?.memberId || selectedId,
      associateName: assoc?.name || '',
    }));
  };

  const handleCreateReferral = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!formData.customerName.trim() || !formData.mobile.trim()) {
      setError('Customer name and contact mobile are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createDistrictReferralApi({
        customerName: formData.customerName.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        referralType: formData.referralType,
        investmentAmount: Number(formData.investmentAmount) || 0,
        tenureMonths: Number(formData.tenureMonths) || 12,
        associateMemberId: formData.associateMemberId,
        associateName: formData.associateName,
        notes: formData.notes.trim(),
      });

      setSuccessMsg('Referral successfully registered and tracked in your Circle.');
      setIsRegisterOpen(false);
      setFormData({
        customerName: '',
        mobile: '',
        email: '',
        address: '',
        referralType: 'Member Registration',
        investmentAmount: '',
        tenureMonths: '12',
        associateMemberId: '',
        associateName: '',
        notes: '',
      });
      fetchReferrals();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Create referral error:', err);
      setError(err.message || 'Failed to register referral');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenStatusModal = (ref) => {
    setSelectedReferral(ref);
    setStatusToUpdate(ref.status || 'New');
    setStatusNotes(ref.notes || '');
    setIsStatusModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedReferral) return;

    try {
      setIsSubmitting(true);
      await updateDistrictReferralStatusApi(selectedReferral._id, statusToUpdate, statusNotes);
      setSuccessMsg(`Referral ${selectedReferral.referralId} updated to ${statusToUpdate}`);
      setIsStatusModalOpen(false);
      fetchReferrals();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Update status error:', err);
      setError(err.message || 'Failed to update referral status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Converted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Converted
          </span>
        );
      case 'In Process':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" /> In Process
          </span>
        );
      case 'New':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <TrendingUp className="w-3 h-3 text-amber-600" /> New
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" /> Rejected
          </span>
        );
      case 'On Hold':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock className="w-3 h-3 text-slate-500" /> On Hold
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {status || 'New'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-left pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Referral Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {districtName} Circle
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Track statutory associate referrals, share links, generate QR codes, and monitor investor submissions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsQrOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs transition-colors"
          >
            <QrCode className="w-4 h-4 text-blue-700" />
            <span>Circle QR Code</span>
          </button>
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#004085] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all hover:scale-[1.02]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Referral</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Referral Link & Code Banner */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-blue-700" />
              <span className="text-xs uppercase font-extrabold text-slate-800 tracking-wider">
                Circle &amp; Associate Referral Tools
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Every associate gets a unique Referral ID, link and QR code. Select any circle associate below to inspect or share their referral tools.
            </p>
          </div>

          {/* Associate Selector Dropdown */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <span className="text-xs font-bold text-slate-600 shrink-0">Referral Attribution:</span>
            <select
              value={selectedAssociateForLink}
              onChange={(e) => setSelectedAssociateForLink(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 cursor-pointer min-w-[220px]"
            >
              <option value="circle">★ Official Circle Lead (District Partner Direct)</option>
              {associates.map((a) => (
                <option key={a._id} value={a.memberId}>
                  Associate: {a.name} ({a.memberId})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Link and Code Display Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
              {activeLabel}
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800">
              <span className="text-[10px] text-slate-400 font-sans uppercase font-bold">Referral ID:</span>
              <span className="text-blue-700">{activeCode}</span>
              <button
                onClick={handleCopyCode}
                className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                title="Copy Referral Code"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 max-w-[280px] sm:max-w-xs truncate flex-1">
              {activeReferralLink}
            </div>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#004085] hover:bg-blue-700 text-white text-xs font-bold transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-200" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>
            <button
              onClick={() => setIsQrOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-colors shrink-0 cursor-pointer"
              title="View QR Code"
            >
              <QrCode className="w-4 h-4 text-blue-700" />
              <span>QR Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Summary Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Referrals</span>
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight mt-1">{stats.total || 0}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Circle-wide admissions</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Converted</span>
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 tracking-tight mt-1">{stats.converted || 0}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Approved &amp; onboarded</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">In Process</span>
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-700 tracking-tight mt-1">{stats.inProcess || 0}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Verification underway</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">New Submissions</span>
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 tracking-tight mt-1">{stats.new || 0}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Pending initial review</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Investor Inflow</span>
            <div className="p-2 rounded-xl bg-purple-50 border border-purple-100 text-purple-700">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-700 tracking-tight mt-1">{stats.investorCount || 0}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Investment submissions</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer name, mobile, referral ID, associate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 transition-colors"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="All">All Statuses</option>
                <option value="New">New</option>
                <option value="In Process">In Process</option>
                <option value="Converted">Converted</option>
                <option value="Rejected">Rejected</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span>Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="All">All Types</option>
                <option value="Member Registration">Member Registration</option>
                <option value="Investor Submission">Investor Submission</option>
                <option value="General Referral">General Referral</option>
              </select>
            </div>

            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('All');
                setTypeFilter('All');
                fetchReferrals();
              }}
              className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
              title="Reset Filters"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Referrals Data Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 text-slate-500 font-extrabold border-b border-slate-200/80 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">REFERRAL ID</th>
                <th className="py-3.5 px-4">CUSTOMER NAME</th>
                <th className="py-3.5 px-4">CONTACT</th>
                <th className="py-3.5 px-4">REFERRAL TYPE</th>
                <th className="py-3.5 px-4">ATTRIBUTED ASSOCIATE</th>
                <th className="py-3.5 px-4">AMOUNT / PLAN</th>
                <th className="py-3.5 px-4">STATUS</th>
                <th className="py-3.5 px-4">SUBMISSION DATE</th>
                <th className="py-3.5 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-700" />
                      <span className="text-xs font-semibold text-slate-500">Loading Circle Referrals...</span>
                    </div>
                  </td>
                </tr>
              ) : referrals.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-slate-300" />
                      <p className="text-sm font-bold text-slate-700">No Referrals Found</p>
                      <p className="text-xs text-slate-500 max-w-sm">
                        No referrals match your current search or circle filters. Click "Register New Referral" above to track prospective members or investors.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                referrals.map((ref) => (
                  <tr key={ref._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {ref.referralId}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{ref.customerName}</div>
                      {ref.address && <div className="text-[11px] text-slate-500 truncate max-w-xs">{ref.address}</div>}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-slate-700 font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{ref.mobile}</span>
                      </div>
                      {ref.email && (
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-2.5 h-2.5 text-slate-400" />
                          <span>{ref.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-xs font-semibold text-slate-700">{ref.referralType}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-xs font-bold text-slate-800">
                        {ref.associateName || <span className="text-slate-400 italic font-normal">Direct Circle Lead</span>}
                      </div>
                      {ref.associateMemberId && (
                        <div className="text-[10px] font-mono text-blue-700 font-bold">{ref.associateMemberId}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {ref.referralType === 'Investor Submission' && ref.investmentAmount ? (
                        <div>
                          <span className="font-bold text-purple-700">₹{ref.investmentAmount.toLocaleString('en-IN')}</span>
                          <span className="text-[10px] text-slate-500 block">{ref.tenureMonths || 12} Months</span>
                        </div>
                      ) : (
                        <span className="text-slate-600 font-semibold text-xs">₹200 Statutory</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">{getStatusBadge(ref.status)}</td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px] font-mono">
                      {new Date(ref.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenStatusModal(ref)}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold border border-blue-200 transition-colors cursor-pointer"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Modal */}
      {isQrOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 relative">
            <button
              onClick={() => setIsQrOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-3">
              <div className="inline-flex p-3 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100">
                <QrCode className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-slate-900">{activeLabel}</h3>
              <p className="text-xs text-slate-500 font-medium">
                Scan with any smartphone camera to open the official Utkal Finance Registration page with Referral ID{' '}
                <strong className="font-mono text-blue-700">{activeCode}</strong> pre-filled.
              </p>

              <div className="p-4 bg-slate-50 rounded-2xl inline-block border border-slate-200 mx-auto my-2 shadow-inner">
                <img
                  src={activeQrCodeUrl}
                  alt="Referral QR Code"
                  className="w-48 h-48 object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(
                      activeReferralLink
                    )}`;
                  }}
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-extrabold text-slate-400">Jurisdiction:</span>
                  <span className="text-[10px] font-mono font-bold text-blue-700">{activeCode}</span>
                </div>
                <p className="text-xs font-bold text-slate-900">{districtName} Circle</p>
                <p className="text-[10px] text-slate-500 mt-1 font-mono truncate">{activeReferralLink}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#004085] hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                </button>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `Register as Associate Member with Utkal Finance via Referral: ${activeReferralLink}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                <button
                  onClick={() => setIsQrOpen(false)}
                  className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register New Referral Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 relative my-8 text-slate-900">
            <button
              onClick={() => setIsRegisterOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-700" />
                <h3 className="text-base font-black text-slate-900">Register New Circle Referral</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Record prospective members or investor submissions directly into your {districtName} jurisdiction.
              </p>
            </div>

            <form onSubmit={handleCreateReferral} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Customer Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Chandra Das"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="9876543210"
                      value={formData.mobile}
                      onChange={(e) =>
                        setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })
                      }
                      className="w-full pl-11 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="customer@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Referral Type</label>
                  <select
                    value={formData.referralType}
                    onChange={(e) => setFormData({ ...formData, referralType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="Member Registration">Member Registration (₹200 Statutory)</option>
                    <option value="Investor Submission">Investor Submission</option>
                    <option value="General Referral">General Referral</option>
                  </select>
                </div>
              </div>

              {/* Conditional Investor Fields */}
              {formData.referralType === 'Investor Submission' && (
                <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-purple-900 mb-1">
                      Expected Investment Amount (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 50000"
                      value={formData.investmentAmount}
                      onChange={(e) => setFormData({ ...formData, investmentAmount: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-purple-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-900 mb-1">Tenure (Months)</label>
                    <select
                      value={formData.tenureMonths}
                      onChange={(e) => setFormData({ ...formData, tenureMonths: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-purple-300 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
                    >
                      <option value="12">12 Months (1 Year)</option>
                      <option value="24">24 Months (2 Years)</option>
                      <option value="36">36 Months (3 Years)</option>
                      <option value="60">60 Months (5 Years)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Attributed Associate Member */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Attributed Associate Member (Optional)
                </label>
                <select
                  value={formData.associateMemberId}
                  onChange={handleAssociateSelect}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                >
                  <option value="">Direct District Partner Lead (No Associate)</option>
                  {associates.map((a) => (
                    <option key={a._id} value={a.memberId}>
                      {a.name} ({a.memberId})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1 font-medium">
                  Associates attributed will receive their statutory commission once converted.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Address / Village / Town</label>
                <input
                  type="text"
                  placeholder="e.g. Balipatna, Khurda"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Remarks</label>
                <textarea
                  rows="2"
                  placeholder="Specific requirements, background or verification notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#004085] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Registering...' : 'Register Referral'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Referral Status Modal */}
      {isStatusModalOpen && selectedReferral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 relative text-slate-900">
            <button
              onClick={() => setIsStatusModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-base font-black text-slate-900">Update Referral Status</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5 font-mono">
                {selectedReferral.referralId} • {selectedReferral.customerName}
              </p>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Status</label>
                <select
                  value={statusToUpdate}
                  onChange={(e) => setStatusToUpdate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                >
                  <option value="New">New</option>
                  <option value="In Process">In Process</option>
                  <option value="Converted">Converted</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Remarks / Notes</label>
                <textarea
                  rows="3"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Details regarding contact, verification or conversion..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#004085] hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Updating...' : 'Save Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export { DistrictReferralManagement };
