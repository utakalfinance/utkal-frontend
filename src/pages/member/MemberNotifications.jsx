import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  ShieldCheck,
} from 'lucide-react';
import { MemberPageHeader } from '../../components/member/MemberPageHeader';
import { EmptyState } from '../../components/member/EmptyState';

/**
 * MemberNotifications Page (/member-dashboard/notifications)
 * Notification center for alerts, receipts, approvals, and notices.
 */
export function MemberNotifications() {
  const [activeTab, setActiveTab] = useState('ALL');

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <MemberPageHeader
        title="Notifications"
        description="Statutory circulars, payment confirmations, and account security alerts."
        badge="NOTIFICATION DESK"
      >
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark All as Read</span>
        </button>
      </MemberPageHeader>

      {/* FILTER TABS & SEARCH BAR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'All Alerts (0)' },
            { id: 'UNREAD', label: 'Unread (0)' },
            { id: 'SYSTEM', label: 'System & Security (0)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-[11px] text-slate-400 font-mono self-end sm:self-auto">
          Updated: Live
        </div>
      </div>

      {/* NOTIFICATIONS LIST CONTAINER */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs">
        {/* For now show: "No notifications available." */}
        <EmptyState
          icon={Bell}
          title="No notifications available."
          description="You are completely up to date. Important approvals, payment receipts, circulars, and annual general meeting (AGM) notices will be delivered here."
        />
      </div>

      {/* FOOTER ADVISORY */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Automated dispatch via registered email and SMS alerts</span>
        </div>
        <span className="text-[11px] font-mono hidden sm:inline">Priority: Normal</span>
      </div>
    </div>
  );
}

export default MemberNotifications;
