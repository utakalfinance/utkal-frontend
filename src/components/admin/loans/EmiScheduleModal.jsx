import React from 'react';
import {
  X,
  Calendar,
  IndianRupee,
  CreditCard,
  Building2,
  User,
  ShieldCheck,
  Receipt,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  BadgeCheck,
} from 'lucide-react';

export function EmiScheduleModal({ isOpen, onClose, loanData }) {
  if (!isOpen || !loanData) return null;

  const customerName = loanData.customerName || loanData.applicantName || 'Valued Member';
  const applicationId = loanData.applicationId || '—';
  const customerId = loanData.customerId || loanData.memberId || '—';
  const district = loanData.district || 'Khurda';
  const approvedAmount = Number(
    loanData.disbursedAmount ||
      loanData.approvedAmount ||
      loanData.sanctionedAmount ||
      10000
  );
  const tenure =
    loanData.tenure ||
    `${loanData.tenureMonths || loanData.preferredTenureMonths || 3} Months`;
  const interestRate = loanData.interestRate || 5;
  const totalPayable = Number(loanData.totalPayableAmount || 10500);
  const totalPaid = Number(loanData.totalPaidAmount || 0);
  const outstandingBalance = Number(
    loanData.outstandingBalance !== undefined
      ? loanData.outstandingBalance
      : Math.max(0, totalPayable - totalPaid)
  );

  const schedule = Array.isArray(loanData.schedule)
    ? loanData.schedule
    : Array.isArray(loanData.repayment?.schedule)
    ? loanData.repayment.schedule
    : [];

  const formatDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/20">
              <Calendar className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Loan EMI Repayment Schedule</h3>
                <span className="font-mono text-xs px-2.5 py-0.5 bg-indigo-500/30 text-indigo-200 rounded-full border border-indigo-400/30">
                  {applicationId}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Statutory Member Credit Facility Ledger — Option 1: Reducing Balance EMI Method
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Key Loan Terms Summary Card */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-xs text-slate-500 block">Customer Name</span>
                <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {customerName}
                </span>
                <span className="text-[11px] font-mono text-slate-500 block">
                  {customerId}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Disbursed Principal</span>
                <span className="text-sm font-bold text-slate-900">
                  ₹{approvedAmount.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-indigo-600 block font-medium">
                  Tenure: {tenure}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Interest Method</span>
                <span className="text-sm font-bold text-indigo-700">
                  {interestRate}% p.a. Reducing Balance
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Total Due: ₹{totalPayable.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Ledger Status</span>
                <span className="text-sm font-bold text-emerald-700 block">
                  Paid: ₹{totalPaid.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] font-semibold text-amber-700 block">
                  Balance: ₹{outstandingBalance.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Schedule Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-600" />
                Installment Breakdown Schedule
              </h4>
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                Monthly EMI: ₹
                {schedule.length > 0
                  ? Number(schedule[0].emiAmount || 3500).toLocaleString('en-IN')
                  : '3,500'}
                /month
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3">Inst #</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3">EMI Amount</th>
                    <th className="py-2.5 px-3">Principal</th>
                    <th className="py-2.5 px-3">Charge</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Paid Date</th>
                    <th className="py-2.5 px-3">Method & Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schedule.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-500 text-xs">
                        No installments generated yet for this loan.
                      </td>
                    </tr>
                  ) : (
                    schedule.map((inst, idx) => {
                      const isPaid = inst.paymentStatus === 'Paid';
                      const isPastDue =
                        !isPaid && new Date(inst.dueDate) < new Date();
                      const status = isPaid
                        ? 'Paid'
                        : isPastDue
                        ? 'Overdue'
                        : 'Upcoming';

                      return (
                        <tr
                          key={idx}
                          className={
                            isPaid
                              ? 'bg-emerald-50/40 hover:bg-emerald-50/70'
                              : isPastDue
                              ? 'bg-rose-50/40 hover:bg-rose-50/70'
                              : 'hover:bg-slate-50'
                          }
                        >
                          <td className="py-3 px-3 font-bold text-slate-800">
                            #{inst.instalmentNumber || idx + 1}
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-700">
                            {formatDate(inst.dueDate)}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900">
                            ₹{Number(inst.emiAmount || 3500).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            ₹
                            {Number(
                              inst.principalComponent ||
                                Math.floor(approvedAmount / (schedule.length || 3))
                            ).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            ₹
                            {Number(
                              inst.interestComponent ||
                                Number(inst.emiAmount || 3500) -
                                  Number(
                                    inst.principalComponent ||
                                      Math.floor(approvedAmount / (schedule.length || 3))
                                  )
                            ).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3">
                            {status === 'Paid' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Paid
                              </span>
                            ) : status === 'Overdue' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                Overdue
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Upcoming
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-700">
                            {formatDate(inst.paidAt)}
                          </td>
                          <td className="py-3 px-3">
                            {inst.transactionId || inst.utrNumber ? (
                              <div className="space-y-0.5">
                                <span className="font-mono text-[11px] text-slate-800 font-semibold block">
                                  {inst.utrNumber || inst.transactionId}
                                </span>
                                {inst.paymentMethod && (
                                  <span className="text-[10px] text-slate-500 block">
                                    {inst.paymentMethod}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Close Schedule
          </button>
        </div>
      </div>
    </div>
  );
}

