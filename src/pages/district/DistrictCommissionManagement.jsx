import React, { useState, useEffect } from 'react';
import {
  Coins,
  Download,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Building2,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  UserCheck,
  Award,
  Wallet,
  ArrowUpRight,
} from 'lucide-react';
import { getDistrictCommissionsApi } from '../../services/districtAdminService';

export default function DistrictCommissionManagement() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'partner', 'associates', 'paid'

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDistrictCommissionsApi();
      setData(res);
    } catch (err) {
      console.error('Failed to load commissions:', err);
      setError(err.message || 'Unable to load commission data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  const summary = data?.summary || { total: 0, pending: 0, approved: 0, paid: 0 };
  const allCommissions = data?.allCommissions || [];
  const associateLedger = data?.associateLedger || [];
  const partnerLedger = data?.partnerLedger || [];
  const paymentHistory = data?.paymentHistory || [];

  // Determine current active list based on tab
  const getActiveList = () => {
    switch (activeTab) {
      case 'partner':
        return partnerLedger;
      case 'associates':
        return associateLedger;
      case 'paid':
        return paymentHistory;
      case 'all':
      default:
        return allCommissions;
    }
  };

  const currentList = getActiveList();

  // Filter list
  const filteredList = currentList.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      item.commissionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.associateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.payoutRef?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' || item.status?.toLowerCase() === statusFilter.toLowerCase();

    const matchesCategory =
      categoryFilter === 'All' || item.category?.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Export CSV
  const handleExportCSV = () => {
    const rows = [
      ['Commission ID', 'Beneficiary Role', 'Name', 'Category', 'Base Amount', 'Commission Amount', 'Status', 'Payout Ref', 'Date'],
      ...filteredList.map((c) => [
        c.commissionId,
        c.beneficiaryRole,
        `"${c.associateName || 'District Partner'}"`,
        `"${c.category || ''}"`,
        c.baseAmount || 0,
        c.commissionAmount || 0,
        c.status,
        c.payoutRef || '',
        c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-GB') : '',
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `commission_ledger_${activeTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Paid / Settled
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Award className="w-3 h-3 text-blue-600" /> Approved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" /> Pending Approval
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-left pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Commission Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Track Circle overrides, Associate member commissions, approval statuses, and direct bank settlement history.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchCommissions}
            className="p-2.5 rounded-xl bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Statutory Policy & Governance Notice */}
      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-3 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-extrabold text-blue-900 uppercase tracking-wider text-[11px]">
            Statutory &amp; Governance Policy Notice
          </p>
          <p className="leading-relaxed text-blue-800 text-xs font-medium">
            Commission rates, admission overrides, and payout schedules are strictly configured by the Super Admin in accordance with statutory guidelines and company policy. District Partners cannot arbitrarily alter commission rates or execute unauthorized manual disbursements.
          </p>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Commission</span>
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-700">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 tracking-tight mt-1">₹{summary.total?.toLocaleString('en-IN') || 0}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Circle-wide accrued</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Pending Approval</span>
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 tracking-tight mt-1">₹{summary.pending?.toLocaleString('en-IN') || 0}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Under audit review</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Approved Commission</span>
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 tracking-tight mt-1">₹{summary.approved?.toLocaleString('en-IN') || 0}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Awaiting payout batch</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Settled &amp; Paid</span>
            <div className="p-2 rounded-xl bg-purple-50 border border-purple-100 text-purple-700">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-700 tracking-tight mt-1">₹{summary.paid?.toLocaleString('en-IN') || 0}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Disbursed to bank accounts</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#004085] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200/80'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>All Circle Commissions ({allCommissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('partner')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'partner'
              ? 'bg-[#004085] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200/80'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>District Partner Ledger ({partnerLedger.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('associates')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'associates'
              ? 'bg-[#004085] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200/80'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Associate-Wise Ledger ({associateLedger.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('paid')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'paid'
              ? 'bg-[#004085] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white border border-slate-200/80'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payment History ({paymentHistory.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Commission ID, Name, Reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="All">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <span>Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="All">All Categories</option>
                <option value="Membership Admission">Membership Admission</option>
                <option value="Investor Inflow">Investor Inflow</option>
                <option value="District Performance Override">District Performance Override</option>
                <option value="Referral Reward">Referral Reward</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Commission Ledger Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 text-slate-500 font-extrabold border-b border-slate-200/80 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">COMMISSION ID</th>
                <th className="py-3.5 px-4">BENEFICIARY ROLE</th>
                <th className="py-3.5 px-4">BENEFICIARY NAME</th>
                <th className="py-3.5 px-4">COMMISSION CATEGORY</th>
                <th className="py-3.5 px-4">BASE VOLUME</th>
                <th className="py-3.5 px-4">COMMISSION EARNED</th>
                <th className="py-3.5 px-4">STATUS</th>
                <th className="py-3.5 px-4">PAYOUT REFERENCE</th>
                <th className="py-3.5 px-4">DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-700" />
                      <span className="text-xs text-slate-500 font-semibold">Loading Commission Ledger...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Coins className="w-8 h-8 text-slate-300" />
                      <p className="text-sm font-bold text-slate-700">No Commission Entries Found</p>
                      <p className="text-xs text-slate-500 max-w-sm">
                        No commission entries matching your selected tab and filters. Commission will be calculated automatically upon member onboarding and statutory approvals.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item._id || item.commissionId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {item.commissionId}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-800">
                      {item.beneficiaryRole}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900">
                      {item.associateName || 'District Partner'}
                      {item.associateId && (
                        <span className="block text-[10px] font-mono text-slate-500 font-normal">{item.associateId}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                      {item.category}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono">
                      ₹{item.baseAmount?.toLocaleString('en-IN') || 0}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-black text-emerald-700 text-sm">
                      ₹{item.commissionAmount?.toLocaleString('en-IN') || 0}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-600 text-[11px]">
                      {item.payoutRef || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px] font-mono">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
export { DistrictCommissionManagement };
