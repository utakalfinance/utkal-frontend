import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, MapPin, RefreshCw } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { MemberStats } from '../../components/admin/MemberStats';
import { MemberTable } from '../../components/admin/MemberTable';
import { EditApplicationModal } from '../../components/admin/EditApplicationModal';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import { getDistrictsApi } from '../../services/districtService';

export function Members() {
  const { members, applications, updateMemberStatus, updateApplication } = useAdmin();
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('All'); // 'All' | 'Associate' | 'Regular'
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [districtsList, setDistrictsList] = useState([]);
  const [editingApp, setEditingApp] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const associateMembersCount = members.filter(
    (m) => m.role === 'associate' || m.isAssociate === true
  ).length;
  const regularMembersCount = Math.max(0, members.length - associateMembersCount);

  // 1. Populate dynamic district list from MongoDB districts registry + existing members/apps
  useEffect(() => {
    let isMounted = true;
    getDistrictsApi()
      .then((res) => {
        if (!isMounted) return;
        const apiDistricts = (res?.districts || []).map((d) => d.name).filter(Boolean);
        const memberDistricts = members.map((m) => m.district || m.addressDetails?.district || m.addressDetails?.commDistrict).filter(Boolean);
        const appDistricts = applications.map((a) => a.addressDetails?.district || a.addressDetails?.commDistrict || a.district).filter(Boolean);

        const combined = Array.from(
          new Set([
            'Khurda',
            'Cuttack',
            'Nayagarh',
            'Puri',
            'Bhubaneswar',
            'Ganjam',
            ...apiDistricts,
            ...memberDistricts,
            ...appDistricts,
          ].map((d) => d.split(',')[0].replace(/\s*circle\s*$/i, '').trim()))
        ).filter(Boolean).sort();

        setDistrictsList(combined);
      })
      .catch((err) => {
        console.warn('Could not fetch districts list:', err.message);
      });

    return () => {
      isMounted = false;
    };
  }, [members, applications]);

  // 2. Filter members by search query, active/inactive status filter, and selected district
  const filtered = members.filter((m) => {
    const memberId = m.memberId || m.id || '';
    const appId = m.applicationId || m.app?.id || '';
    const name = m.applicantName || m.name || '';
    const email = m.email || '';
    const mobile = m.mobile || '';

    // Resolve member district
    const memberDistrict = (
      m.district ||
      m.addressDetails?.district ||
      m.addressDetails?.commDistrict ||
      m.personalDetails?.district ||
      ''
    ).toLowerCase();

    const isAssoc = m.role === 'associate' || m.isAssociate === true;

    let matchesClass = true;
    if (filterClass === 'Associate') {
      matchesClass = isAssoc;
    } else if (filterClass === 'Regular') {
      matchesClass = !isAssoc;
    }

    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      memberId.toLowerCase().includes(search.toLowerCase()) ||
      appId.toLowerCase().includes(search.toLowerCase()) ||
      mobile.includes(search) ||
      memberDistrict.includes(search.toLowerCase()) ||
      email.toLowerCase().includes(search.toLowerCase()) ||
      (m.membershipType || '').toLowerCase().includes(search.toLowerCase()) ||
      (isAssoc && 'associate member'.includes(search.toLowerCase()));

    let matchesStatus = true;
    if (filterStatus === 'Active') {
      matchesStatus = (m.membershipStatus || m.status || '').toLowerCase() === 'active';
    } else if (filterStatus === 'Inactive') {
      matchesStatus = (m.membershipStatus || m.status || '').toLowerCase() === 'inactive';
    }

    let matchesDistrict = true;
    if (selectedDistrict !== 'All') {
      const cleanTarget = selectedDistrict.toLowerCase().replace(/\s*circle\s*$/i, '').trim();
      matchesDistrict = memberDistrict.includes(cleanTarget);
    }

    return matchesSearch && matchesStatus && matchesDistrict && matchesClass;
  });

  const handleEditMember = (member) => {
    const targetApp = applications.find(
      (a) => a.memberId === member.memberId || a.id === member.applicationId || a._id === member.applicationId
    );
    setEditingApp(targetApp || member.app || member);
  };

  const handleSaveEdit = async (appId, payload) => {
    try {
      await updateApplication(appId, payload);
      setSuccessMessage(`Member ${payload.applicantName || appId} updated successfully.`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Error saving member edit:', err);
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in font-sans">
      {/* PAGE HEADER */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Members</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Manage approved New Utkal Finance members {selectedDistrict !== 'All' ? `in ${selectedDistrict} District` : ''}.
        </p>
      </div>

      {/* MEMBER STATS CARDS (DYNAMIC ACCORDING TO SELECTED DISTRICT) */}
      <MemberStats members={selectedDistrict === 'All' ? members : filtered} />

      {/* FILTER & SEARCH CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-4">
        {/* MEMBERSHIP CLASS TABS */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          <button
            type="button"
            onClick={() => setFilterClass('All')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              filterClass === 'All'
                ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/30'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>All Members</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                filterClass === 'All' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {members.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterClass('Associate')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              filterClass === 'Associate'
                ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/30'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>Associate Members</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                filterClass === 'Associate' ? 'bg-white/20 text-white' : 'bg-emerald-200/80 text-emerald-900'
              }`}
            >
              {associateMembersCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFilterClass('Regular')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              filterClass === 'Regular'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>Ordinary Members</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                filterClass === 'Regular' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {regularMembersCount}
            </span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* SEARCH FIELD */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members by ID, App ID, name, email..."
              className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none transition-all font-medium"
            />
          </div>

          {/* DISTRICT OPTION & STATUS CONTROLS */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* DISTRICT DROPDOWN OPTION */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
                District:
              </span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
              >
                <option value="All">All Districts</option>
                {districtsList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* STATUS FILTER BUTTONS */}
            <div className="flex items-center gap-1.5">
              {['All', 'Active', 'Inactive'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filterStatus === status
                      ? 'bg-[#0b1c3d] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* NOTIFICATION */}
        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* MEMBER TABLE */}
        <MemberTable
          members={filtered}
          onToggleStatus={updateMemberStatus}
          onEdit={handleEditMember}
        />
      </div>

      {/* EDIT MODAL */}
      <ErrorBoundary onReset={() => setEditingApp(null)}>
        {editingApp && (
          <EditApplicationModal
            isOpen={!!editingApp}
            application={editingApp}
            onClose={() => setEditingApp(null)}
            onSave={handleSaveEdit}
          />
        )}
      </ErrorBoundary>
    </div>
  );
}

export default Members;
