import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  IndianRupee,
  User,
  MapPin,
  Phone,
  ShieldCheck,
  Receipt,
  Printer,
  ExternalLink,
  CreditCard,
  Building2,
  Tag,
  Check,
} from 'lucide-react';
import { getSuperAdminLoanByIdApi } from '../../../services/superAdminLoanService';

export function UserEmiTrackingModal({ isOpen, onClose, userData, onRecordPaymentClick }) {
  const [loanDetails, setLoanDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !userData) {
      setLoanDetails(null);
      return;
    }

    const fetchFullLoan = async () => {
      const loanIdentifier = userData.loanDbId || userData.applicationId || userData.id;
      if (!loanIdentifier) {
        setLoanDetails(userData);
        return;
      }

      setLoading(true);
      try {
        const data = await getSuperAdminLoanByIdApi(loanIdentifier);
        if (data) {
          setLoanDetails(data);
        } else {
          setLoanDetails(userData);
        }
      } catch (err) {
        console.warn('Could not fetch full loan details for tracking modal, falling back to passed user data:', err.message);
        setLoanDetails(userData);
      } finally {
        setLoading(false);
      }
    };

    fetchFullLoan();
  }, [isOpen, userData]);

  if (!isOpen || !userData) return null;

  const activeLoan = loanDetails || userData;
  const customerName = activeLoan.customerName || activeLoan.applicantName || 'Valued Member';
  const applicationId = activeLoan.applicationId || activeLoan.id || '—';
  const customerId = activeLoan.customerId || activeLoan.memberId || '—';
  const district = activeLoan.district || 'Khurda';
  const mobile = activeLoan.mobile || activeLoan.phone || '—';
  const disbursedAmount = Number(
    activeLoan.disbursedAmount ||
      activeLoan.disbursement?.disbursedAmount ||
      activeLoan.finalApproval?.approvedAmount ||
      activeLoan.sanctionedAmount ||
      10000
  );
  const disbursedAt = activeLoan.disbursedAt || activeLoan.disbursement?.disbursedAt;
  const tenureMonths =
    activeLoan.tenureMonths ||
    activeLoan.finalApproval?.approvedTenureMonths ||
    activeLoan.preferredTenureMonths ||
    3;
  const interestRate = activeLoan.interestRate || activeLoan.baseInterestRate || 1;
  const totalPayable = Number(
    activeLoan.totalPayableAmount ||
      activeLoan.repayment?.totalPayableAmount ||
      10500
  );
  const totalPaid = Number(
    activeLoan.totalPaidAmount ||
      activeLoan.repayment?.totalPaidAmount ||
      0
  );
  const outstandingBalance = Number(
    activeLoan.outstandingBalance !== undefined
      ? activeLoan.outstandingBalance
      : activeLoan.repayment?.outstandingBalance !== undefined
      ? activeLoan.repayment.outstandingBalance
      : Math.max(0, totalPayable - totalPaid)
  );

  const schedule = Array.isArray(activeLoan.schedule)
    ? activeLoan.schedule
    : Array.isArray(activeLoan.repayment?.schedule)
    ? activeLoan.repayment.schedule
    : [];

  const formatDateTime = (d) => {
    if (!d) return '—';
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return '—';
      return dt.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch {
      return '—';
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return '—';
      return dt.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const getPunctualityBadge = (dueDate, paidAt) => {
    if (!paidAt) return null;
    const due = new Date(dueDate);
    const paid = new Date(paidAt);
    due.setHours(23, 59, 59, 999);

    const diffMs = paid.getTime() - due.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      const earlyDays = Math.abs(diffDays);
      if (earlyDays === 0) {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
            <Check className="w-3 h-3 text-emerald-600" /> Collected On Due Date
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
          <Check className="w-3 h-3 text-emerald-600" /> Collected {earlyDays} Day{earlyDays > 1 ? 's' : ''} Early
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
          <Clock className="w-3 h-3 text-amber-600" /> Collected With {diffDays} Day{diffDays > 1 ? 's' : ''} Delay
        </span>
      );
    }
  };

  const getUpcomingStatusBadge = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    due.setHours(23, 59, 59, 999);

    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const overdueDays = Math.abs(diffDays);
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
          <AlertTriangle className="w-3 h-3 text-rose-600" /> Overdue by {overdueDays} Day{overdueDays > 1 ? 's' : ''}
        </span>
      );
    } else if (diffDays === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
          <Clock className="w-3 h-3 text-amber-600" /> Due Today
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300">
          <Clock className="w-3 h-3 text-blue-600" /> Due in {diffDays} Day{diffDays > 1 ? 's' : ''}
        </span>
      );
    }
  };

  const paidInstallments = schedule.filter((s) => s.paymentStatus === 'Paid');
  const overdueInstallments = schedule.filter((s) => s.paymentStatus === 'Overdue');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center shadow-inner shrink-0">
              <Clock className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  User EMI Collection Tracking Timeline
                </h3>
                <span className="font-mono text-xs px-2.5 py-0.5 bg-cyan-500/20 text-cyan-200 rounded-full border border-cyan-400/30">
                  {applicationId}
                </span>
              </div>
              <p className="text-[11px] text-blue-200 font-medium">
                Detailed collection tracking timestamps, punctuality audit &amp; installment payment logs
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer hidden sm:flex items-center gap-1.5 text-xs font-bold"
              title="Print User Tracking Record"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Member & Loan Dossier Summary Card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 leading-tight">
                    {customerName}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-mono font-bold text-indigo-700">{customerId}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {district}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {mobile}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {activeLoan.status || 'Active Loan'}
                </span>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Disbursed Principal</span>
                <span className="text-base font-black text-slate-900 block">
                  ₹{disbursedAmount.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {disbursedAt ? formatDate(disbursedAt) : `${tenureMonths} Months tenure`}
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Loan Payable</span>
                <span className="text-base font-black text-indigo-900 block">
                  ₹{totalPayable.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-indigo-600 block mt-0.5">
                  {interestRate}% / mo Reducing
                </span>
              </div>

              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 block uppercase">Total Collected</span>
                <span className="text-base font-black text-emerald-800 block">
                  ₹{totalPaid.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                  {paidInstallments.length} of {schedule.length} EMIs cleared
                </span>
              </div>

              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 block uppercase">Remaining Due</span>
                <span className="text-base font-black text-amber-900 block">
                  ₹{outstandingBalance.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-amber-700 font-bold block mt-0.5">
                  {overdueInstallments.length > 0 ? `${overdueInstallments.length} Overdue!` : 'All current'}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Installment Payment &amp; Collection Tracking Timeline
              </h4>
              <span className="text-[11px] font-bold text-slate-500">
                Sorted by installment sequence
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500 space-y-2">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold">Synchronizing real-time tracking timestamps...</p>
              </div>
            ) : schedule.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                No installment schedule records found for this user.
              </div>
            ) : (
              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {schedule.map((inst, index) => {
                  const isPaid = inst.paymentStatus === 'Paid';
                  const isOverdue = inst.paymentStatus === 'Overdue';

                  return (
                    <div key={inst.instalmentNumber || index} className="relative group">
                      {/* Timeline Node Icon */}
                      <div
                        className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 bg-white transition-transform group-hover:scale-110 shadow-xs ${
                          isPaid
                            ? 'border-emerald-500 text-emerald-600'
                            : isOverdue
                            ? 'border-rose-500 text-rose-600'
                            : 'border-amber-400 text-amber-500'
                        }`}
                      >
                        {isPaid ? (
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        ) : isOverdue ? (
                          <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        )}
                      </div>

                      {/* Content Card */}
                      <div
                        className={`p-4 sm:p-5 rounded-2xl border transition-all text-xs space-y-3 ${
                          isPaid
                            ? 'bg-emerald-50/30 border-emerald-200 hover:border-emerald-300'
                            : isOverdue
                            ? 'bg-rose-50/30 border-rose-200 hover:border-rose-300'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Header of Installment */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-900">
                              EMI Installment #{inst.instalmentNumber}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs font-bold text-slate-600">
                              Amount: ₹{Number(inst.emiAmount || 0).toLocaleString('en-IN')}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isPaid ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Payment Completed
                              </span>
                            ) : isOverdue ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                Overdue
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Upcoming
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Due & Collection Timestamps Breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          {/* Left: Scheduled Due Time */}
                          <div className="p-3 bg-white rounded-xl border border-slate-200/90 space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">
                              Scheduled Due Date
                            </span>
                            <span className="text-xs font-black text-slate-800 block">
                              {formatDate(inst.dueDate)}
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              Monthly repayment calendar schedule
                            </span>
                            <div className="pt-1">
                              {!isPaid && getUpcomingStatusBadge(inst.dueDate)}
                            </div>
                          </div>

                          {/* Right: Actual Collection Tracking Timestamp */}
                          <div
                            className={`p-3 rounded-xl border space-y-1.5 ${
                              isPaid
                                ? 'bg-emerald-50/80 border-emerald-200'
                                : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}
                          >
                            <span className="text-[10px] font-bold uppercase block tracking-wider text-slate-500">
                              Collection Tracking Time
                            </span>

                            {isPaid ? (
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
                                  <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                  <span className="font-mono">
                                    {formatDateTime(inst.paidAt || inst.paymentDate)}
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5">
                                  {getPunctualityBadge(inst.dueDate, inst.paidAt || inst.paymentDate)}
                                </div>

                                <div className="text-[11px] text-emerald-900 pt-1 space-y-0.5">
                                  <div>
                                    <span className="font-bold">Collected:</span> ₹{Number(inst.paidAmount || inst.emiAmount).toLocaleString('en-IN')} via {inst.paymentMethod || 'UPI (IndusInd QR)'}
                                  </div>
                                  <div className="font-mono text-[10px] text-slate-600">
                                    <span className="font-bold">Txn / UTR:</span> {inst.utrNumber || inst.transactionId || 'INDUS-STATUTORY-REF'}
                                  </div>
                                  {inst.receiptUrl && (
                                    <div className="text-[10px] text-slate-600 italic">
                                      Remarks: {inst.receiptUrl}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2 py-1">
                                <span className="text-xs text-slate-400 italic block">
                                  Not yet collected — awaiting payment receipt
                                </span>
                                {onRecordPaymentClick && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onClose();
                                      onRecordPaymentClick(inst);
                                    }}
                                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                                  >
                                    <Receipt className="w-3 h-3" />
                                    <span>Record Collection Now</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Breakdown: Principal vs Interest */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                          <div>
                            Principal: <span className="font-bold text-slate-700">₹{Number(inst.principalComponent || 0).toLocaleString('en-IN')}</span>
                            {' • '}
                            Interest: <span className="font-bold text-slate-700">₹{Number(inst.interestComponent || 0).toLocaleString('en-IN')}</span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-400">
                            Loan ID: {activeLoan.applicationId}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          <div className="text-xs text-slate-500 font-medium">
            Timestamp tracking synchronized with Indian Standard Time (IST).
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-black text-xs transition-colors cursor-pointer shadow-xs"
          >
            Close Tracking Dossier
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserEmiTrackingModal;
