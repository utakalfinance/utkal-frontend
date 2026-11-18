import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AssociateSidebar } from '../../components/associate/AssociateSidebar';
import { AssociateHeader } from '../../components/associate/AssociateHeader';
import { AssociateMobileMenu } from '../../components/associate/AssociateMobileMenu';
import { useMemberAuth } from '../../hooks/useMemberAuth';

export function AssociateDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { memberUser, isAuthenticated, isLoading, logout, refreshProfile } = useMemberAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mainContentRef = useRef(null);

  // If memberUser is not loaded yet from context, check localStorage fallback
  const associateUser = memberUser || (() => {
    try {
      const saved = localStorage.getItem('utkal_member_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  // Guard: if user is not authenticated or not an associate, redirect to login
  useEffect(() => {
    if (!isLoading) {
      const token = localStorage.getItem('utkal_member_token');
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }

      if (associateUser && associateUser.role && associateUser.role !== 'associate') {
        if (['admin', 'super_admin'].includes(associateUser.role)) {
          navigate('/admin-dashboard', { replace: true });
        } else if (associateUser.role === 'district_admin') {
          navigate('/district-dashboard', { replace: true });
        } else {
          navigate('/member-dashboard', { replace: true });
        }
      }
    }
  }, [isLoading, associateUser, navigate]);

  // Scroll to top on sub-navigation
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (isLoading && !associateUser) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0B1528] text-white font-sans">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Loading Associate Member Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100 flex text-slate-900 font-sans antialiased">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 xl:w-72 shrink-0 h-full bg-[#0B1528] z-20 overflow-hidden shadow-xl">
        <AssociateSidebar associateUser={associateUser} onLogout={handleLogout} />
      </aside>

      {/* Mobile Drawer */}
      <AssociateMobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        associateUser={associateUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <AssociateHeader
          associateUser={associateUser}
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          onLogout={handleLogout}
        />

        {/* Scrollable Page Body */}
        <main
          ref={mainContentRef}
          className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200/60"
        >
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ associateUser, refreshProfile }} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AssociateDashboardLayout;
