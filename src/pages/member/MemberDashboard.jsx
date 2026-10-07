import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  PiggyBank,
  CreditCard,
  CheckCircle2,
  ArrowLeftRight,
  ShieldCheck,
  ChevronRight,
  Bell,
  Award,
  User,
  Plus,
  KeyRound,
  AlertTriangle,
  Mail,
  Phone,
} from 'lucide-react';
import { MemberStatCard } from '../../components/member/MemberStatCard';
import { EmptyState } from '../../components/member/EmptyState';
import { StatusBadge } from '../../components/member/StatusBadge';
import { useMemberAuth } from '../../hooks/useMemberAuth';

/**
 * MemberDashboard Page (/member-dashboard)
 * Main command center for the authenticated member.
 */
export function MemberDashboard() {
  const { openMakeDeposit, openChangePassword } = useOutletContext() || {};
  const { memberUser, memberDetails, application, payments = [] } = useMemberAuth();

  const memberId = memberUser?.memberId || memberDetails?.memberId || application?.memberId || '—';
  const name = memberUser?.name || memberDetails?.name || application?.applicantName || 'Valued Member';
  const email = memberDetails?.email || memberUser?.email || application?.contactDetails?.email || '—';
  const mobile = memberDetails?.mobile || memberUser?.mobile || application?.contactDetails?.mobile || '—';
  const status = memberUser?.status === 'active' || memberDetails?.status === 'active' ? 'Active' : 'Active';
  const membershipType =
    memberDetails?.membershipType ||
    application?.membershipDetails?.membershipType ||
    application?.membershipType ||
    'Associate Member';

  const mustChangePassword = memberUser?.mustChangePassword === true;

  // Calculate live financial summary from real member data
  const verifiedPaymentsSum = payments
    .filter((p) => p.status === 'Paid')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const pendingPaymentsSum = payments
    .filter((p) => p.status === 'Pending')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const totalTransactionsCount = payments.length;

  const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6">
      {/* 0. SECURITY BANNER FOR TEMPORARY PASSWORD */}
      {mustChangePassword && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-950">
                Security Notice: You are currently signed in with a temporary password.
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Please change your temporary password to secure your account credentials.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={openChangePassword}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </button>
        </div>
      )}

      {/* 1. WELCOME SECTION */}
      <div className="bg-gradient-to-r from-[#0B1528] via-[#0D2040] to-[#004085] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-200 border border-blue-400/30">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
              <span>Verified Mutual Financial Platform</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Track your statutory share capital, verified deposits, transaction history, and official certificates all in one secure financial dashboard.
            </p>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={openMakeDeposit}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Make a Deposit</span>
            </button>
            <Link
              to="/member-dashboard/profile"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800/80 hover:bg-slate-800 hover:text-white transition-colors border border-slate-700 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MEMBERSHIP CREDENTIALS CARD */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-700">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                Membership Credentials
              </h2>
              <p className="text-[11px] text-slate-500">
                Official statutory shareholding and membership record
              </p>
            </div>
          </div>

          <Link
            to="/member-dashboard/membership"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline self-start sm:self-auto"
          >
            <span>View Full Membership Details</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Real Member Info Grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/70">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Member ID
            </span>
            <span className="text-base font-mono font-black text-blue-800 mt-1 block">
              {memberId}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Unique statutory ID
            </span>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/70">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Membership Type
            </span>
            <span className="text-base font-black text-slate-900 mt-1 block truncate">
              {membershipType}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Equity Share Class (10 Shares)
            </span>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/70">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
              Membership Status
            </span>
            <div className="mt-1">
              <StatusBadge status={status} />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Verified & Approved
            </span>
          </div>

          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/70 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Registered Contact
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 truncate">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{email}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>+91 {mobile}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SUMMARY CARDS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Financial Summary
          </h2>
          <span className="text-[10px] text-slate-400 font-medium">
            Active Accounts & Deposits
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MemberStatCard
            title="Total Deposits"
            value="₹0"
            icon={PiggyBank}
            iconColor="text-blue-700 bg-blue-50 border-blue-200/60"
            subtitle="Cumulative active savings"
          />

          <MemberStatCard
            title="Pending Payments"
            value={formatCurrency(pendingPaymentsSum)}
            icon={CreditCard}
            iconColor="text-amber-700 bg-amber-50 border-amber-200/60"
            subtitle="Under administrative review"
          />

          <MemberStatCard
            title="Verified Payments"
            value={formatCurrency(verifiedPaymentsSum)}
            icon={CheckCircle2}
            iconColor="text-emerald-700 bg-emerald-50 border-emerald-200/60"
            subtitle="Officially credited"
          />

          <MemberStatCard
            title="Transactions"
            value={String(totalTransactionsCount)}
            icon={ArrowLeftRight}
            iconColor="text-indigo-700 bg-indigo-50 border-indigo-200/60"
            subtitle="Total ledger movements"
          />
        </div>
      </div>

      {/* 4 & 5. RECENT TRANSACTIONS & RECENT NOTIFICATIONS SPLIT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 4. Recent Transactions section (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Recent Transactions</span>
            </h2>
            <Link
              to="/member-dashboard/transactions"
              className="text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
            {payments.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {payments.slice(0, 5).map((p, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{p.purpose || 'Statutory Share Capital'}</span>
                        <span className="text-[10px] font-mono text-slate-400 block">{p.paymentId || p.transactionId} • {p.date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black font-mono text-emerald-700 block">+{formatCurrency(p.amount)}</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{p.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={ArrowLeftRight}
                title="No transactions available yet."
                description="When deposits, contribution fees, or interest payouts take place, your complete transaction record will appear here."
              />
            )}
          </div>
        </div>

        {/* 5. Recent Notifications section (1 col) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 tracking-tight">
              Recent Notifications
            </h2>
            <Link
              to="/member-dashboard/notifications"
              className="text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline flex items-center gap-1"
            >
              <span>Center</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span>Membership Approved</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Your application ({application?.applicationId || memberId}) has been successfully approved. Welcome to New Utkal Finance!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemberDashboard;
