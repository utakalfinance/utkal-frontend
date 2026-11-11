import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import brandLogo from '../assets/image copy 7.png';

import { useMemberAuth } from '../hooks/useMemberAuth';
import { useAdmin } from '../context/AdminContext';
import { setAdminToken } from '../auth/adminAuth';

/**
 * Single Unified Portal Login Page (/login)
 * Auto-detects Member vs Administrator from credentials and routes to the appropriate dashboard.
 */
export function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated: isMember, isLoading: memberLoading, memberUser } = useMemberAuth();
  const { loginAdmin, logoutAdmin, isAuthenticated: isAdmin } = useAdmin();

  // If already authenticated as active member, district admin, or super admin, automatically redirect to their dashboard
  useEffect(() => {
    const districtToken = localStorage.getItem('utkal_district_admin_token');
    if (isAdmin) {
      navigate('/admin-dashboard', { replace: true });
    } else if (districtToken) {
      navigate('/district-dashboard', { replace: true });
    } else if (
      isMember &&
      !['admin', 'super_admin', 'district_admin'].includes(memberUser?.role) &&
      memberUser?.status === 'active'
    ) {
      navigate('/member-dashboard', { replace: true });
    }
  }, [isAdmin, isMember, memberUser, navigate]);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  // If already authenticated, show brief transition spinner
  const hasDistrictSession = typeof window !== 'undefined' && !!localStorage.getItem('utkal_district_admin_token');
  if (
    isAdmin ||
    hasDistrictSession ||
    (isMember && !['admin', 'super_admin', 'district_admin'].includes(memberUser?.role) && memberUser?.status === 'active')
  ) {
    return (
      <div className="min-h-screen bg-[#0B1528] flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      setError('Please enter your Member ID, registered Email, or Admin ID.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Send live authentication request to backend API
      const res = await login(cleanIdentifier, password);

      // 2. Automatically navigate according to role returned by backend
      const resolvedRole = res?.role || res?.user?.role || 'member';

      if (resolvedRole === 'admin' || resolvedRole === 'super_admin') {
        try {
          localStorage.removeItem('utkal_district_admin_token');
          localStorage.removeItem('utkal_district_admin_user');
          localStorage.removeItem('utkal_member_token');
          localStorage.removeItem('utkal_member_user');
        } catch {}

        if (res.token) {
          setAdminToken(res.token);
        }
        if (loginAdmin) {
          loginAdmin(cleanIdentifier, password, res.token);
        }
        navigate('/admin-dashboard', { replace: true });
      } else if (resolvedRole === 'district_admin') {
        try {
          localStorage.removeItem('utkal_finance_admin_auth');
          localStorage.removeItem('nuf_admin_auth');
          localStorage.removeItem('adminSession');
          localStorage.removeItem('utkal_admin_token');
          localStorage.removeItem('utkal_member_token');
          localStorage.removeItem('utkal_member_user');
        } catch {}

        if (res.token) {
          localStorage.setItem('utkal_district_admin_token', res.token);
          localStorage.setItem('token', res.token);
          localStorage.setItem('utkal_admin_token', res.token);
        }
        if (res.user) {
          localStorage.setItem('utkal_district_admin_user', JSON.stringify(res.user));
          localStorage.setItem('user', JSON.stringify(res.user));
        }
        navigate('/district-dashboard', { replace: true });
      } else {
        try {
          localStorage.removeItem('utkal_finance_admin_auth');
          localStorage.removeItem('nuf_admin_auth');
          localStorage.removeItem('adminSession');
          localStorage.removeItem('utkal_admin_token');
          localStorage.removeItem('utkal_district_admin_token');
          localStorage.removeItem('utkal_district_admin_user');
        } catch {}
        navigate('/member-dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid Member ID, Email Address, or Password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1528] flex flex-col justify-between relative overflow-hidden select-none font-sans text-slate-100">
      {/* Background Decorative Lighting Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP BAR / NAVIGATE BACK TO WEBSITE */}
      <header className="relative z-10 p-4 sm:p-6 flex items-center justify-between max-w-5xl w-full mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors bg-slate-800/80 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700/80 shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Main Website</span>
        </Link>

        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">256-Bit SSL Encrypted Portal</span>
        </div>
      </header>

      {/* MAIN CARD CONTAINER */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-6 sm:p-8 animate-fade-in space-y-6 text-slate-900">
          {/* BRANDING & LOGO */}
          <div className="text-center space-y-2">
            <div className="inline-flex p-2 bg-[#0B1528] rounded-2xl border border-slate-800 shadow-md">
              <img
                src={brandLogo}
                alt="New Utkal Finance Emblem"
                className="w-12 h-12 object-contain"
              />
            </div>

            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                NEW UTKAL <span className="text-blue-700">FINANCE LTD.</span>
              </h1>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mt-0.5">
                NIDHI LIMITED PORTAL LOGIN
              </p>
            </div>
          </div>

          {/* SUBTITLE */}
          <div className="text-center text-xs text-slate-500">
            Enter your Member ID, registered Email, or Admin ID to access your portal dashboard.
          </div>

          {/* ERROR ALERT */}
          {error && (
            <div className="p-3 rounded-xl text-xs bg-rose-50 border border-rose-200 text-rose-700 font-semibold flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* IDENTIFIER INPUT */}
            <div className="space-y-1.5">
              <label
                htmlFor="identifier"
                className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700"
              >
                Member ID / Email Address / Admin ID
              </label>
              <div className="relative">
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. NUF-2026-1001, member@example.com or admin ID"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* PASSWORD INPUT */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-[11px] font-bold text-blue-700 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* REMEMBER ME & HINTS */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-[11px] font-medium">Remember this device</span>
              </label>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black text-white bg-blue-700 hover:bg-blue-800 shadow-md shadow-blue-700/20 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* REGISTER LINK */}
          <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Don't have a membership yet? </span>
            <Link to="/register" className="font-bold text-blue-700 hover:underline">
              Register New Member
            </Link>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 p-4 text-center text-[11px] text-slate-400">
        © {new Date().getFullYear()} NEW UTKAL FINANCE LIMITED • Certified by Govt. of India (Reg. No.: U64199OD2026PLC054968)
      </footer>

      {/* FORGOT PASSWORD MODAL */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setForgotModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl z-10 space-y-4 text-slate-900 text-left">
            <h3 className="text-base font-black text-slate-900">
              Password Assistance
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              To reset your password, please contact your registered branch administrator or call our helpline with your Member ID and registered mobile number.
            </p>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="text-slate-500 font-medium">Head Office Support:</div>
              <div className="font-bold text-slate-800">+91 98613 74251</div>
              <div className="text-slate-500">support@utkalfinance.com</div>
            </div>
            <button
              type="button"
              onClick={() => setForgotModalOpen(false)}
              className="w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
