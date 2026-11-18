import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  TrendingUp,
  CreditCard,
  Building2,
  Calendar,
  AlertCircle,
  ShieldCheck,
  IndianRupee,
} from 'lucide-react';
import { apiConfig } from '../../services/api';

export function AssociateLoanApplications() {
  const { associateUser } = useOutletContext();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedLoan, setSelectedLoan] = useState(null);

  const associateId = associateUser?.memberId || 'NUF-AS-PENDING';

  // Fetch real loan applications for this associate's customer circle
  useEffect(() => {
    let isMounted = true;
    const fetchLoanApplications = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('utkal_member_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch loans from backend
        const res = await fetch(`${apiConfig.baseURL}/loans/all`, { headers }).catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.loans)) {
            // Filter loans attributed to this associate's customers
            const attributed = data.loans.filter((l) => {
              const introducer = l.introducer || l.associateId || l.referralCode || '';
              return introducer.toLowerCase() === associateId.toLowerCase();
            });
            setLoans(attributed);
          }
        }
      } catch (err) {
        console.warn('Notice: Associate loan applications fetch:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (associateId && associateId !== 'NUF-AS-PENDING') {
      fetchLoanApplications();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [associateId]);

  const filteredLoans = useMemo(() => {
    return loans.filter((l) => {
      const applicant = l.applicantName || l.customerName || l.borrowerName || '';
      const loanId = l.loanId || l._id || '';
      const memberId = l.memberId || '';

      const matchesSearch =
        applicant.toLowerCase().includes(search.toLowerCase()) ||
        loanId.toLowerCase().includes(search.toLowerCase()) ||
        memberId.toLowerCase().includes(search.toLowerCase());

      let matchesStatus = true;
      if (statusFilter !== 'All') {
        matchesStatus = (l.status || '').toLowerCase() === statusFilter.toLowerCase();
      }

      return matchesSearch && matchesStatus;
    });
  }, [loans, search, statusFilter]);

  // Aggregate metrics
  const totalVolume = loans.reduce((acc, curr) => acc + (Number(curr.requestedAmount || curr.amount) || 0), 0);
  const disbursedVolume = loans
    .filter((l) => (l.status || '').toLowerCase() === 'disbursed')
    .reduce((acc, curr) => acc + (Number(curr.sanctionedAmount || curr.amount) || 0), 0);

  return (
    <div className="space-y-6 select-none font-sans">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Customer Loan Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Track credit facility appraisal, tier sanctioning, and disbursement pipelines for your sourced members.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-mono text-xs font-bold shadow-xs">
            Associate Code: {associateId}
          </span>
        </div>
      </div>

      {/* 2. STATS PIPELINE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Submitted Requests
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 font-sans block mt-1">
            {loans.length}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">From your customer circle</span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Under Appraisal
          </span>
          <span className="text-2xl sm:text-3xl font-black text-amber-700 font-sans block mt-1">
            {loans.filter((l) => ['pending', 'under_review', 'submitted'].includes((l.status || '').toLowerCase())).length}
          </span>
          <span className="text-[11px] text-amber-600 mt-1 block">District &amp; HQ Verification</span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Sanctioned / Active
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-sans block mt-1">
            {loans.filter((l) => ['approved', 'sanctioned', 'disbursed'].includes((l.status || '').toLowerCase())).length}
          </span>
          <span className="text-[11px] text-emerald-600 mt-1 block">Credit Limit Sanctioned</span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Disbursed Volume
          </span>
          <span className="text-2xl sm:text-3xl font-black text-blue-900 font-sans block mt-1">
            ₹ {disbursedVolume.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-blue-600 mt-1 block">Direct Bank Disbursals</span>
        </div>
      </div>

      {/* 3. SEARCH & STATUS FILTER TOOLBAR */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by borrower name, loan ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['All', 'Pending', 'Sanctioned', 'Disbursed', 'Rejected'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* 4. LOAN APPLICATIONS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Loading Customer Loan Applications...
            </p>
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="py-16 text-center px-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6 text-slate-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-slate-800">No Loan Applications Recorded</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Credit facility requests submitted by your attributed customers will show here automatically once they apply through their member portal.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200/90 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Loan Reference</th>
                  <th className="py-3 px-4">Borrower Name</th>
                  <th className="py-3 px-4">Requested Principal</th>
                  <th className="py-3 px-4">Tenure &amp; Rate</th>
                  <th className="py-3 px-4">Lifecycle Status</th>
                  <th className="py-3 px-4 text-right">Commission Est.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredLoans.map((l) => {
                  const status = (l.status || 'pending').toLowerCase();
                  const isDisbursed = status === 'disbursed';
                  const isApproved = status === 'approved' || status === 'sanctioned';
                  const amount = Number(l.requestedAmount || l.amount || 10000);
                  const commission = Math.round(amount * 0.01); // 1.0% statutory sourcing incentive

                  return (
                    <tr key={l._id || l.loanId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-extrabold text-slate-900 block">{l.loanId || 'NUF-LN-PENDING'}</span>
                        <span className="text-[10px] text-slate-400 block">{l.date ? new Date(l.date).toLocaleDateString('en-GB') : 'Submitted'}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{l.applicantName || l.customerName || 'Borrower'}</span>
                        <span className="text-[10px] text-slate-500 font-mono block">{l.memberId || 'Active Member'}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-black text-slate-900 font-sans block">
                          ₹ {amount.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 block">Term Facility</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 block">{l.tenureMonths || 3} Months</span>
                        <span className="text-[10px] text-emerald-700 font-semibold block">{l.interestRate || '11% p.a.'}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase inline-flex items-center gap-1 ${
                            isDisbursed
                              ? 'bg-emerald-100 text-emerald-800'
                              : isApproved
                              ? 'bg-blue-100 text-blue-800'
                              : status === 'rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isDisbursed ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-600" />
                          )}
                          <span>{l.status || 'Pending'}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="font-mono font-bold text-emerald-700 text-xs">
                          ₹ {commission.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-normal">1.0% Rate</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AssociateLoanApplications;
