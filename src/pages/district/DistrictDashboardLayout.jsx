import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { DistrictSidebar } from '../../components/district/DistrictSidebar';
import { DistrictHeader } from '../../components/district/DistrictHeader';
import { DistrictMobileMenu } from '../../components/district/DistrictMobileMenu';
import { getDistrictAdminProfileApi } from '../../services/districtAdminService';

export function DistrictDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('utkal_district_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const mainContentRef = useRef(null);

  // Fetch fresh profile from database
  const refreshProfile = useCallback(async () => {
    try {
      const profile = await getDistrictAdminProfileApi();
      if (profile) {
        setAdminUser(profile);
        localStorage.setItem('utkal_district_admin_user', JSON.stringify(profile));
      }
    } catch (err) {
      console.warn('Could not refresh district admin profile:', err);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  // Scroll to top on navigation
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('utkal_district_admin_token');
    localStorage.removeItem('utkal_district_admin_user');
    localStorage.removeItem('utkal_admin_token');
    localStorage.removeItem('utkal_finance_admin_auth');
    navigate('/login', { replace: true });
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100 flex text-slate-900 font-sans select-none antialiased">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 xl:w-72 shrink-0 h-full bg-[#0B1528] z-20 overflow-hidden">
        <DistrictSidebar adminUser={adminUser} onLogout={handleLogout} />
      </aside>

      {/* Mobile Drawer */}
      <DistrictMobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        adminUser={adminUser}
        onLogout={handleLogout}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <DistrictHeader
          adminUser={adminUser}
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          onLogout={handleLogout}
        />

        <main
          ref={mainContentRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-100"
        >
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ adminUser, refreshProfile }} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default DistrictDashboardLayout;
