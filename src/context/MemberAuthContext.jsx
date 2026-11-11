import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  memberLoginApi,
  getMemberProfileApi,
  changePasswordApi,
  updateMemberProfileApi,
} from '../services/authService';

const MemberAuthContext = createContext(null);

export function MemberAuthProvider({ children }) {
  const [memberUser, setMemberUser] = useState(() => {
    const saved = localStorage.getItem('utkal_member_user');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      if (['admin', 'super_admin', 'district_admin'].includes(parsed?.role)) {
        localStorage.removeItem('utkal_member_user');
        localStorage.removeItem('utkal_member_token');
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });
  const [memberDetails, setMemberDetails] = useState(() => {
    const saved = localStorage.getItem('utkal_member_details');
    return saved ? JSON.parse(saved) : null;
  });
  const [application, setApplication] = useState(() => {
    const saved = localStorage.getItem('utkal_member_app');
    return saved ? JSON.parse(saved) : null;
  });
  const [payments, setPayments] = useState(() => {
    const saved = localStorage.getItem('utkal_member_payments');
    return saved ? JSON.parse(saved) : [];
  });
  const [pendingUpdateRequest, setPendingUpdateRequest] = useState(null);
  const [token, setToken] = useState(() => {
    return localStorage.getItem('utkal_member_token') || null;
  });
  const [isLoading, setIsLoading] = useState(() => {
    return !!localStorage.getItem('utkal_member_token');
  });

  // Refresh profile on mount if token is available
  const refreshProfile = useCallback(async () => {
    const activeToken = token || localStorage.getItem('utkal_member_token');
    if (!activeToken) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await getMemberProfileApi(activeToken);
      if (res && res.user) {
        // If the profile returned is admin, clear member context immediately
        if (
          ['admin', 'super_admin', 'district_admin'].includes(res.user?.role) ||
          ['admin', 'super_admin', 'district_admin'].includes(res.role)
        ) {
          logout();
          return;
        }

        // If linked application was rejected or user account was deactivated, force immediate logout
        if (res.application?.status === 'rejected' || res.user?.status !== 'active') {
          logout();
          return;
        }

        setMemberUser(res.user);
        localStorage.setItem('utkal_member_user', JSON.stringify(res.user));
        if (res.member) {
          setMemberDetails(res.member);
          localStorage.setItem('utkal_member_details', JSON.stringify(res.member));
        }
        if (res.application) {
          setApplication(res.application);
          localStorage.setItem('utkal_member_app', JSON.stringify(res.application));
        }
        if (Array.isArray(res.payments)) {
          setPayments(res.payments);
          localStorage.setItem('utkal_member_payments', JSON.stringify(res.payments));
        }
        setPendingUpdateRequest(res.pendingUpdateRequest || null);
      }
    } catch (err) {
      console.warn('Could not refresh member profile with token:', err.message);
      // Only log out if it is an explicit authentication rejection (401 Unauthorized or 403 Forbidden)
      const isAuthError = err.status === 401 || err.status === 403 ||
        /invalid token|jwt expired|jwt malformed|unauthorized|forbidden|token expired|not authorized/i.test(err.message || '');
      if (isAuthError) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (identifier, password) => {
    setIsLoading(true);
    try {
      const res = await memberLoginApi({ identifier, password });

      // If user logging in is staff (admin, super_admin, district_admin), do not store in member context
      if (
        ['admin', 'super_admin', 'district_admin'].includes(res.role) ||
        ['admin', 'super_admin', 'district_admin'].includes(res.user?.role)
      ) {
        logout();
        return res;
      }
      
      // If application is marked rejected or user inactive, block immediately
      if (res.application?.status === 'rejected' || res.user?.status !== 'active') {
        logout();
        throw new Error('Your membership application has been rejected by the administrator. Access to the Member Dashboard is not permitted.');
      }

      setToken(res.token);
      setMemberUser(res.user);
      setMemberDetails(res.member || null);
      setApplication(res.application || null);
      setPayments(res.payments || []);
      setPendingUpdateRequest(res.pendingUpdateRequest || null);

      localStorage.setItem('utkal_member_token', res.token);
      localStorage.setItem('utkal_member_user', JSON.stringify(res.user));
      if (res.member) {
        localStorage.setItem('utkal_member_details', JSON.stringify(res.member));
      }
      if (res.application) {
        localStorage.setItem('utkal_member_app', JSON.stringify(res.application));
      }
      if (Array.isArray(res.payments)) {
        localStorage.setItem('utkal_member_payments', JSON.stringify(res.payments));
      }

      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setMemberUser(null);
    setMemberDetails(null);
    setApplication(null);
    setPayments([]);
    setPendingUpdateRequest(null);
    setToken(null);
    localStorage.removeItem('utkal_member_token');
    localStorage.removeItem('utkal_member_user');
    localStorage.removeItem('utkal_member_details');
    localStorage.removeItem('utkal_member_app');
    localStorage.removeItem('utkal_member_payments');
  };

  const updatePassword = async (currentPassword, newPassword) => {
    const activeToken = token || localStorage.getItem('utkal_member_token');
    const res = await changePasswordApi({ currentPassword, newPassword }, activeToken);
    
    // Update local mustChangePassword state
    if (memberUser) {
      const updatedUser = { ...memberUser, mustChangePassword: false };
      setMemberUser(updatedUser);
      localStorage.setItem('utkal_member_user', JSON.stringify(updatedUser));
    }

    return res;
  };

  const updateProfile = async (profileData) => {
    const activeToken = token || localStorage.getItem('utkal_member_token');
    const res = await updateMemberProfileApi(profileData, activeToken);

    if (res && res.pendingUpdateRequest) {
      setPendingUpdateRequest(res.pendingUpdateRequest);
    }
    return res;
  };

  const isUserValid = !!token && !!memberUser && memberUser.role !== 'admin' && memberUser.status === 'active' && application?.status !== 'rejected';

  const value = {
    memberUser,
    memberDetails,
    application,
    payments,
    pendingUpdateRequest,
    token,
    isAuthenticated: isUserValid,
    isLoading,
    login,
    logout,
    updatePassword,
    updateProfile,
    refreshProfile,
  };

  return (
    <MemberAuthContext.Provider value={value}>
      {children}
    </MemberAuthContext.Provider>
  );
}

export function useMemberAuth() {
  const context = useContext(MemberAuthContext);
  if (!context) {
    throw new Error('useMemberAuth must be used within a MemberAuthProvider');
  }
  return context;
}
