import React from 'react';
import {
  FileSpreadsheet,
  MapPin,
  Clock,
  CheckCircle2,
  Wallet,
  CreditCard,
  PiggyBank,
  AlertTriangle,
  Info,
} from 'lucide-react';

/**
 * LoanStats Component
 * Renders 8 Super Admin Loan Portfolio KPI Cards.
 * Uses real backend data. If loan APIs or applications are not yet active,
 * accurately displays 0 / ₹0 with clear empty state indicators rather than fake data.
 */
export function LoanStats({ loanData = null }) {
  // Real backend metrics (defaults to 0 when credit requests are awaiting submission)
  const totalLoanApps = loanData?.totalLoanApplications ?? 0;
  const pendingDistrictVerif = loanData?.pendingDistrictVerification ?? 0;
  const pendingFinalApproval = loanData?.pendingFinalApproval ?? 0;
  const approvedLoans = loanData?.approvedLoans ?? 0;
  const totalDisbursed = loanData?.totalDisbursedAmount ?? 0;
  const activeLoans = loanData?.activeLoans ?? 0;
  const emiCollected = loanData?.emiCollected ?? 0;
  const overdueLoans = loanData?.overdueLoans ?? 0;

  const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

  const loanMetrics = [
    {
      id: 'total-loans',
      label: 'TOTAL LOAN APPLICATIONS',
      value: totalLoanApps,
      statusText: totalLoanApps > 0 ? 'Submitted' : 'Pipeline Ready',
      icon: FileSpreadsheet,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50/80',
      borderColor: 'border-blue-100',
      badgeBg: 'bg-blue-50 text-blue-700',
      description: 'Formal credit facility applications submitted by approved members.',
    },
    {
      id: 'pending-district',
      label: 'PENDING DISTRICT VERIFICATION',
      value: pendingDistrictVerif,
      statusText: pendingDistrictVerif > 0 ? 'In Field Review' : 'Queue Clear',
      icon: MapPin,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50/80',
      borderColor: 'border-amber-100',
      badgeBg: 'bg-amber-50 text-amber-700',
      description: 'Applications pending field and address verification by district teams.',
    },
    {
      id: 'pending-approval',
      label: 'PENDING FINAL APPROVAL',
      value: pendingFinalApproval,
      statusText: pendingFinalApproval > 0 ? 'Under Committee' : 'Desk Clear',
      icon: Clock,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50/80',
      borderColor: 'border-indigo-100',
      badgeBg: 'bg-indigo-50 text-indigo-700',
      description: 'Verified requests awaiting chief administrator sanctioning.',
    },
    {
      id: 'approved-loans',
      label: 'APPROVED LOANS',
      value: approvedLoans,
      statusText: approvedLoans > 0 ? 'Sanctioned' : 'Zero Sanctioned',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50/80',
      borderColor: 'border-emerald-100',
      badgeBg: 'bg-emerald-50 text-emerald-700',
      description: 'Loans officially approved and cleared for capital disbursal.',
    },
    {
      id: 'total-disbursed',
      label: 'TOTAL DISBURSED AMOUNT',
      value: formatCurrency(totalDisbursed),
      statusText: totalDisbursed > 0 ? 'Capital Released' : 'Vault Ready',
      icon: Wallet,
      iconColor: 'text-cyan-600',
      bgColor: 'bg-cyan-50/80',
      borderColor: 'border-cyan-100',
      badgeBg: 'bg-cyan-50 text-cyan-700',
      description: 'Total statutory credit funds disbursed to borrowing members.',
    },
    {
      id: 'active-loans',
      label: 'ACTIVE LOANS',
      value: activeLoans,
      statusText: activeLoans > 0 ? 'In Repayment' : 'No Active Credit',
      icon: CreditCard,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50/80',
      borderColor: 'border-purple-100',
      badgeBg: 'bg-purple-50 text-purple-700',
      description: 'Currently ongoing credit accounts undergoing monthly recovery.',
    },
    {
      id: 'emi-collected',
      label: 'EMI COLLECTED',
      value: formatCurrency(emiCollected),
      statusText: emiCollected > 0 ? 'Recovered' : 'Zero Inflow',
      icon: PiggyBank,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50/80',
      borderColor: 'border-emerald-100',
      badgeBg: 'bg-emerald-50 text-emerald-700',
      description: 'Total monthly installments and interest repaid by active borrowers.',
    },
    {
      id: 'overdue-loans',
      label: 'OVERDUE LOANS',
      value: overdueLoans,
      statusText: overdueLoans > 0 ? 'Follow Up Required' : 'Zero NPA',
      icon: AlertTriangle,
      iconColor: overdueLoans > 0 ? 'text-rose-600' : 'text-slate-500',
      bgColor: overdueLoans > 0 ? 'bg-rose-50/80' : 'bg-slate-50/80',
      borderColor: overdueLoans > 0 ? 'border-rose-100' : 'border-slate-200/80',
      badgeBg: overdueLoans > 0 ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700',
      description: 'Accounts with past-due installments exceeding the 30-day grace window.',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-black tracking-widest uppercase text-slate-500 flex items-center gap-2">
            <span>CREDIT PORTFOLIO &amp; LOAN OPERATIONS</span>
          </h2>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
            Realtime Live Sync
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Statutory 2-tier approval workflow</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loanMetrics.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs transition-all text-left space-y-3 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 select-none"
              title={item.description}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold tracking-widest uppercase text-slate-400">
                  {item.label}
                </span>
                <div className={`p-2 rounded-xl ${item.bgColor} border ${item.borderColor}`}>
                  <Icon className={`w-4 h-4 ${item.iconColor}`} />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                  {item.value}
                </h3>
                <div className="flex items-center justify-between pt-0.5">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${item.badgeBg} inline-flex items-center gap-1`}
                  >
                    <span>{item.statusText}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Real-time</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LoanStats;
