import React, { useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  FolderCheck,
  CreditCard,
  PiggyBank,
  Bell,
  Image as ImageIcon,
  UserCheck,
  User,
  LogOut,
  BookOpen,
  FileSpreadsheet,
  ChevronRight
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import brandLogo from '../../assets/image copy 7.png';

export function AdminSidebar() {
  const { 
    logoutAdmin, 
    unreadPendingAppsCount = 0, 
    markAllApplicationsAsSeen,
    unreadNoticesCount = 0,
    markAllNoticesAsSeen 
  } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const activeRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const isApplicationsActive = location.pathname.startsWith('/admin-dashboard/applications');
  const isNoticesActive = location.pathname.startsWith('/admin-dashboard/notices');

  const pendingApps = isApplicationsActive ? 0 : unreadPendingAppsCount;
  const activeNotices = isNoticesActive ? 0 : unreadNoticesCount;

  // Clear unread badges when currently viewing the respective pages
  useEffect(() => {
    if (isApplicationsActive && typeof markAllApplicationsAsSeen === 'function') {
      markAllApplicationsAsSeen();
    }
    if (isNoticesActive && typeof markAllNoticesAsSeen === 'function') {
      markAllNoticesAsSeen();
    }
  }, [isApplicationsActive, isNoticesActive, markAllApplicationsAsSeen, markAllNoticesAsSeen]);

  // Auto-scroll active nav item into view ONLY inside sidebar container without scrolling window
  useEffect(() => {
    if (activeRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const item = activeRef.current;

      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;
      const itemTop = item.offsetTop;
      const itemBottom = itemTop + item.offsetHeight;

      if (itemTop < containerTop) {
        container.scrollTo({ top: Math.max(0, itemTop - 12), behavior: 'smooth' });
      } else if (itemBottom > containerBottom) {
        container.scrollTo({ top: itemBottom - container.clientHeight + 12, behavior: 'smooth' });
      }
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin-login');
  };

  const menuSections = [
    {
      title: 'CORE PORTAL',
      items: [
        { label: 'Dashboard', path: '/admin-dashboard', icon: LayoutDashboard },
        { label: 'Applications', path: '/admin-dashboard/applications', icon: FileText, badge: pendingApps > 0 ? pendingApps : null, badgeColor: 'bg-amber-500 text-slate-950' },
        { label: 'Members', path: '/admin-dashboard/members', icon: Users },
        { label: 'Profile Updates', path: '/admin-dashboard/profile-updates', icon: UserCheck },
        { label: 'Documents', path: '/admin-dashboard/documents', icon: FolderCheck },
      ],
    },
    {
      title: 'FINANCIAL SERVICES',
      items: [
        { label: 'Deposits', path: '/admin-dashboard/deposits', icon: PiggyBank },
        { label: 'Payments', path: '/admin-dashboard/payments', icon: CreditCard },
      ],
    },
    {
      title: 'COMMUNICATION & MEDIA',
      items: [
        { label: 'Notices & Circulars', path: '/admin-dashboard/notices', icon: Bell, badge: activeNotices > 0 ? activeNotices : null, badgeColor: 'bg-blue-500 text-white' },
        { label: 'Gallery', path: '/admin-dashboard/gallery', icon: ImageIcon },
        { label: 'Company Brochure', path: '/brochure', icon: BookOpen },
      ],
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { label: 'Admin Profile', path: '/admin-dashboard/profile', icon: User },
      ],
    },
  ];

  return (
    <aside className="w-full bg-[#0B1528] text-white flex flex-col h-full border-r border-slate-800/80 select-none overflow-hidden">
      {/* BRANDING HEADER - STICKY TOP & NON-SHRINKING */}
      <div className="p-3.5 sm:p-4 border-b border-slate-800/90 flex items-center gap-3 shrink-0 bg-[#0B1528] z-10">
        <div 
          onClick={() => navigate('/')}
          className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 p-1 flex items-center justify-center shrink-0 cursor-pointer shadow-md hover:border-blue-500 transition-colors"
          title="Go to Website Home"
        >
          <img src={brandLogo} alt="Logo" className="w-full h-full object-contain" />
        </div>

        <div className="space-y-0.5 min-w-0">
          <h1 
            onClick={() => navigate('/')}
            className="text-xs font-black tracking-tight text-white cursor-pointer leading-tight flex items-center gap-1 truncate hover:text-blue-300 transition-colors"
          >
            NEW UTKAL <span className="text-blue-400">FINANCE LTD.</span>
          </h1>
          <div className="flex items-center gap-1">
            <span className="text-[8.5px] font-extrabold tracking-wider uppercase text-slate-400 truncate">
              TRUST • GROWTH • PROSPERITY
            </span>
          </div>
        </div>
      </div>

      {/* NAVIGATION LINKS - SCROLLABLE MIDDLE CONTAINER */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
        {menuSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h2 className="px-2.5 text-[9px] font-black tracking-widest text-slate-400 uppercase">
              {section.title}
            </h2>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/admin-dashboard'}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-[#004085] text-white shadow-md border border-blue-400/30'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <div ref={isActive ? activeRef : null} className="flex items-center justify-between w-full min-w-0">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-300' : 'text-slate-400'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge ? (
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${item.badgeColor} shrink-0`}>
                            {item.badge}
                          </span>
                        ) : (
                          isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-300 shrink-0 opacity-80" />
                        )}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER LOGOUT - STICKY BOTTOM & NON-SHRINKING */}
      <div className="p-2.5 border-t border-slate-800/90 shrink-0 bg-[#0B1528]">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer border border-rose-500/20"
        >
          <div className="flex items-center gap-2.5">
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">v1.0</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
