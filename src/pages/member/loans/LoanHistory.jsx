import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  Download,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Coins,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  Printer,
  X,
  CreditCard,
  Building,
  Check,
  Receipt,
  FileText,
} from 'lucide-react';
import { MemberPageHeader } from '../../../components/member/MemberPageHeader';
import { useMemberAuth } from '../../../hooks/useMemberAuth';
import { fetchCustomerLoanPaymentHistoryApi } from '../../../services/customerLoanService';

/**
 * LoanHistory Page (/member-dashboard/loans/history)
 * Visual Redesign: Modern Fintech Banking Portal
 *
 * Implements Section 6 & 8 requirements:
 * Displays verified payments belonging to the logged-in customer:
 * - Transaction ID
 * - Loan ID
 * - Installment number
 * - Amount
 * - Payment date
 * - Transaction/UTR reference
 * - Payment status
 * - Receipt view/download modal
 * - Search by Txn ID, Loan ID, UTR
 * - Filter by status
 */
export function LoanHistory() {
  const navigate = useNavigate();
  const { memberUser, memberDetails, application, token } = useMemberAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [receiptRecord, setReceiptRecord] = useState(null);

  const resolvedMemberId =
    memberUser?.memberId || memberDetails?.memberId || application?.memberId || '—';
  const memberName =
    memberUser?.name || memberDetails?.name || application?.applicantName || 'Valued Member';

  const loadHistory = async () => {
    if (!token || !memberUser?._id) return;
    setLoading(true);
    setError(null);
    setPayments([]);
    setReceiptRecord(null);
    try {
      const data = await fetchCustomerLoanPaymentHistoryApi(token);
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to fetch loan payment history from backend:', err.message);
      setError(err.message || 'Unable to retrieve loan payment transactions.');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [token, memberUser?._id]);

  // Filter payments
  const filteredPayments = payments.filter((p) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      term === '' ||
      p.transactionId?.toLowerCase().includes(term) ||
      p.loanId?.toLowerCase().includes(term) ||
      p.transactionReference?.toLowerCase().includes(term) ||
      p.paymentMethod?.toLowerCase().includes(term);

    const matchesStatus =
      selectedStatus === 'ALL' ||
      p.paymentStatus?.toUpperCase() === selectedStatus.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  const totalAmountPaid = payments
    .filter((p) => (p.paymentStatus || '').toUpperCase() === 'SUCCESS')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'SUCCESS') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (s === 'PENDING') {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (s === 'FAILED') {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <MemberPageHeader
        title="Loan Payment History"
        description="Official financial transaction ledger of all verified EMI and loan repayments credited to your account with digital receipts."
        badge="PAYMENT LEDGER"
        breadcrumbs={[
          { label: 'Loan Services', path: '/member-dashboard/loans/overview' },
          { label: 'Payment History' },
        ]}
      >
        <button
          onClick={loadHistory}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors"
          title="Refresh payment records"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh Ledger</span>
        </button>
      </MemberPageHeader>

      {/* STATISTICAL SUMMARY CHIPS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Total Verified Payments
            </span>
            <div className="text-2xl font-black text-slate-900">
              {payments.filter((p) => (p.paymentStatus || '').toUpperCase() === 'SUCCESS').length}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Cleared Transactions</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Total Amount Repaid
            </span>
            <div className="text-2xl font-black text-emerald-700">
              ₹{totalAmountPaid.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Credited to Loan Account</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
            <Coins className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Repayment Method
            </span>
            <div className="text-base font-black text-slate-900 truncate">
              IndusInd Bank UPI QR
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Direct Bank Settlement</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS TOOLBAR */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Transaction ID, Loan ID, UTR..."
            className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-full sm:w-auto cursor-pointer"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="SUCCESS">Success Only</option>
            <option value="PENDING">Pending Only</option>
            <option value="FAILED">Failed Only</option>
          </select>
        </div>
      </div>

      {/* TRANSACTIONS TABLE */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 shadow-sm">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Loading payment transactions...
          </p>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-slate-400">
            <History className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              No Payment Records Found
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {searchTerm || selectedStatus !== 'ALL'
                ? 'No payments match your search criteria. Try adjusting the filters above.'
                : 'You have not made any loan repayment or EMI transactions yet. Verified payments will be recorded here.'}
            </p>
          </div>
          <button
            onClick={() => navigate('/member-dashboard/loans/emi-schedule')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Check EMI Schedule <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-600" />
              Verified Payment Records ({filteredPayments.length})
            </h4>
            <span className="text-[10px] text-slate-400 font-bold">
              PREVENTS DUPLICATE ENTRIES
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-5">Transaction ID</th>
                  <th className="py-3.5 px-4">Loan ID</th>
                  <th className="py-3.5 px-4">Installment #</th>
                  <th className="py-3.5 px-4">Payment Date</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Transaction / UTR</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((p, idx) => (
                  <tr key={p.transactionId || idx} className="hover:bg-slate-50/70 transition-colors">
                    {/* Transaction ID */}
                    <td className="py-4 px-5 font-mono font-bold text-blue-700">
                      {p.transactionId}
                    </td>

                    {/* Loan ID */}
                    <td className="py-4 px-4 font-mono text-slate-700 font-semibold">
                      {p.loanId}
                    </td>

                    {/* Installment # */}
                    <td className="py-4 px-4 font-bold text-slate-800">
                      Installment {p.instalmentNumber || idx + 1}
                    </td>

                    {/* Payment Date */}
                    <td className="py-4 px-4 text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(p.paymentDate)}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-4 font-black text-slate-900 text-sm">
                      ₹{Number(p.amount || 0).toLocaleString('en-IN')}
                    </td>

                    {/* Payment Method */}
                    <td className="py-4 px-4 text-slate-600 font-medium">
                      {p.paymentMethod || 'UPI (IndusInd QR)'}
                    </td>

                    {/* Transaction Reference / UTR */}
                    <td className="py-4 px-4 font-mono text-slate-500 text-[11px]">
                      {p.transactionReference || '—'}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(
                          p.paymentStatus
                        )}`}
                      >
                        {p.paymentStatus || 'Success'}
                      </span>
                    </td>

                    {/* Receipt Action */}
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => setReceiptRecord(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors cursor-pointer border border-blue-200/60"
                        title="View Official Receipt"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OFFICIAL STATUTORY PAYMENT RECEIPT MODAL */}
      {receiptRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0A1628] text-white flex items-center justify-center font-black text-sm border border-slate-700">
                  UF
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight leading-none">
                    NEW UTKAL FINANCE LTD.
                  </h3>
                  <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase">
                    Official Statutory Payment Receipt
                  </span>
                </div>
              </div>
              <button
                onClick={() => setReceiptRecord(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-5 rounded-2xl bg-linear-to-br from-blue-50/50 to-indigo-50/30 border border-blue-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Amount Received
                </span>
                <span className="text-xs font-black text-emerald-700 bg-emerald-100/60 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  PAYMENT VERIFIED
                </span>
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                ₹{Number(receiptRecord.amount || 0).toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-500">
                Received with thanks towards member loan installment repayment.
              </p>
            </div>

            {/* Receipt Key-Value Rows */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono font-bold text-slate-900">{receiptRecord.transactionId}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Loan Facility ID:</span>
                <span className="font-mono font-bold text-slate-900">{receiptRecord.loanId}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Member ID:</span>
                <span className="font-mono font-bold text-blue-700">{resolvedMemberId}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Member Name:</span>
                <span className="font-bold text-slate-900">{memberName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Payment Date:</span>
                <span className="font-semibold text-slate-800">{formatDate(receiptRecord.paymentDate)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-semibold text-slate-800">{receiptRecord.paymentMethod || 'UPI (IndusInd QR)'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Bank Ref / UTR:</span>
                <span className="font-mono font-bold text-slate-700">{receiptRecord.transactionReference || '—'}</span>
              </div>
            </div>

            {/* Print & Close Actions */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={handlePrintReceipt}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Print Official Receipt
              </button>
              <button
                onClick={() => setReceiptRecord(null)}
                className="py-3 px-5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoanHistory;