import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  Clock,
  XCircle,
  Eye,
  Copy,
  Check,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Share2,
  FileText,
  ShieldCheck,
  X,
} from 'lucide-react';
import { apiConfig } from '../../services/api';

export function AssociateCustomers() {
  const { associateUser } = useOutletContext();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const associateId = associateUser?.memberId || 'NUF-AS-PENDING';

  // Fetch real attributed applications for this associate from backend
  useEffect(() => {
    let isMounted = true;
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('utkal_member_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await fetch(`${apiConfig.baseURL}/applications`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.applications)) {
            const attributed = data.applications.filter((app) => {
              const introducer = app.membershipDetails?.introducer || app.referralId || '';
              return introducer.toLowerCase() === associateId.toLowerCase();
            });
            setCustomers(attributed);
          }
        }
      } catch (err) {
        console.warn('Error fetching associate customer portfolio:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (associateId && associateId !== 'NUF-AS-PENDING') {
      fetchCustomers();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [associateId]);

  // Filtering
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const p = c.personalDetails || {};
      const cont = c.contactDetails || {};
      const fullName = [p.title, p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ') || c.applicantName || '';
      const email = cont.email || c.email || '';
      const mobile = cont.mobile || c.mobile || '';
      const appId = c.applicationId || c._id || '';

      const matchesSearch =
        fullName.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase()) ||
        mobile.includes(search) ||
        appId.toLowerCase().includes(search.toLowerCase());

      let matchesStatus = true;
      if (statusFilter !== 'All') {
        matchesStatus = (c.status || '').toLowerCase() === statusFilter.toLowerCase();
      }

      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  return (
    <div className="space-y-6 select-none font-sans">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            My Customer Portfolio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Directory of members attributed to your Associate Member code ({associateId}).
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs">
          Total Customers: <span className="font-mono text-emerald-600 font-black">{customers.length}</span>
        </div>
      </div>

      {/* 2. SEARCH & FILTER TOOLBAR */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, mobile, ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
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
      </div>

      {/* 3. CUSTOMER LIST */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Loading Customer Portfolio...
            </p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-16 text-center px-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6 text-slate-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-slate-800">
                {search || statusFilter !== 'All' ? 'No Matching Customers Found' : 'No Customers in Your Portfolio Yet'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {search || statusFilter !== 'All'
                  ? 'Try adjusting your search criteria or resetting filters.'
                  : 'Prospective members assigned to your Associate portfolio will appear here.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200/90 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Customer Details</th>
                  <th className="py-3 px-4">Assigned Branch</th>
                  <th className="py-3 px-4">Statutory Fee</th>
                  <th className="py-3 px-4">Registration Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredCustomers.map((c) => {
                  const p = c.personalDetails || {};
                  const cont = c.contactDetails || {};
                  const fullName = [p.title, p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ') || c.applicantName || 'Applicant';
                  const email = cont.email || c.email || 'N/A';
                  const mobile = cont.mobile || c.mobile || 'N/A';
                  const status = (c.status || 'pending').toLowerCase();
                  const isApproved = status === 'approved';
                  const isRejected = status === 'rejected';

                  return (
                    <tr
                      key={c._id || c.applicationId}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => setSelectedCustomer(c)}
                    >
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-extrabold text-slate-900 block">{c.applicationId}</span>
                        {c.memberId && (
                          <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">{c.memberId}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block truncate">{fullName}</span>
                            <span className="text-[11px] text-slate-500 font-mono block">{mobile} • {email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 text-xs block">
                          {c.addressDetails?.district || c.branch || 'Bhubaneswar HQ'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-black text-slate-900 font-sans">
                          ₹ {c.membershipDetails?.totalContribution || 200}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-normal">Paid</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase inline-flex items-center gap-1 ${
                            isApproved
                              ? 'bg-emerald-100 text-emerald-800'
                              : isRejected
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isApproved ? (
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                          ) : isRejected ? (
                            <XCircle className="w-3 h-3 text-rose-600" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-600" />
                          )}
                          <span>{c.status || 'Pending'}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedCustomer(c)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          <span>Dossier</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. CUSTOMER DOSSIER POPUP MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs select-none">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-fade-in text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Customer Profile Dossier
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {[selectedCustomer.personalDetails?.firstName, selectedCustomer.personalDetails?.lastName].filter(Boolean).join(' ') || selectedCustomer.applicantName || 'Customer'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Application ID</span>
                  <span className="font-mono font-extrabold text-slate-900">{selectedCustomer.applicationId}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Member ID</span>
                  <span className="font-mono font-extrabold text-emerald-700">{selectedCustomer.memberId || 'Pending Allocation'}</span>
                </div>
              </div>

              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-800">{selectedCustomer.contactDetails?.mobile || selectedCustomer.mobile || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-800">{selectedCustomer.contactDetails?.email || selectedCustomer.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-800">
                    {[selectedCustomer.addressDetails?.address1, selectedCustomer.addressDetails?.district, selectedCustomer.addressDetails?.state].filter(Boolean).join(', ') || 'Odisha'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-emerald-900 font-bold">Registration Fee</span>
                <span className="font-black text-slate-900 font-sans">
                  ₹ {selectedCustomer.membershipDetails?.totalContribution || 200}.00 (Verified)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition-colors shadow-xs"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssociateCustomers;
