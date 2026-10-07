import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { Home } from '../pages/Home';
import { About } from '../pages/About';
import { Services } from '../pages/Services';
import { LoanProducts } from '../pages/LoanProducts';
import { Finance } from '../pages/Finance';
import { RealEstate } from '../pages/RealEstate';
import { Insurance } from '../pages/Insurance';
import { Contact } from '../pages/Contact';
import { Brochure } from '../pages/Brochure';
import { Gallery } from '../pages/Gallery';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';

// Admin Imports
import { AdminDashboardLayout } from '../pages/admin/AdminDashboardLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { Applications } from '../pages/admin/Applications';
import { ApplicationDetails } from '../pages/admin/ApplicationDetails';
import { Members } from '../pages/admin/Members';
import { MemberDetails } from '../pages/admin/MemberDetails';
import { DepositManagement } from '../pages/admin/DepositManagement';
import { Payments } from '../pages/admin/Payments';
import { TransactionsManagement } from '../pages/admin/TransactionsManagement';
import { Documents } from '../pages/admin/Documents';
import { NoticesManagement } from '../pages/admin/NoticesManagement';
import { GalleryManagement } from '../pages/admin/GalleryManagement';
import { AdminProfile } from '../pages/admin/AdminProfile';
import { ProfileUpdateRequests } from '../pages/admin/ProfileUpdateRequests';

import { MyApplication } from '../pages/MyApplication';

// Member Imports
import { MemberDashboardLayout } from '../pages/member/MemberDashboardLayout';
import { MemberDashboard } from '../pages/member/MemberDashboard';
import { MemberProfile } from '../pages/member/MemberProfile';
import { MemberMembership } from '../pages/member/MemberMembership';
import { MemberDeposits } from '../pages/member/MemberDeposits';
import { MemberPayments } from '../pages/member/MemberPayments';
import { MemberTransactions } from '../pages/member/MemberTransactions';
import { MemberDocuments } from '../pages/member/MemberDocuments';
import { MemberNotifications } from '../pages/member/MemberNotifications';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Main Website Layout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="loans" element={<LoanProducts />} />
          <Route path="finance" element={<Finance />} />
          <Route path="real-estate" element={<RealEstate />} />
          <Route path="insurance" element={<Insurance />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="contact" element={<Contact />} />
          <Route path="my-application" element={<MyApplication />} />
        </Route>

        {/* Standalone Pages */}
        <Route path="brochure" element={<Brochure />} />

        {/* Single Unified Role-Based Login Route */}
        <Route path="login" element={<Login />} />
        <Route path="member-login" element={<Navigate to="/login" replace />} />
        <Route path="admin-login" element={<Navigate to="/login" replace />} />

        {/* Statutory Membership Application Portal */}
        <Route path="register" element={<Register />} />

        {/* Member Portal Routes */}
        <Route path="member" element={<Navigate to="/member-dashboard" replace />} />
        <Route path="member-dashboard" element={<MemberDashboardLayout />}>
          <Route index element={<MemberDashboard />} />
          <Route path="profile" element={<MemberProfile />} />
          <Route path="membership" element={<MemberMembership />} />
          <Route path="deposits" element={<MemberDeposits />} />
          <Route path="payments" element={<MemberPayments />} />
          <Route path="transactions" element={<MemberTransactions />} />
          <Route path="documents" element={<MemberDocuments />} />
          <Route path="notifications" element={<MemberNotifications />} />
        </Route>

        {/* Admin Portal Routes */}
        <Route path="admin" element={<Navigate to="/admin-dashboard" replace />} />
        <Route path="admin/deposits" element={<Navigate to="/admin-dashboard/deposits" replace />} />
        <Route path="admin/transactions" element={<Navigate to="/admin-dashboard/transactions" replace />} />
        <Route path="admin/notices" element={<Navigate to="/admin-dashboard/notices" replace />} />

        <Route
          path="admin-dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="applications" element={<Applications />} />
          <Route path="applications/:id" element={<ApplicationDetails />} />
          <Route path="members" element={<Members />} />
          <Route path="members/:memberId" element={<MemberDetails />} />
          <Route path="profile-updates" element={<ProfileUpdateRequests />} />
          <Route path="deposits" element={<DepositManagement />} />
          <Route path="payments" element={<Payments />} />
          <Route path="transactions" element={<Navigate to="/admin-dashboard/payments" replace />} />
          <Route path="documents" element={<Documents />} />
          <Route path="notices" element={<NoticesManagement />} />
          <Route path="gallery" element={<GalleryManagement />} />
          <Route path="team" element={<Navigate to="/admin-dashboard" replace />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

