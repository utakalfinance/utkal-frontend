import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  RefreshCw,
  Filter,
  FileText,
  Users,
  Receipt,
  UserPlus,
  Coins,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { getDistrictPartnerReportsApi } from '../../services/districtAdminService';

export default function DistrictPartnerReports() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [period, setPeriod] = useState('monthly'); // 'daily', 'weekly', 'monthly', 'yearly', 'custom'
  const [category, setCategory] = useState('associate_performance'); // 'associate_performance', 'district_collection', 'referral_performance', 'membership_collection', 'commission_statement'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDistrictPartnerReportsApi({
        period,
        category,
        startDate: period === 'custom' ? startDate : undefined,
        endDate: period === 'custom' ? endDate : undefined,
      });

      setReportData(res);
    } catch (err) {
      console.error('Failed to load district reports:', err);
      setError(err.message || 'Unable to generate reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (period === 'custom' && (!startDate || !endDate)) {
      return;
    }
    fetchReports();
  }, [period, category, startDate, endDate]);

  const rows = reportData?.rows || [];
  const totals = reportData?.reportTotals || {};
  const categoryTitle = reportData?.categoryTitle || 'Circle Operational Report';

  // Export CSV
  const handleExportCSV = () => {
    if (!rows || rows.length === 0) return;

    const headers = Object.keys(rows[0]);
    const csvRows = [
      headers.map((h) => `"${h.toUpperCase()}"`),
      ...rows.map((row) =>
        headers
          .map((h) => {
            const val = row[h] === null || row[h] === undefined ? '' : row[h];
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${category}_${period}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print / PDF Export
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-left pb-12 print:m-0 print:p-0">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-700" />
            <span>District Partner Reports</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Generate statutory performance summaries, financial collections, referral trends, and commission statements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchReports}
            className="p-2.5 rounded-xl bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-blue-700" />
            <span>Print / PDF</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Period Selection Controls */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs print:hidden space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Report Category Selector */}
          <div className="space-y-1.5 flex-1 min-w-[240px]">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
              Report Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => setCategory('associate_performance')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  category === 'associate_performance'
                    ? 'bg-[#004085] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span className="truncate">Associates</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('district_collection')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  category === 'district_collection'
                    ? 'bg-[#004085] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span className="truncate">Collections</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('referral_performance')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  category === 'referral_performance'
                    ? 'bg-[#004085] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="truncate">Referrals</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('membership_collection')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  category === 'membership_collection'
                    ? 'bg-[#004085] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="truncate">Membership</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('commission_statement')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  category === 'commission_statement'
                    ? 'bg-[#004085] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span className="truncate">Commissions</span>
              </button>
            </div>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
            <Calendar className="w-3.5 h-3.5 text-blue-700" />
            <span>Period:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {['daily', 'weekly', 'monthly', 'yearly', 'custom'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                  period === p
                    ? 'bg-[#004085] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {p === 'daily'
                  ? 'Today'
                  : p === 'weekly'
                  ? 'This Week'
                  : p === 'monthly'
                  ? 'This Month'
                  : p === 'yearly'
                  ? 'This Year'
                  : 'Custom Range'}
              </button>
            ))}
          </div>

          {/* Custom Date Inputs */}
          {period === 'custom' && (
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
              />
              <span className="text-slate-400 text-xs font-bold">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>
          )}
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block p-4 border-b border-slate-300 text-slate-900 space-y-1">
        <h2 className="text-xl font-bold uppercase tracking-wider">Utkal Finance Ltd</h2>
        <h3 className="text-base font-semibold">{categoryTitle}</h3>
        <p className="text-xs text-slate-600">
          Generated for Period: <span className="capitalize font-bold">{period}</span> | Date: {new Date().toLocaleDateString('en-GB')}
        </p>
      </div>

      {/* Dynamic Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {category === 'associate_performance' && (
          <>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Associates</span>
              <p className="text-2xl font-black text-slate-900 tracking-tight mt-1">{totals.totalAssociates || 0}</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Active Members</span>
              <p className="text-2xl font-black text-emerald-700 tracking-tight mt-1">{totals.activeAssociates || 0}</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Shares Allocated</span>
              <p className="text-2xl font-black text-blue-700 tracking-tight mt-1">{totals.totalShares || 0}</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Capital Raised</span>
              <p className="text-2xl font-black text-purple-700 tracking-tight mt-1">{totals.totalCapital || '₹0'}</p>
            </div>
          </>
        )}

        {(category === 'district_collection' || category === 'membership_collection') && (
          <>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Receipts</span>
              <p className="text-2xl font-black text-slate-900 tracking-tight mt-1">{totals.totalTransactions || 0}</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Verified Receipts</span>
              <p className="text-2xl font-black text-emerald-700 tracking-tight mt-1">{totals.verifiedReceipts || 0}</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Pending Verification</span>
              <p className="text-2xl font-black text-amber-700 tracking-tight mt-1">{totals.pendingVerification || 0}</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Verified Collection</span>
              <p className="text-2xl font-black text-emerald-700 tracking-tight mt-1">{totals.totalCollection || '₹0'}</p>
            </div>
          </>
        )}

        {category === 'referral_performance' && (
          <>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Leads</span>
              <p className="text-2xl font-black text-slate-900 tracking-tight mt-1">{totals.totalReferrals || 0}</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Converted</span>
              <p className="text-2xl font-black text-emerald-700 tracking-tight mt-1">{totals.converted || 0}</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">In Verification</span>
              <p className="text-2xl font-black text-blue-700 tracking-tight mt-1">{totals.inProcess || 0}</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Investor Pipeline</span>
              <p className="text-2xl font-black text-purple-700 tracking-tight mt-1">{totals.totalInvestorVolume || '₹0'}</p>
            </div>
          </>
        )}

        {category === 'commission_statement' && (
          <>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Entries</span>
              <p className="text-2xl font-black text-slate-900 tracking-tight mt-1">{totals.totalCount || 0}</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Pending</span>
              <p className="text-2xl font-black text-amber-700 tracking-tight mt-1">₹{totals.pendingAmount?.toLocaleString('en-IN') || 0}</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Approved</span>
              <p className="text-2xl font-black text-blue-700 tracking-tight mt-1">₹{totals.approvedAmount?.toLocaleString('en-IN') || 0}</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Settled &amp; Paid</span>
              <p className="text-2xl font-black text-emerald-700 tracking-tight mt-1">₹{totals.paidAmount?.toLocaleString('en-IN') || 0}</p>
            </div>
          </>
        )}
      </div>

      {/* Main Report Table */}
      <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden print:border print:border-slate-300">
        <div className="p-5 border-b border-slate-100 print:hidden flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900">{categoryTitle}</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Showing {rows.length} verified records for {period} period.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 text-slate-500 font-extrabold border-b border-slate-200/80 uppercase tracking-wider text-[10px] print:bg-slate-100 print:text-slate-800">
              {category === 'associate_performance' && (
                <tr>
                  <th className="py-3.5 px-4">ASSOCIATE ID</th>
                  <th className="py-3.5 px-4">NAME</th>
                  <th className="py-3.5 px-4">MOBILE</th>
                  <th className="py-3.5 px-4">CATEGORY</th>
                  <th className="py-3.5 px-4">SHARES</th>
                  <th className="py-3.5 px-4">CONTRIBUTION</th>
                  <th className="py-3.5 px-4">JOINING DATE</th>
                  <th className="py-3.5 px-4">STATUS</th>
                </tr>
              )}

              {(category === 'district_collection' || category === 'membership_collection') && (
                <tr>
                  <th className="py-3.5 px-4">PAYMENT ID</th>
                  <th className="py-3.5 px-4">MEMBER ID</th>
                  <th className="py-3.5 px-4">MEMBER NAME</th>
                  <th className="py-3.5 px-4">AMOUNT</th>
                  <th className="py-3.5 px-4">UTR NUMBER</th>
                  <th className="py-3.5 px-4">METHOD</th>
                  <th className="py-3.5 px-4">DATE</th>
                  <th className="py-3.5 px-4">STATUS</th>
                </tr>
              )}

              {category === 'referral_performance' && (
                <tr>
                  <th className="py-3.5 px-4">REFERRAL ID</th>
                  <th className="py-3.5 px-4">CUSTOMER NAME</th>
                  <th className="py-3.5 px-4">MOBILE</th>
                  <th className="py-3.5 px-4">TYPE</th>
                  <th className="py-3.5 px-4">ATTRIBUTED ASSOCIATE</th>
                  <th className="py-3.5 px-4">INVESTMENT VOLUME</th>
                  <th className="py-3.5 px-4">DATE</th>
                  <th className="py-3.5 px-4">STATUS</th>
                </tr>
              )}

              {category === 'commission_statement' && (
                <tr>
                  <th className="py-3.5 px-4">COMMISSION ID</th>
                  <th className="py-3.5 px-4">BENEFICIARY</th>
                  <th className="py-3.5 px-4">NAME</th>
                  <th className="py-3.5 px-4">CATEGORY</th>
                  <th className="py-3.5 px-4">BASE VOLUME</th>
                  <th className="py-3.5 px-4">COMMISSION</th>
                  <th className="py-3.5 px-4">DATE</th>
                  <th className="py-3.5 px-4">STATUS</th>
                </tr>
              )}
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium print:divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-700" />
                      <span className="text-xs text-slate-500 font-semibold">Generating Circle Report...</span>
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <p className="text-sm font-bold text-slate-700">No Data Available</p>
                    <p className="text-xs text-slate-500 mt-1">No statutory records found for the selected period.</p>
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors print:hover:bg-white">
                    {category === 'associate_performance' && (
                      <>
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                          {row.associateId}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{row.name}</td>
                        <td className="py-3.5 px-4 text-slate-700 font-mono">{row.mobile}</td>
                        <td className="py-3.5 px-4 text-slate-700">{row.category}</td>
                        <td className="py-3.5 px-4 text-slate-700 font-bold">{row.shares}</td>
                        <td className="py-3.5 px-4 font-black text-emerald-700">{row.contribution}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{row.joiningDate}</td>
                        <td className="py-3.5 px-4">
                          <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {row.status}
                          </span>
                        </td>
                      </>
                    )}

                    {(category === 'district_collection' || category === 'membership_collection') && (
                      <>
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                          {row.paymentId}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-700 font-bold">{row.memberId}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{row.memberName}</td>
                        <td className="py-3.5 px-4 font-black text-emerald-700">{row.amount}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-700">{row.utrNo}</td>
                        <td className="py-3.5 px-4 text-slate-700">{row.method}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{row.date}</td>
                        <td className="py-3.5 px-4">
                          <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {row.status}
                          </span>
                        </td>
                      </>
                    )}

                    {category === 'referral_performance' && (
                      <>
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                          {row.referralId}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{row.customerName}</td>
                        <td className="py-3.5 px-4 text-slate-700 font-mono">{row.mobile}</td>
                        <td className="py-3.5 px-4 text-slate-700">{row.type}</td>
                        <td className="py-3.5 px-4 text-slate-700 font-bold">{row.associateName}</td>
                        <td className="py-3.5 px-4 font-black text-purple-700">
                          {row.investmentAmount}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{row.date}</td>
                        <td className="py-3.5 px-4">
                          <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {row.status}
                          </span>
                        </td>
                      </>
                    )}

                    {category === 'commission_statement' && (
                      <>
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                          {row.commissionId}
                        </td>
                        <td className="py-3.5 px-4 text-slate-800 font-bold">{row.beneficiaryRole}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{row.associateName}</td>
                        <td className="py-3.5 px-4 text-slate-700">{row.category}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono">{row.baseAmount}</td>
                        <td className="py-3.5 px-4 font-black text-emerald-700">{row.amount}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{row.date}</td>
                        <td className="py-3.5 px-4">
                          <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {row.status}
                          </span>
                        </td>
                      </>
                    )}
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
export { DistrictPartnerReports };
