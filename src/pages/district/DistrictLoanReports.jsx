import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  BarChart3,
  Calendar,
  Download,
  Filter,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  XCircle,
  PauseCircle,
  Send,
  Wallet,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import { getDistrictLoanReportsApi } from '../../services/districtAdminService';

export function DistrictLoanReports() {
  const { adminUser } = useOutletContext();
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Date Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReports = (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setRefreshing(true);
    getDistrictLoanReportsApi({ startDate, endDate })
      .then((res) => {
        if (res && res.success) {
          setReportsData(res);
        }
      })
      .catch((err) => console.error('Failed to load reports:', err))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportCSV = () => {
    if (!reportsData?.loans || reportsData.loans.length === 0) {
      alert('No loan applications available to export for this date range.');
      return;
    }

    const headers = [
      'Application ID',
      'Applicant Name',
      'Member ID',
      'Mobile',
      'District',
      'Requested Amount',
      'Tenure Months',
      'Status',
      'Created Date',
    ];

    const rows = reportsData.loans.map((l) => [
      l.applicationId,
      `"${l.applicantName}"`,
      l.memberId,
      l.mobile,
      l.district,
      l.requestedAmount || 10000,
      l.preferredTenureMonths,
      `"${l.status}"`,
      new Date(l.createdAt).toLocaleDateString('en-GB'),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `UtkalFinance_${adminUser?.assignedDistrict || 'District'}_Loan_Report_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const summary = reportsData?.summary || {
    totalLoans: 0,
    verifiedLoans: 0,
    pendingLoans: 0,
    rejectedLoans: 0,
    onHoldLoans: 0,
    forwardedLoans: 0,
    totalRequestedAmount: 0,
    totalVerifiedAmount: 0,
  };

  const cards = [
    { title: 'Total Applications', val: summary.totalLoans, icon: FileSpreadsheet, color: 'text-blue-600', border: 'border-l-blue-600' },
    { title: 'Verified Applications', val: summary.verifiedLoans, icon: CheckCircle2, color: 'text-emerald-600', border: 'border-l-emerald-600' },
    { title: 'Pending Applications', val: summary.pendingLoans, icon: Clock, color: 'text-amber-600', border: 'border-l-amber-500' },
    { title: 'Rejected Applications', val: summary.rejectedLoans, icon: XCircle, color: 'text-red-600', border: 'border-l-red-500' },
    { title: 'Applications On Hold', val: summary.onHoldLoans, icon: PauseCircle, color: 'text-yellow-600', border: 'border-l-yellow-500' },
    { title: 'Forwarded to Super Admin', val: summary.forwardedLoans, icon: Send, color: 'text-indigo-600', border: 'border-l-indigo-600' },
  ];

  const tenureCounts = reportsData?.tenureReport?.counts || { 3: 0, 6: 0, 9: 0 };
  const tenureAmounts = reportsData?.tenureReport?.amounts || { 3: 0, 6: 0, 9: 0 };
  const monthlyList = reportsData?.monthlyReport || [];
  const statusReport = reportsData?.statusReport || {};

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                District Loan Reports ({adminUser?.assignedDistrict})
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audited financial volumes, tenure analytics, and workflow breakdowns
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchReports(false)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span>Report Date Range:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <button
            onClick={() => fetchReports(false)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
          >
            Apply Filter
          </button>
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setTimeout(() => fetchReports(false), 50);
              }}
              className="text-slate-500 hover:underline font-semibold"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 6 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 border-l-4 ${c.border} shadow-xs`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{c.title}</span>
                <Icon className={`w-4 h-4 ${c.color}`} />
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                {loading ? '...' : c.val}
              </p>
            </div>
          );
        })}
      </div>

      {/* Loan Amount Report Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/40 dark:to-slate-900 border border-blue-200 dark:border-blue-900/40 space-y-1">
          <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
            Total Requested Loan Volume
          </p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            ₹{summary.totalRequestedAmount.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500">Cumulative requested by {summary.totalLoans} applicants</p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-200 dark:border-emerald-900/40 space-y-1">
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
            Verified / Recommended Volume
          </p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            ₹{summary.totalVerifiedAmount.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500">Forwarded to Super Admin or approved</p>
        </div>
      </div>

      {/* Grid: Application Status Report & Loan Tenure Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Status Report */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Application Status Breakdown
            </h3>
            <span className="text-xs text-slate-400 font-mono">Realtime MongoDB</span>
          </div>

          <div className="space-y-2.5">
            {Object.keys(statusReport).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No status data available.</p>
            ) : (
              Object.entries(statusReport).map(([statusName, count]) => {
                const pct = summary.totalLoans > 0 ? Math.round((count / summary.totalLoans) * 100) : 0;
                return (
                  <div key={statusName} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{statusName}</span>
                      <span className="text-slate-900 dark:text-white">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Loan Tenure Report */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Selected Tenure Distribution
            </h3>
            <span className="text-xs text-slate-400 font-mono">Approved Options</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            {[3, 6, 9].map((m) => (
              <div
                key={m}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1"
              >
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  {m} Months
                </p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {tenureCounts[m] || 0}
                </p>
                <p className="text-[11px] text-slate-500">
                  ₹{(tenureAmounts[m] || 0).toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-400">
            Note: Utkal Finance standard policy provides 3, 6, or 9 month installment schedules for ₹10,000 initial member credit facilities.
          </p>
        </div>
      </div>

      {/* Monthly Application Report Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Monthly Application Activity
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Month</th>
                <th className="py-3 px-4">Total Applications</th>
                <th className="py-3 px-4">Requested Amount</th>
                <th className="py-3 px-4">Verified Applications</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {monthlyList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">
                    No monthly records available for this circle.
                  </td>
                </tr>
              ) : (
                monthlyList.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{m.month}</td>
                    <td className="py-3 px-4 font-semibold">{m.count}</td>
                    <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400">
                      ₹{m.requestedAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        {m.verifiedCount}
                      </span>
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

export default DistrictLoanReports;
