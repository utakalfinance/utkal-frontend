import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Bell,
  LogOut,
  User,
  ShieldCheck,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { getDistrictNotificationsApi } from '../../services/districtAdminService';

export function DistrictHeader({ adminUser, onToggleMobileMenu, onLogout }) {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    getDistrictNotificationsApi()
      .then((res) => {
        if (res && res.notifications) {
          setUnreadCount(res.notifications.length);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between z-10 shrink-0 shadow-2xs select-none">
      {/* Left: Mobile Toggle & Dynamic Admin Header Info */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5 h-5 text-slate-800" />
        </button>

        {/* Dynamic Header Display: "District Partner: {name} | Assigned Circle: {district}" */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">District Partner:</span>
            <span className="font-extrabold text-slate-900">
              {adminUser?.name || 'District Partner'}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-medium">Assigned Circle:</span>
            <span className="font-extrabold text-blue-700 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-700" />
              {adminUser?.assignedDistrict ? `${adminUser.assignedDistrict} Circle` : 'District Circle'}
            </span>
          </div>

          <div className="sm:hidden flex items-center gap-1.5 text-xs font-bold text-slate-900 truncate">
            <MapPin className="w-4 h-4 text-blue-700 shrink-0" />
            <span className="truncate">{adminUser?.assignedDistrict ? `${adminUser.assignedDistrict} Circle` : 'District Partner Panel'}</span>
          </div>
        </div>
      </div>

      {/* Right: Notifications, View Website, Profile & Logout */}
      <div className="flex items-center gap-2.5 shrink-0">
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-700 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          title="Open Main Website in new tab"
        >
          <span>Main Website</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* Notifications Icon */}
        <button
          onClick={() => navigate('/district-dashboard/reports')}
          className="relative p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
          title="Reports & Logs"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white animate-pulse" />
          )}
        </button>

        {/* Profile Pill */}
        <button
          onClick={() => navigate('/district-dashboard/profile')}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors"
        >
          <User className="w-3.5 h-3.5 text-blue-700" />
          <span>My Profile</span>
        </button>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 rounded-xl border border-red-200 transition-colors cursor-pointer"
          title="Sign Out of District Portal"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
