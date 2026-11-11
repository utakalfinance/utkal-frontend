import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  IndianRupee,
  CreditCard,
  QrCode,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  X,
  FileCheck2,
} from 'lucide-react';
import { MemberPageHeader } from '../../../components/member/MemberPageHeader';
import { useMemberAuth } from '../../../hooks/useMemberAuth';
import {
  fetchCustomerRepaymentsApi,
  recordCustomerEmiRepaymentApi,
} from '../../../services/customerLoanService';

/**
 * LoanRepayment Page (/member-dashboard/loans/repayment)
 * Manages loan repayments and EMI schedules, displaying:
 * - EMI Amount, Due Date, Paid Amount, Remaining Amount, Payment Status, Pay Now button
 * - Separate sections/tabs for Upcoming, Overdue, and Paid instalments
 * - Backend-verified payment flow via IndusInd Bank UPI QR
 */
export function LoanRepayment() {
  const navigate = useNavigate();
  const { memberUser, memberDetails, application, token } = useMemberAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    summary: { upcomingCount: 0, paidCount: 0, overdueCount: 0 },
    upcoming: [],
    paid: [],
    overdue: [],
  });

  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'overdue' | 'paid'
  const [payModalItem, setPayModalItem] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI (IndusInd QR)');
  const [transactionRef, setTransactionRef] = useState('');
  const [processingPay, setProcessingPay] = useState(false);
  const [paySuccessResult, setPaySuccessResult] = useState(null);
  const [payError, setPayError] = useState(null);

  const initialRepaymentsState = {
    summary: { upcomingCount: 0, paidCount: 0, overdueCount: 0 },
    upcoming: [],
    paid: [],
    overdue: [],
  };

  const loadRepayments = async () => {
    if (!token || !memberUser?._id) return;
    setLoading(true);
    setError(null);
    setData(initialRepaymentsState);
    setPayModalItem(null);
    setPaySuccessResult(null);
    setPayError(null);
    try {
      const res = await fetchCustomerRepaymentsApi(token);
      setData(res);
      // Auto-switch to overdue if any overdue exists
      if (res.overdue && res.overdue.length > 0) {
        setActiveTab('overdue');
      } else if (res.upcoming && res.upcoming.length > 0) {
        setActiveTab('upcoming');
      } else if (res.paid && res.paid.length > 0) {
        setActiveTab('paid');
      }
    } catch (err) {
      console.warn('Failed to fetch repayments schedule:', err.message);
      setError(err.message || 'Unable to retrieve repayment schedule.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRepayments();
  }, [token, memberUser?._id]);

  const handleOpenPayModal = (item) => {
    setPayModalItem(item);
    setTransactionRef('');
    setPaySuccessResult(null);
    setPayError(null);
  };

  const handleExecutePayment = async (e) => {
    e.preventDefault();
    if (!transactionRef.trim()) {
      setPayError('Please enter the 12-digit UPI Reference Number / Bank UTR');
      return;
    }

    setProcessingPay(true);
    setPayError(null);
    try {
      const remaining =
        Number(payModalItem.emiAmount || 0) - Number(payModalItem.paidAmount || 0);

      const payload = {
        loanAppId: payModalItem.loanAppId,
        instalmentNumber: payModalItem.instalmentNumber,
        amount: remaining > 0 ? remaining : payModalItem.emiAmount,
        paymentMethod,
        transactionReference: transactionRef.trim(),
      };

      const result = await recordCustomerEmiRepaymentApi(payload, token);
      setPaySuccessResult(result.transaction);
      // Reload repayments list
      loadRepayments();
    } catch (err) {
      console.error('Repayment processing failed:', err);
      setPayError(err.message || 'Payment verification failed on backend. Please try again.');
    } finally {
      setProcessingPay(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const activeList =
    activeTab === 'upcoming'
      ? data.upcoming
      : activeTab === 'overdue'
      ? data.overdue
      : data.paid;

  const totalUpcomingEmi = data.upcoming.reduce(
    (sum, i) => sum + (Number(i.emiAmount) - Number(i.paidAmount || 0)),
    0
  );
  const totalOverdueEmi = data.overdue.reduce(
    (sum, i) => sum + (Number(i.emiAmount) - Number(i.paidAmount || 0)),
    0
  );

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <MemberPageHeader
        title="EMI & Repayments"
        description="View statutory loan instalments, monitor upcoming or overdue dues, and execute backend-verified repayments through IndusInd Bank UPI gateway."
        badge="REPAYMENT LEDGER"
        breadcrumbs={[
          { label: 'Loan Services', path: '/member-dashboard/loans/overview' },
          { label: 'EMI & Repayments' },
        ]}
      >
        <button
          onClick={loadRepayments}
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          title="Refresh repayment ledger"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </MemberPageHeader>

      {/* OVERDUE ALERT BANNER IF APPLICABLE */}
      {data.overdue && data.overdue.length > 0 && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-2xl flex items-start justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-rose-900">
                You have {data.overdue.length} Overdue Instalment(s) Totalling ₹
                {totalOverdueEmi.toLocaleString('en-IN')}
              </h4>
              <p className="text-xs text-rose-800 leading-relaxed">
                Please clear overdue instalments immediately to keep your member credit ledger in
                good standing and qualify for higher loan tiers.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('overdue')}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors"
          >
            Review Overdue
          </button>
        </div>
      )}

      {/* TABS NAVIGATION */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-2 gap-2">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`py-3 px-4 text-xs font-black border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'upcoming'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Upcoming Instalments
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'upcoming'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {data.upcoming.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('overdue')}
          className={`py-3 px-4 text-xs font-black border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'overdue'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Overdue Instalments
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              data.overdue.length > 0
                ? 'bg-rose-100 text-rose-800'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {data.overdue.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('paid')}
          className={`py-3 px-4 text-xs font-black border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'paid'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Paid Instalments
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'paid'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {data.paid.length}
          </span>
        </button>
      </div>

      {/* INSTALMENT CARDS / TABLE */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Loading repayment schedule...</p>
        </div>
      ) : activeList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Wallet className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            No {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Instalments
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === 'upcoming'
              ? 'No scheduled EMI payments are pending at this time.'
              : activeTab === 'overdue'
              ? 'Excellent! You have zero overdue loan instalments on record.'
              : 'No settled loan repayments recorded yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-b-2xl border border-t-0 border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Instalment #</th>
                  <th className="py-3 px-4">Loan Account</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">EMI Amount</th>
                  <th className="py-3 px-4">Paid Amount</th>
                  <th className="py-3 px-4">Remaining</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeList.map((item, idx) => {
                  const emi = Number(item.emiAmount || 0);
                  const paid = Number(item.paidAmount || 0);
                  const remaining = Math.max(0, emi - paid);

                  return (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      {/* Instalment # */}
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        Instalment {item.instalmentNumber || idx + 1}
                      </td>

                      {/* Loan Account */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-blue-700 block">
                          {item.loanId}
                        </span>
                        <span className="text-[10px] text-slate-400">{item.loanType}</span>
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 text-slate-600 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(item.dueDate)}
                        </div>
                      </td>

                      {/* EMI Amount */}
                      <td className="py-3.5 px-4 font-black text-slate-900">
                        ₹{emi.toLocaleString('en-IN')}
                      </td>

                      {/* Paid Amount */}
                      <td className="py-3.5 px-4 font-semibold text-emerald-700">
                        ₹{paid.toLocaleString('en-IN')}
                      </td>

                      {/* Remaining Amount */}
                      <td className="py-3.5 px-4 font-black text-slate-800">
                        ₹{remaining.toLocaleString('en-IN')}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                            item.paymentStatus === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : item.paymentStatus === 'Overdue'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {item.paymentStatus}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        {item.paymentStatus === 'Paid' ? (
                          <button
                            onClick={() => navigate('/member-dashboard/loans/history')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Receipt
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenPayModal(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Pay Now
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INDUSIND UPI REPAYMENT MODAL */}
      {payModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Official Payment Gateway
                </span>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Settle Loan Instalment
                </h3>
              </div>
              <button
                onClick={() => setPayModalItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {paySuccessResult ? (
              <div className="text-center space-y-4 py-2">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900">Repayment Verified!</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Your repayment of ₹{Number(paySuccessResult.amount).toLocaleString('en-IN')}{' '}
                    has been recorded in the cooperative ledger.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-left border border-slate-200">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Transaction ID:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {paySuccessResult.transactionId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bank Reference:</span>
                    <span className="font-mono text-slate-800">
                      {paySuccessResult.transactionReference}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setPayModalItem(null);
                    navigate('/member-dashboard/loans/history');
                  }}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors"
                >
                  View in Payment History
                </button>
              </div>
            ) : (
              <form onSubmit={handleExecutePayment} className="space-y-4 text-xs">
                {/* Due Breakdown */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex justify-between text-slate-500">
                    <span>Loan Account:</span>
                    <span className="font-bold text-slate-800">{payModalItem.loanId}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Instalment Number:</span>
                    <span className="font-bold text-slate-800">
                      Instalment #{payModalItem.instalmentNumber}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-black text-sm pt-1 border-t border-slate-200">
                    <span>Amount Payable:</span>
                    <span className="text-blue-700">
                      ₹
                      {(
                        Number(payModalItem.emiAmount) - Number(payModalItem.paidAmount || 0)
                      ).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* IndusInd Bank QR Flow */}
                <div className="p-4 bg-linear-to-b from-blue-50/80 to-white rounded-xl border border-blue-200 text-center space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <QrCode className="w-4 h-4 text-blue-700" />
                    <span className="font-black text-blue-900 uppercase tracking-wider text-[11px]">
                      IndusInd Bank Official UPI
                    </span>
                  </div>

                  {/* QR Box */}
                  <div className="w-36 h-36 bg-white mx-auto p-2 rounded-xl border border-blue-200 shadow-sm flex flex-col items-center justify-center">
                    <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center text-white text-[10px] font-mono text-center p-2 leading-tight">
                      UPI QR CODE
                      <br />
                      NEW UTKAL
                      <br />
                      FINANCE LTD
                    </div>
                  </div>

                  <p className="text-[11px] font-mono font-bold text-blue-950">
                    UPI ID: <span className="text-blue-700 select-all">utkalfinance@indus</span>
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Scan via Google Pay, PhonePe, Paytm, or BHIM to pay instantly.
                  </p>
                </div>

                {/* UTR Input */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    Transaction Reference / UTR Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="Enter 12-digit UTR from banking app"
                    className="w-full font-mono text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Payments are cross-verified on the backend with banking records.
                  </span>
                </div>

                {payError && (
                  <p className="text-[11px] text-rose-600 font-bold bg-rose-50 p-2 rounded-lg border border-rose-200">
                    {payError}
                  </p>
                )}

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPayModalItem(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processingPay}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    {processingPay ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verify & Settle
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LoanRepayment;
