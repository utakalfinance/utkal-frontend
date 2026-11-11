import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  FileCheck2,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';
import { getDistrictNotificationsApi } from '../../services/districtAdminService';

export function DistrictNotifications() {
  const navigate = useNavigate();
  const { adminUser } = useOutletContext();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');

  const fetchNotifications = () => {
    setLoading(true);
    getDistrictNotificationsApi()
      .then((res) => {
        if (res && res.notifications) {
          setNotifications(res.notifications);
        }
      })
      .catch((err) => console.error('Failed to load notifications:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filtered = notifications.filter((n) => {
    if (filterType === 'All') return true;
    return n.type === filterType;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'new_application':
        return <FileCheck2 className="w-5 h-5 text-blue-500" />;
      case 'verification_required':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'super_admin_remark':
        return <Send className="w-5 h-5 text-purple-500" />;
      case 'status_update':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Circle Notifications & Alerts
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Action items and status dispatches for {adminUser?.assignedDistrict} Circle
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchNotifications}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Alerts</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {[
          { label: 'All Alerts', val: 'All' },
          { label: 'New Applications', val: 'new_application' },
          { label: 'Action Required', val: 'verification_required' },
          { label: 'Status Updates', val: 'status_update' },
          { label: 'Forwarded / Admin', val: 'super_admin_remark' },
        ].map((tab) => (
          <button
            key={tab.val}
            onClick={() => setFilterType(tab.val)}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              filterType === tab.val
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 text-xs">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mb-2" />
            <p>Loading circle notifications...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 text-xs">
            <Bell className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No Notifications</p>
            <p className="text-slate-400 mt-0.5">
              There are no pending alerts or messages matching this category.
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex items-start justify-between gap-4 hover:border-blue-400 transition-colors"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 shrink-0">
                  {getIcon(item.type)}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h3>
                    {item.applicationId && (
                      <span className="font-mono text-[10px] text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded font-bold">
                        {item.applicationId}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.message}
                  </p>
                  <p className="text-[10px] text-slate-400 pt-0.5">
                    {new Date(item.timestamp).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
              </div>

              {item.loanId && (
                <button
                  onClick={() =>
                    navigate(
                      `/district-dashboard/document-verification?appId=${item.loanId}`
                    )
                  }
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white dark:bg-blue-950 dark:text-blue-300 transition-colors shrink-0"
                >
                  Review Application
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DistrictNotifications;
