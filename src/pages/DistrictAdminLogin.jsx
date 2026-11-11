import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronLeft,
} from 'lucide-react';
import brandLogo from '../assets/image copy 7.png';

/**
 * Dedicated District Administrator Login Portal (/district-admin/login)
 * Strictly authenticates nodal District Administrators and isolates session storage.
 */
export function DistrictAdminLogin() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  // If already authenticated as District Admin, redirect to district dashboard
  useEffect(() => {
    const districtToken = localStorage.getItem('utkal_district_admin_token');
    const districtUserRaw = localStorage.getItem('utkal_district_admin_user');
    if (districtToken && districtUserRaw) {
      try {
        const u = JSON.parse(districtUserRaw);
        if (u.role === 'district_admin') {
          navigate('/district-dashboard', { replace: true });
        }
      } catch {}
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanId = identifier.trim();
    if (!cleanId) {
      setError('Please enter your District Admin Email or Username.');
      return;
    }

    if (!password) {
      setError('Please enter your administrative password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: cleanId,
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed. Please verify credentials.');
      }

      const role = data.role || data.user?.role;

      // Strict role enforcement: Only district_admin is permitted to access through this portal
      if (role !== 'district_admin') {
        throw new Error(
          'Access Denied: This administrative portal is restricted to authorized District Administrators. Customers must use Member Login.'
        );
      }

      // Check account status
      if (data.user?.status === 'inactive') {
        throw new Error('Your District Administrator account has been deactivated. Contact Super Administrator.');
      }

      // Store District Admin isolated session keys
      try {
        localStorage.removeItem('utkal_member_token');
        localStorage.removeItem('utkal_member_user');
        localStorage.removeItem('utkal_finance_admin_auth');
        localStorage.removeItem('nuf_admin_auth');
      } catch {}

      if (data.token) {
        localStorage.setItem('utkal_district_admin_token', data.token);
        localStorage.setItem('token', data.token);
        localStorage.setItem('utkal_admin_token', data.token);
      }
      if (data.user) {
        localStorage.setItem('utkal_district_admin_user', JSON.stringify(data.user));
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      setLoginSuccess(true);

      setTimeout(() => {
        navigate('/district-dashboard', { replace: true });
      }, 600);
    } catch (err) {
      console.error('District Admin login error:', err);
      setError(err.message || 'Login failed. Please check network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070E1B] via-[#0B1528] to-[#122344] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-left">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Back Link */}
        <div className="mb-6 flex justify-between items-center px-4 sm:px-0">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Return to Website</span>
          </Link>
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-800/60">
            Nodal Admin Portal
          </span>
        </div>

        {/* Brand Card */}
        <div className="text-center space-y-2 px-4 sm:px-0">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md p-2.5 mx-auto border border-white/20 shadow-xl flex items-center justify-center">
            <img src={brandLogo} alt="Utkal Finance" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
            District Administration
          </h2>
          <p className="text-xs text-blue-200/80 font-medium">
            Authorized Nodal Portal for On-Ground Verification & Loan Routing
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-[#0f1d38]/90 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-blue-900/40 space-y-6">
          {/* Security Notice */}
          <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-800/40 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-200/90 leading-relaxed font-medium">
              Access is strictly restricted to appointed District Administrators of New Utkal Finance Ltd. All access attempts are audited and logged.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-start gap-2.5 text-rose-200 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {/* Success Banner */}
          {loginSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center gap-2.5 text-emerald-200 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="flex-1 font-bold">Authenticated! Redirecting to District Dashboard...</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email / Username */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                District Admin Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. khurda.admin@utkalfinance.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/70 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrative password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900/70 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || loginSuccess}
              className="w-full py-3 px-4 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/30 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Administrative Authority...</span>
                </>
              ) : (
                <>
                  <span>Sign In to District Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Alternate Portals */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-2 text-center text-xs">
            <div className="text-slate-400">
              Are you a member customer?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
                Customer Member Login
              </Link>
            </div>
            <div className="text-slate-400">
              Super Administrator?{' '}
              <Link to="/login" className="text-amber-400 hover:text-amber-300 font-bold transition-colors">
                Super Admin Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

