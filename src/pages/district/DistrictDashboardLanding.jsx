import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  MapPin,
  LogOut,
  User,
  Mail,
  Phone,
  FileCheck2,
  Clock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import brandLogo from '../../assets/image copy 7.png';
import { getAssignedLoanApplicationsApi } from '../../services/districtAdminService';

export function DistrictDashboardLanding() {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('utkal_district_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAssignedLoanApplicationsApi()
      .then((res) => {
        if (res && res.loans) {
          setLoans(res.loans);
        }
      })
      .catch((err) => console.warn('Could not load assigned loans preview:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('utkal_district_admin_token');
    localStorage.removeItem('utkal_district_admin_user');
    localStorage.removeItem('utkal_admin_token');
    localStorage.removeItem('utkal_finance_admin_auth');
    navigate('/login', { replace: true });
  };

  const pendingCount = loans.filter(
    (l) => l.status === 'Pending District Verification' || l.status === 'Under Verification'
  ).length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none">
      {/* Top Navigation Bar */}
      <header className="bg-slate-950/80 border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 p-1 flex items-center justify-center">
            <img src={brandLogo} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white tracking-wide">
              UTKAL FINANCE <span className="text-blue-500 font-normal text-xs">| District Portal</span>
            </h1>
            <p className="text-[11px] text-slate-400">
              {adminUser?.assignedDistrict || 'Nodal Circle'} Administration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-300 font-medium">{adminUser?.name || 'District Admin'}</span>
            <span className="text-slate-500 font-mono text-[11px]">(@{adminUser?.username || 'admin'})</span>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-red-950/40 text-red-400 hover:bg-red-900/60 hover:text-red-200 border border-red-800/50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Welcome Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950/60 via-slate-900 to-indigo-950/50 border border-blue-900/40 p-6 sm:p-8 shadow-xl">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Role: district_admin</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome, {adminUser?.name || 'District Administrator'}
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              You are authenticated to manage and verify statutory member loan applications for the{' '}
              <span className="text-blue-400 font-semibold">{adminUser?.assignedDistrict || 'Assigned'} Circle</span>.
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Assigned Circle
            </p>
            <div className="flex items-center gap-2 pt-1">
              <MapPin className="w-5 h-5 text-blue-400" />
              <span className="text-xl font-bold text-white">
                {adminUser?.assignedDistrict || 'Unassigned'}
              </span>
            </div>
            <p className="text-xs text-slate-500">Strict district isolation enabled</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Assigned Loans
            </p>
            <div className="flex items-center gap-2 pt-1">
              <FileCheck2 className="w-5 h-5 text-indigo-400" />
              <span className="text-xl font-bold text-white">{loading ? '...' : loans.length}</span>
            </div>
            <p className="text-xs text-slate-500">Total applications under circle</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pending Verification
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Clock className="w-5 h-5 text-amber-400" />
              <span className="text-xl font-bold text-white">{loading ? '...' : pendingCount}</span>
            </div>
            <p className="text-xs text-slate-500">Awaiting district physical verification</p>
          </div>
        </div>

        {/* Informational Roadmap Banner */}
        <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
          <div className="flex items-center gap-2 text-blue-400">
            <Building2 className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">
              District Portal Verification Module Ready
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your District Administrator account is active with secure backend authorization. In the upcoming phase, the full District Admin workspace (loan queue, KYC document inspector, and physical remark manager) will render directly on this portal.
          </p>
          <div className="pt-2 flex items-center gap-4 text-xs font-mono text-slate-400">
            <span>Email: {adminUser?.email}</span>
            <span>*</span>
            <span>Mobile: {adminUser?.mobile || 'N/A'}</span>
            <span>*</span>
            <span>Status: {adminUser?.status || 'active'}</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DistrictDashboardLanding;
