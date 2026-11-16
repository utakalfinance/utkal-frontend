import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Download,
  RefreshCw,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { getAllLedgerEntriesApi, reverseLedgerEntryApi } from '../../../services/investorService';

export function InvestorLedgerSection({ onRefreshAll }) {
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCredits, setTotalCredits] = useState(0);
  const [totalDebits, setTotalDebits] = useState(0);
  const [netBalance, setNetBalance] = useState(0);

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    type: 'All',
    startDate: '',
    endDate: '',
  });

  // Reversal Modal
  const [reversalTarget, setReversalTarget] = useState(null);
  const [reversalReason, setReversalReason] = useState('');
  const [isReversing, setIsReversing] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  const fetchLedger = useCallback(async (showSpinner = false) => {
    try {
      if (showSpinner) setIsRefreshing(true);
      else setLoading(true);
      setError(null);

      const res = await getAllLedgerEntriesApi({
        ...filters,
        page,
        limit: 15,
      });

      setEntries(res.entries || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
      setTotalCredits(res.totalCredits || 0);
      setTotalDebits(res.totalDebits || 0);
      setNetBalance(res.netBalance || 0);
    } catch (err) {
      console.error('Failed to load ledger:', err);
      setError(err.message || 'Unable to retrieve financial ledger.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleReverseSubmit = async (e) => {
    e.preventDefault();
    if (!reversalReason.trim()) {
      alert('Please enter an accounting reason for this reversal entry.');
      return;
    }
    try {
      setIsReversing(true);
      await reverseLedgerEntryApi(reversalTarget._id, {
        reason: reversalReason.trim(),
      });
      setReversalTarget(null);
      setReversalReason('');
      setToast({ type: 'success', message: 'Offsetting reversal entry posted successfully to ledger.' });
      setTimeout(() => setToast(null), 4000);
      fetchLedger(true);
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      alert(err.message || 'Failed to post reversal entry.');
    } finally {
      setIsReversing(false);
    }
  };

  const exportCSV = () => {
    if (!entries.length) {
      alert('No ledger records to export.');
      return;
    }
    const headers = [
      'Transaction ID',
      'Investor ID',
      'Date',
      'Category / Type',
      'Description',
      'Debit (₹)',
      'Credit (₹)',
      'Running Balance (₹)',
      'Reference / UTR',
      'Status',
      'Created By',
    ];
    const rows = entries.map((e) => [
      `"${e.transactionId || ''}"`,
      `"${e.investorId || ''}"`,
      `"${new Date(e.date).toLocaleDateString('en-IN')}"`,
      `"${e.category || ''}"`,
      `"${(e.description || '').replace(/"/g, '""')}"`,
      e.debit || 0,
      e.credit || 0,
      e.runningBalance || 0,
      `"${e.reference || ''}"`,
      `"${e.isReversed ? 'Reversed' : e.verificationStatus || 'Verified'}"`,
      `"${e.createdBy || 'Super Admin'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `Investor_Financial_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-semibold ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Double-Entry Accounting KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Debits (-)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2">
            ₹{Number(totalDebits).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Disbursements, Capital Repayments, Adjustments</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Credits (+)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            ₹{Number(totalCredits).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Verified Inflow (Capital Contributions)</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Closing Net Balance</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ₹{Number(netBalance).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Outstanding Verified Ledger Balance</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ledger Records</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {total}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Double-Entry Financial Transactions</p>
        </div>
      </div>

      {/* Audit & Compliance Disclaimer */}
      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-950 text-xs flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Statutory Double-Entry Accounting Standard:</span> In accordance with financial regulations, investor capital receipts are recorded as investor equity/liabilities rather than operating income. Confirmed ledger transactions cannot be deleted or overwritten; corrections must be performed via authenticated <strong>Reversal Entries</strong> with complete audit logs.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Transaction ID, Investor ID, UTR or Description..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 self-end lg:self-auto flex-wrap">
            <button
              onClick={() => fetchLedger(true)}
              disabled={loading || isRefreshing}
              className="p-2.5 rounded-xl bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-xs transition-colors cursor-pointer"
              title="Refresh ledger"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={exportCSV}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Transaction Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Opening Balance">Opening Balance</option>
              <option value="Initial Investment">Initial Investment</option>
              <option value="Investment Received">Investment Received</option>
              <option value="Additional Investment">Additional Investment</option>
              <option value="Approved Investor Payout">Approved Investor Payout</option>
              <option value="Capital Repayment">Capital Repayment</option>
              <option value="Return Payment">Return Payment</option>
              <option value="Authorized Adjustment">Authorized Adjustment</option>
              <option value="Reversal">Reversal Entry</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Entry Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none"
            >
              <option value="All">All (Debit & Credit)</option>
              <option value="Credit">Credits Only (+)</option>
              <option value="Debit">Debits Only (-)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 text-slate-500 font-extrabold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">TX ID</th>
                <th className="py-3.5 px-4">INVESTOR</th>
                <th className="py-3.5 px-4">DATE</th>
                <th className="py-3.5 px-4">CATEGORY</th>
                <th className="py-3.5 px-4">DESCRIPTION</th>
                <th className="py-3.5 px-4 text-right">DEBIT (-)</th>
                <th className="py-3.5 px-4 text-right">CREDIT (+)</th>
                <th className="py-3.5 px-4 text-right">RUNNING BALANCE</th>
                <th className="py-3.5 px-4">UTR / REF</th>
                <th className="py-3.5 px-4">STATUS</th>
                <th className="py-3.5 px-4 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="11" className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-7 h-7 animate-spin text-blue-600" />
                      <span className="text-xs font-bold text-slate-600">Loading Financial Ledger Entries...</span>
                    </div>
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-16 text-center text-slate-400">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No financial ledger transactions match your criteria.
                  </td>
                </tr>
              ) : (
                entries.map((e) => (
                  <tr
                    key={e._id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      e.isReversed ? 'opacity-60 bg-slate-50/40 line-through' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {e.transactionId}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div>
                        <span className="font-bold text-slate-900 block">
                          {e.investor?.fullName || e.investorId}
                        </span>
                        <span className="font-mono text-[10px] text-blue-600 block">
                          {e.investorId}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {new Date(e.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          e.category === 'Reversal'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : e.type === 'Credit'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {e.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-800 max-w-[220px] truncate" title={e.description}>
                      {e.description}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-rose-600 whitespace-nowrap">
                      {e.debit > 0 ? `-₹${Number(e.debit).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600 whitespace-nowrap">
                      {e.credit > 0 ? `+₹${Number(e.credit).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-black text-slate-900 whitespace-nowrap">
                      ₹{Number(e.runningBalance).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {e.reference || e.utrNumber || '—'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {e.isReversed ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                          Reversed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          {e.verificationStatus || 'Verified'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-center">
                      {!e.isReversed && e.category !== 'Reversal' ? (
                        <button
                          onClick={() => setReversalTarget(e)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer flex items-center gap-1 mx-auto"
                          title="Generate Offset Reversal Entry"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reverse</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Locked</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing page <span className="font-bold text-slate-800">{page}</span> of{' '}
              <span className="font-bold text-slate-800">{totalPages}</span> ({total} entries)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reversal Entry Modal */}
      {reversalTarget && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-600" />
                Post Double-Entry Reversal
              </h4>
              <button onClick={() => setReversalTarget(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <strong>Audit Standard Compliance:</strong> Confirmed entries are permanent. This action will create an offsetting{' '}
              <strong>{reversalTarget.type === 'Credit' ? 'Debit' : 'Credit'}</strong> transaction of{' '}
              <strong>₹{Number(reversalTarget.type === 'Credit' ? reversalTarget.credit : reversalTarget.debit).toLocaleString('en-IN')}</strong>{' '}
              and link both records in the audit trail.
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block">Original Transaction:</span>
                <span className="font-mono font-bold text-slate-800">{reversalTarget.transactionId}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Original Amount:</span>
                <span className="font-bold text-slate-900">
                  ₹{Number(reversalTarget.type === 'Credit' ? reversalTarget.credit : reversalTarget.debit).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <form onSubmit={handleReverseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Accounting Reason for Reversal <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  placeholder="e.g. Discrepancy correction in initial receipt reference; authorized by audit committee."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReversalTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReversing}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                >
                  {isReversing ? 'Posting Reversal...' : 'Confirm Reversal Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

