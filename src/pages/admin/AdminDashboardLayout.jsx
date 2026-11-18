import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Bell, X, ArrowRight } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminMobileMenu } from '../../components/admin/AdminMobileMenu';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';

export function AdminDashboardLayout() {
  const { isAuthenticated, refreshData, newApplicationAlert, clearNewApplicationAlert } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mainContentRef = useRef(null);

  // Auto-dismiss alert after 10 seconds
  useEffect(() => {
    if (newApplicationAlert) {
      const timer = setTimeout(() => {
        if (typeof clearNewApplicationAlert === 'function') {
          clearNewApplicationAlert();
        }
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [newApplicationAlert, clearNewApplicationAlert]);

  // Fetch fresh live data from database immediately on mounting and route changes
  useEffect(() => {
    if (typeof refreshData === 'function') {
      refreshData();
    }
  }, [location.pathname, refreshData]);

  // Reset main container scroll to top when changing admin routes
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname]);

  if (!isAuthenticated) {
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100 flex text-slate-900 font-sans select-none antialiased">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:block w-64 xl:w-72 shrink-0 h-full bg-[#0B1528] z-20 overflow-hidden">
        <AdminSidebar />
      </aside>

      {/* MOBILE DRAWER */}
      <AdminMobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* MAIN CONTAINER (HEADER + SCROLLABLE RIGHT PANE) */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* TOP HEADER */}
        <AdminHeader onToggleMobileMenu={() => setMobileMenuOpen(true)} />

        {/* SCROLLABLE MAIN PAGE CONTENT WITH RIGHT-SIDE SCROLLBAR */}
        <main ref={mainContentRef} className="flex-1 overflow-y-auto w-full custom-scrollbar">
          <div className="max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* REAL-TIME FLOATING APPLICATION ALERT TOAST */}
      {newApplicationAlert && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl shadow-2xl border border-amber-500/50 p-4 animate-slide-up flex flex-col gap-2.5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-md">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                  New Application Received
                </span>
                <button
                  type="button"
                  onClick={clearNewApplicationAlert}
                  className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="font-extrabold text-sm text-white truncate mt-0.5">
                {newApplicationAlert.applicantName}
              </p>
              <p className="text-[11px] text-slate-300 font-mono">
                {newApplicationAlert.applicationId} • ₹{newApplicationAlert.amount} • {newApplicationAlert.time}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800">
            <button
              type="button"
              onClick={clearNewApplicationAlert}
              className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={() => {
                navigate(`/admin-dashboard/applications/${newApplicationAlert.id}`);
                clearNewApplicationAlert();
              }}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-lg cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <span>Review Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboardLayout;
