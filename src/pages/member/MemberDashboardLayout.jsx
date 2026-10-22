import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { MemberSidebar } from '../../components/member/MemberSidebar';
import { MemberHeader } from '../../components/member/MemberHeader';
import { MemberMobileMenu } from '../../components/member/MemberMobileMenu';
import { ChangePasswordModal } from '../../components/member/ChangePasswordModal';
import { MakeDepositModal } from '../../components/member/MakeDepositModal';
import { useMemberAuth } from '../../hooks/useMemberAuth';

/**
 * MemberDashboardLayout
 * Master shell layout for all member portal authenticated routes.
 */
export function MemberDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { memberUser, application, isAuthenticated, isLoading, logout } = useMemberAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [makeDepositOpen, setMakeDepositOpen] = useState(false);

  const mainContentRef = useRef(null);

  // Redirect to login if unauthenticated or rejected
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || application?.status === 'rejected' || (memberUser && memberUser.status !== 'active')) {
        if (application?.status === 'rejected' || (memberUser && memberUser.status !== 'active')) {
          logout();
        }
        navigate('/login', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, application, memberUser, logout, navigate]);

  // Scroll to top of main container when switching subpages
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Loading Member Portal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100 flex text-slate-900 font-sans antialiased">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:block w-64 xl:w-72 shrink-0 h-full bg-[#0B1528] z-20 overflow-hidden">
        <MemberSidebar
          memberUser={memberUser}
          onChangePassword={() => setChangePasswordOpen(true)}
          onLogout={handleLogout}
        />
      </aside>

      {/* MOBILE DRAWER */}
      <MemberMobileMenu
        isOpen={mobileMenuOpen}
        memberUser={memberUser}
        onClose={() => setMobileMenuOpen(false)}
        onChangePassword={() => setChangePasswordOpen(true)}
        onLogout={handleLogout}
      />

      {/* MAIN CONTAINER (HEADER + SCROLLABLE RIGHT PANE) */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* TOP HEADER */}
        <MemberHeader
          memberUser={memberUser}
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          onChangePassword={() => setChangePasswordOpen(true)}
          onLogout={handleLogout}
        />

        {/* SCROLLABLE MAIN PAGE CONTENT */}
        <main
          ref={mainContentRef}
          className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto"
        >
          {/* Provide openMakeDeposit modal trigger and member context via Outlet context */}
          <Outlet
            context={{
              openMakeDeposit: () => setMakeDepositOpen(true),
              openChangePassword: () => setChangePasswordOpen(true),
              memberUser,
              application,
            }}
          />
        </main>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />

      {/* MAKE DEPOSIT MODAL */}
      <MakeDepositModal
        isOpen={makeDepositOpen}
        onClose={() => setMakeDepositOpen(false)}
      />
    </div>
  );
}

export default MemberDashboardLayout;
