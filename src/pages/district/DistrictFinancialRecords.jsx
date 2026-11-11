import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Download,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
} from 'lucide-react';
import { getDistrictFinancialRecordsApi } from '../../services/districtAdminService';

export default function DistrictFinancialRecords() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDistrictFinancialRecordsApi();
      setData(res);
    } catch (err) {
      console.error('Failed to load financial records:', err);
      setError(err.message || 'Unable to load district financial records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const districtName = data?.assignedDistrict || 'District';
  const districtTransactions = data?.districtTransactions || [];

  // Filter transactions for main table
  const filteredTransactions = districtTransactions.filter((txn) => {
    const matchesSearch =
      !searchTerm ||
      txn.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.associateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.utrNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ||
      txn.verificationStatus?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // CSV Export utility
  const handleExportCSV = () => {
    const filename = `district_financial_records_${districtName.toLowerCase()}.csv`;
    const rows = [
      ['Transaction ID', 'Associate Name', 'Payment Category', 'Amount', 'Date', 'UTR Number', 'Verification Status', 'Reconciliation Status'],
      ...filteredTransactions.map((t) => [
        t.transactionId,
        `"${t.associateName || ''}"`,
        `"${t.paymentCategory || ''}"`,
        t.amount || 200,
        t.paymentDate ? new Date(t.paymentDate).toLocaleDateString('en-GB') : '',
        t.utrNumber || '',
        t.verificationStatus || '',
        t.reconciliationStatus || '',
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getVerificationBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('verified') || s === 'paid' || s === 'successful') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
        </span>
      );
    }
    if (s.includes('pending')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" /> Pending Verification
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
        <XCircle className="w-3 h-3 text-rose-600" /> Rejected
      </span>
    );
  };

  const getReconciliationBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('reconciled')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          Reconciled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
        Unreconciled
      </span>
    );
  };

  return (
    <div className="space-y-6 text-left pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Financial Records</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {districtName} Circle
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Official statutory transaction history and payment receipts for {districtName} Circle.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchRecords}
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

      {/* Transaction History Section Header */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#004085] text-white shadow-xs">
          <Receipt className="w-4 h-4" />
          <span>District Transaction History ({districtTransactions.length})</span>
        </div>
      </div>

      {/* Main Transactions Table */}
      <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by Transaction ID, Associate Name, UTR Number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Verification:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-2.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="All">All Receipts</option>
                    <option value="Verified">Verified Only</option>
                    <option value="Pending Verification">Pending Verification</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/80 text-slate-500 font-extrabold border-b border-slate-200/80 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">TRANSACTION ID</th>
                    <th className="py-3.5 px-4">ASSOCIATE NAME</th>
                    <th className="py-3.5 px-4">PAYMENT CATEGORY</th>
                    <th className="py-3.5 px-4">AMOUNT</th>
                    <th className="py-3.5 px-4">PAYMENT DATE</th>
                    <th className="py-3.5 px-4">UTR NUMBER</th>
                    <th className="py-3.5 px-4">VERIFICATION</th>
                    <th className="py-3.5 px-4">RECONCILIATION</th>
                    <th className="py-3.5 px-4 text-right">PROOF / RECEIPT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <RefreshCw className="w-6 h-6 animate-spin text-blue-700" />
                          <span className="text-xs text-slate-500 font-semibold">Loading Financial Records...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Receipt className="w-8 h-8 text-slate-300" />
                          <p className="text-sm font-bold text-slate-700">No Transactions Found</p>
                          <p className="text-xs text-slate-500 max-w-sm">
                            No payment transactions recorded for {districtName} circle matching your criteria.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((txn) => (
                      <tr key={txn.id || txn.transactionId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                          {txn.transactionId}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900">
                          {txn.associateName}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                          {txn.paymentCategory}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-black text-emerald-700">
                          ₹{txn.amount}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px] font-mono">
                          {txn.paymentDate
                            ? new Date(txn.paymentDate).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '—'}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-700">
                          {txn.utrNumber}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getVerificationBadge(txn.verificationStatus)}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getReconciliationBadge(txn.reconciliationStatus)}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap text-right">
                          {txn.receiptUrl ? (
                            <a
                              href={txn.receiptUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View Proof</span>
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No Upload</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
  export { DistrictFinancialRecords };
