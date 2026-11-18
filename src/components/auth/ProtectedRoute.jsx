import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { isAdminAuthenticated, getAdminSession } from '../../auth/adminAuth';

/**
 * Universal ProtectedRoute component for securing role-based dashboard routes:
 * - super_admin / admin -> /admin-dashboard
 * - district_admin -> /district-dashboard
 * - member -> /member-dashboard
 */
export function ProtectedRoute({ children, allowedRoles = ['admin', 'super_admin'] }) {
  const location = useLocation();

  // 1. Check Super Admin session
  const isSuperAdmin = isAdminAuthenticated();
  const superAdminSession = getAdminSession();

  // 2. Check District Admin session
  const districtToken = localStorage.getItem('utkal_district_admin_token');
  const districtUserRaw = localStorage.getItem('utkal_district_admin_user');
  let districtUser = null;
  try {
    districtUser = districtUserRaw ? JSON.parse(districtUserRaw) : null;
  } catch {}
  const isDistrictAdmin = !!(districtToken && districtUser && districtUser.role === 'district_admin');

  // 3. Check Member / Associate session
  const memberToken = localStorage.getItem('utkal_member_token');
  const memberUserRaw = localStorage.getItem('utkal_member_user');
  let memberUser = null;
  try {
    memberUser = memberUserRaw ? JSON.parse(memberUserRaw) : null;
  } catch {}
  const isAssociate = !!(memberToken && memberUser && memberUser.role === 'associate');
  const isMember = !!(memberToken && memberUser && (memberUser.role === 'member' || !memberUser.role));

  // Determine current active user role
  let currentRole = null;
  if (isSuperAdmin) {
    currentRole = 'super_admin';
  } else if (isDistrictAdmin) {
    currentRole = 'district_admin';
  } else if (isAssociate) {
    currentRole = 'associate';
  } else if (isMember) {
    currentRole = 'member';
  }

  // If not authenticated at all, redirect to appropriate login portal
  if (!currentRole) {
    if (allowedRoles.includes('district_admin') && !allowedRoles.includes('member') && !allowedRoles.includes('associate') && !allowedRoles.includes('super_admin')) {
      return <Navigate to="/district-admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  const isAuthorized =
    allowedRoles.includes(currentRole) ||
    ((currentRole === 'super_admin' || currentRole === 'admin') &&
      (allowedRoles.includes('super_admin') || allowedRoles.includes('admin')));

  if (!isAuthorized) {
    // Redirect unauthorized user to their own proper dashboard
    if (currentRole === 'district_admin') {
      return <Navigate to="/district-dashboard" replace />;
    }
    if (currentRole === 'associate') {
      return <Navigate to="/associate-dashboard" replace />;
    }
    if (currentRole === 'member') {
      return <Navigate to="/member-dashboard" replace />;
    }
    if (currentRole === 'super_admin' || currentRole === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
}

export default ProtectedRoute;
