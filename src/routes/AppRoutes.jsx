import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { Home } from '../pages/Home';
import { About } from '../pages/About';
import { Services } from '../pages/Services';
import { Loans } from '../pages/Loans';
import { LoanProducts } from '../pages/LoanProducts';
import { Finance } from '../pages/Finance';
import { RealEstate } from '../pages/RealEstate';
import { Insurance } from '../pages/Insurance';
import { Contact } from '../pages/Contact';
import { Brochure } from '../pages/Brochure';
import { Gallery } from '../pages/Gallery';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { DistrictAdminLogin } from '../pages/DistrictAdminLogin';

// Admin Imports
import { AdminDashboardLayout } from '../pages/admin/AdminDashboardLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { isAdminAuthenticated } from '../auth/adminAuth';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { Applications } from '../pages/admin/Applications';
import { ApplicationDetails } from '../pages/admin/ApplicationDetails';
import { EditApplicationPage } from '../pages/admin/EditApplicationPage';
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
import { LoanApprovals } from '../pages/admin/LoanApprovals';
import { LoanDisbursement } from '../pages/admin/LoanDisbursement';
import { EmiCollectionManagement } from '../pages/admin/EmiCollectionManagement';
import { AllDistrictApplications } from '../pages/admin/AllDistrictApplications';
import { DistrictUnifiedManagement } from '../pages/admin/DistrictUnifiedManagement';
import { InvestorManagement } from '../pages/admin/InvestorManagement';
import { LoanEnquiries } from '../pages/admin/LoanEnquiries';
import { LoanDashboard } from '../pages/admin/LoanDashboard';
import { LoanDetailsPage } from '../pages/admin/LoanDetailsPage';
import { DistrictDashboardLayout } from '../pages/district/DistrictDashboardLayout';
import { DistrictDashboardHome } from '../pages/district/DistrictDashboardHome';
import { DistrictAssociateManagement } from '../pages/district/DistrictAssociateManagement';
import { DistrictReferralManagement } from '../pages/district/DistrictReferralManagement';
import { DistrictFinancialRecords } from '../pages/district/DistrictFinancialRecords';
import { DistrictCommissionManagement } from '../pages/district/DistrictCommissionManagement';
import { DistrictPartnerReports } from '../pages/district/DistrictPartnerReports';
import { DistrictProfile } from '../pages/district/DistrictProfile';

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
import { LoanOverview } from '../pages/member/loans/LoanOverview';
import { AvailableLoans } from '../pages/member/loans/AvailableLoans';
import { ApplyLoan } from '../pages/member/loans/ApplyLoan';
import { TrackApplication } from '../pages/member/loans/TrackApplication';
import { EmiSchedule } from '../pages/member/loans/EmiSchedule';
import { NextLoanEligibility } from '../pages/member/loans/NextLoanEligibility';
import { MyLoanApplications } from '../pages/member/loans/MyLoanApplications';
import { MyActiveLoans } from '../pages/member/loans/MyActiveLoans';
import { LoanRepayment } from '../pages/member/loans/LoanRepayment';
import { LoanHistory } from '../pages/member/loans/LoanHistory';

// Associate Member Imports
import { AssociateDashboardLayout } from '../pages/associate/AssociateDashboardLayout';
import { AssociateOverview } from '../pages/associate/AssociateOverview';
import { AssociateCustomers } from '../pages/associate/AssociateCustomers';
import { AssociateLoanApplications } from '../pages/associate/AssociateLoanApplications';
import { AssociateEarnings } from '../pages/associate/AssociateEarnings';
import { AssociateProfile } from '../pages/associate/AssociateProfile';
import { AssociateInvestorManagement } from '../pages/associate/AssociateInvestorManagement';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function UniversalDashboardRedirect() {
  const isSuperAdmin = isAdminAuthenticated();
  const districtToken = localStorage.getItem('utkal_district_admin_token');
  const districtUserRaw = localStorage.getItem('utkal_district_admin_user');
  let districtUser = null;
  try {
    districtUser = districtUserRaw ? JSON.parse(districtUserRaw) : null;
  } catch {}
  const isDistrictAdmin = !!(districtToken && districtUser && districtUser.role === 'district_admin');

  const memberToken = localStorage.getItem('utkal_member_token');
  const memberUserRaw = localStorage.getItem('utkal_member_user');
  let memberUser = null;
  try {
    memberUser = memberUserRaw ? JSON.parse(memberUserRaw) : null;
  } catch {}
  const isAssociate = !!(memberToken && memberUser && memberUser.role === 'associate');
  const isMember = !!(memberToken && memberUser && (memberUser.role === 'member' || !memberUser.role));

  if (isSuperAdmin) return <Navigate to="/admin-dashboard" replace />;
  if (isDistrictAdmin) return <Navigate to="/district-dashboard" replace />;
  if (isAssociate) return <Navigate to="/associate-dashboard" replace />;
  if (isMember) return <Navigate to="/member-dashboard" replace />;
  return <Navigate to="/login" replace />;
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
          <Route path="loans" element={<Loans />} />
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

        {/* Dedicated District Administrator Login */}
        <Route path="district-admin/login" element={<DistrictAdminLogin />} />
        <Route path="district-login" element={<Navigate to="/district-admin/login" replace />} />
        <Route path="district/login" element={<Navigate to="/district-admin/login" replace />} />
        <Route path="district-admin" element={<Navigate to="/district-admin/login" replace />} />
        <Route path="district-admin/dashboard" element={<Navigate to="/district-dashboard" replace />} />

        {/* Statutory Membership Application Portal */}
        <Route path="register" element={<Register />} />
        <Route path="membership-form" element={<Register />} />

        {/* Universal Role-Aware Dashboard Redirection Route */}
        <Route path="dashboard" element={<UniversalDashboardRedirect />} />

        {/* Member Portal Routes */}
        <Route path="member" element={<UniversalDashboardRedirect />} />
        <Route
          path="member-dashboard"
          element={
            <ProtectedRoute allowedRoles={['member']}>
              <MemberDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<MemberDashboard />} />
          <Route path="profile" element={<MemberProfile />} />
          <Route path="membership" element={<MemberMembership />} />
          <Route path="deposits" element={<MemberDeposits />} />
          <Route path="payments" element={<MemberPayments />} />
          <Route path="transactions" element={<MemberTransactions />} />
          <Route path="loans" element={<Navigate to="/member-dashboard/loans/overview" replace />} />
          <Route path="loans/overview" element={<LoanOverview />} />
          <Route path="loans/available" element={<AvailableLoans />} />
          <Route path="loans/apply" element={<ApplyLoan />} />
          <Route path="loans/track" element={<TrackApplication />} />
          <Route path="loans/emi-schedule" element={<EmiSchedule />} />
          <Route path="loans/next-eligibility" element={<NextLoanEligibility />} />
          <Route path="loans/applications" element={<MyLoanApplications />} />
          <Route path="loans/active" element={<MyActiveLoans />} />
          <Route path="loans/repayment" element={<LoanRepayment />} />
          <Route path="loans/history" element={<LoanHistory />} />
          <Route path="documents" element={<MemberDocuments />} />
          <Route path="kyc-documents" element={<MemberDocuments />} />
          <Route path="notifications" element={<MemberNotifications />} />
        </Route>

        {/* Dedicated Associate Member Portal Routes */}
        <Route path="associate" element={<Navigate to="/associate-dashboard" replace />} />
        <Route path="associate/investors" element={<Navigate to="/associate-dashboard/investors" replace />} />
        <Route
          path="associate-dashboard"
          element={
            <ProtectedRoute allowedRoles={['associate']}>
              <AssociateDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AssociateOverview />} />
          <Route path="customers" element={<Navigate to="/associate-dashboard" replace />} />
          <Route path="loans" element={<Navigate to="/associate-dashboard" replace />} />
          <Route path="investors" element={<AssociateInvestorManagement />} />
          <Route path="earnings" element={<Navigate to="/associate-dashboard" replace />} />
          <Route path="payouts" element={<Navigate to="/associate-dashboard" replace />} />
          <Route path="earnings-payouts" element={<Navigate to="/associate-dashboard" replace />} />
          <Route path="profile" element={<AssociateProfile />} />
        </Route>

        {/* Admin Portal Routes */}
        <Route path="admin" element={<Navigate to="/admin-dashboard" replace />} />
        <Route path="admin/deposits" element={<Navigate to="/admin-dashboard/deposits" replace />} />
        <Route path="admin/transactions" element={<Navigate to="/admin-dashboard/transactions" replace />} />
        <Route path="admin/notices" element={<Navigate to="/admin-dashboard/notices" replace />} />
        <Route path="admin/loan-enquiries" element={<Navigate to="/admin-dashboard/loan-enquiries" replace />} />
        <Route path="admin/loan-dashboard" element={<Navigate to="/admin-dashboard/loan-dashboard" replace />} />
        <Route path="admin/loan-overview" element={<Navigate to="/admin-dashboard/loan-dashboard" replace />} />
        <Route path="admin/loan-policy" element={<Navigate to="/admin-dashboard/loan-dashboard" replace />} />
        <Route path="admin/loan-settings" element={<Navigate to="/admin-dashboard/loan-dashboard" replace />} />
        <Route path="admin/investors" element={<Navigate to="/admin-dashboard/investors" replace />} />
        <Route path="admin/investor" element={<Navigate to="/admin-dashboard/investors" replace />} />
        <Route path="admin/investors/ledger" element={<Navigate to="/admin-dashboard/investors" replace />} />
        <Route path="admin/investors/tracking2x" element={<Navigate to="/admin-dashboard/investors" replace />} />
        <Route path="admin/investors/reports" element={<Navigate to="/admin-dashboard/investors" replace />} />
        <Route path="admin/investors/*" element={<Navigate to="/admin-dashboard/investors" replace />} />
        <Route path="admin/districts" element={<Navigate to="/admin-dashboard" replace />} />
        <Route path="admin/district-admins" element={<Navigate to="/admin-dashboard" replace />} />
        <Route path="admin_dashboard" element={<Navigate to="/admin-dashboard" replace />} />
        <Route path="admin_dashboard/applications" element={<Navigate to="/admin-dashboard/applications" replace />} />
        <Route path="admin_dashboard/*" element={<Navigate to="/admin-dashboard" replace />} />

        {/* District Partner Dedicated Portal */}
        <Route
          path="district-dashboard"
          element={
            <ProtectedRoute allowedRoles={['district_admin']}>
              <DistrictDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DistrictDashboardHome />} />
          <Route path="associates" element={<DistrictAssociateManagement />} />
          <Route path="referrals" element={<DistrictReferralManagement />} />
          <Route path="financial-records" element={<DistrictFinancialRecords />} />
          <Route path="commissions" element={<Navigate to="/district-dashboard/financial-records" replace />} />
          <Route path="reports" element={<DistrictPartnerReports />} />
          <Route path="profile" element={<DistrictProfile />} />

          {/* Legacy route aliases for backward compatibility */}
          <Route path="applications" element={<Navigate to="/district-dashboard" replace />} />
          <Route path="document-verification" element={<Navigate to="/district-dashboard/associates" replace />} />
          <Route path="customer-verification" element={<Navigate to="/district-dashboard/associates" replace />} />
          <Route path="decisions" element={<Navigate to="/district-dashboard" replace />} />
          <Route path="notifications" element={<Navigate to="/district-dashboard" replace />} />
        </Route>

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
          <Route path="applications/:id/edit" element={<EditApplicationPage />} />
          <Route path="applications/edit/:id" element={<EditApplicationPage />} />
          <Route path="members" element={<Members />} />
          <Route path="members/:memberId" element={<MemberDetails />} />
          <Route path="profile-updates" element={<ProfileUpdateRequests />} />
          <Route path="loan-dashboard" element={<LoanDashboard />} />
          <Route path="loan-policy" element={<Navigate to="/admin-dashboard/loan-dashboard" replace />} />
          <Route path="loan-settings" element={<Navigate to="/admin-dashboard/loan-dashboard" replace />} />
          <Route path="loan-overview" element={<Navigate to="/admin-dashboard/loan-dashboard" replace />} />
          <Route path="loans-overview" element={<Navigate to="/admin-dashboard/loan-dashboard" replace />} />
          <Route path="loan-enquiries" element={<LoanEnquiries />} />
          <Route path="loans" element={<LoanApprovals />} />
          <Route path="loans/:id" element={<LoanDetailsPage />} />
          <Route path="loan-details/:id" element={<LoanDetailsPage />} />
          <Route path="loan-applications/:id" element={<LoanDetailsPage />} />
          <Route path="all-district-applications" element={<AllDistrictApplications />} />
          <Route path="district-applications" element={<AllDistrictApplications />} />
          <Route path="loan-disbursements" element={<LoanDisbursement />} />
          <Route path="loan-disbursement" element={<LoanDisbursement />} />
          <Route path="emi-collections" element={<EmiCollectionManagement />} />
          <Route path="emi-collection" element={<EmiCollectionManagement />} />
          <Route path="user-emi" element={<EmiCollectionManagement />} />
          <Route path="user-emis" element={<EmiCollectionManagement />} />
          <Route path="emis" element={<EmiCollectionManagement />} />
          <Route path="districts" element={<Navigate to="/admin-dashboard" replace />} />
          <Route path="district-admins" element={<Navigate to="/admin-dashboard" replace />} />
          <Route path="deposits" element={<DepositManagement />} />
          <Route path="payments" element={<Payments />} />
          <Route path="investors" element={<InvestorManagement />} />
          <Route path="investors/overview" element={<Navigate to="/admin-dashboard/investors" replace />} />
          <Route path="investors/ledger" element={<Navigate to="/admin-dashboard/investors" replace />} />
          <Route path="investors/tracking2x" element={<Navigate to="/admin-dashboard/investors" replace />} />
          <Route path="investors/2x-tracking" element={<Navigate to="/admin-dashboard/investors" replace />} />
          <Route path="investors/reports" element={<Navigate to="/admin-dashboard/investors" replace />} />
          <Route path="investors/financial-reports" element={<Navigate to="/admin-dashboard/investors" replace />} />
          <Route path="investor-ledger" element={<Navigate to="/admin-dashboard/investors" replace />} />
          <Route path="investor-tracking" element={<Navigate to="/admin-dashboard/investors" replace />} />
          <Route path="investor-reports" element={<Navigate to="/admin-dashboard/investors" replace />} />
          <Route path="investors/reconciliation" element={<Navigate to="/admin-dashboard/investors" replace />} />
          <Route path="investors/fund-allocation" element={<Navigate to="/admin-dashboard/investors" replace />} />
          <Route path="investors/*" element={<Navigate to="/admin-dashboard/investors" replace />} />
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

