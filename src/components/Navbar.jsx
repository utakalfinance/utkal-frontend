import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Bell,
  UserPlus,
  ChevronRight,
  ChevronDown,
  Landmark,
  Building2,
  ShieldCheck,
  Shield,
  User,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAdmin } from '../context/AdminContext';
import { useMemberAuth } from '../context/MemberAuthContext';
import brandLogo from '../assets/image copy 7.png';

export function Navbar({ onOpenApplyModal }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [desktopProductsOpen, setDesktopProductsOpen] = useState(false);
  const desktopDropdownRef = useRef(null);

  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { isAuthenticated: isAdmin } = useAdmin();
  const { isAuthenticated: isMember, memberUser } = useMemberAuth();

  // District Admin session state
  const [districtAdminUser, setDistrictAdminUser] = useState(() => {
    try {
      const token = localStorage.getItem('utkal_district_admin_token');
      const raw = localStorage.getItem('utkal_district_admin_user');
      if (token && raw) {
        const u = JSON.parse(raw);
        if (u?.role === 'district_admin') return u;
      }
    } catch {}
    return null;
  });

  useEffect(() => {
    const checkDistrictAdmin = () => {
      try {
        const token = localStorage.getItem('utkal_district_admin_token');
        const raw = localStorage.getItem('utkal_district_admin_user');
        if (token && raw) {
          const u = JSON.parse(raw);
          if (u?.role === 'district_admin') {
            setDistrictAdminUser(u);
            return;
          }
        }
      } catch {}
      setDistrictAdminUser(null);
    };

    checkDistrictAdmin();
    window.addEventListener('storage', checkDistrictAdmin);
    return () => window.removeEventListener('storage', checkDistrictAdmin);
  }, [location.pathname]);

  const productItems = [
    {
      name: 'Finance',
      path: '/finance',
      description: 'Deposits, Micro-credit & Savings',
      icon: Landmark,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      name: 'Real Estate',
      path: '/real-estate',
      description: 'Commercial & Property Investments',
      icon: Building2,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      name: 'Insurance',
      path: '/insurance',
      description: 'Life, Medical & Enterprise Cover',
      icon: ShieldCheck,
      color: 'text-emerald-600 bg-emerald-50',
    },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isProductsActive = productItems.some((item) => isActive(item.path));

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (desktopDropdownRef.current && !desktopDropdownRef.current.contains(event.target)) {
        setDesktopProductsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b border-slate-200/90 shadow-xs font-sans select-none">
      {/* Main Navbar Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Left: Brand Logo & Title */}
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group">
          <div className="relative">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white border border-slate-200/90 p-1 shadow-sm flex items-center justify-center overflow-hidden group-hover:shadow-md transition-shadow">
              <img 
                src={brandLogo} 
                alt="New Utkal Finance Emblem" 
                className="w-full h-full object-contain" 
              />
            </div>
            {/* Status Indicator Dot */}
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white absolute -top-0.5 -right-0.5" />
          </div>

          <div className="shrink-0">
            <div className="flex items-center gap-1 leading-none">
              <span className="text-sm sm:text-base xl:text-lg font-black text-slate-900 tracking-tight whitespace-nowrap">
                NEW UTKAL
              </span>
              <span className="text-sm sm:text-base xl:text-lg font-black text-blue-800 tracking-tight whitespace-nowrap">
                FINANCE LTD.
              </span>
            </div>
            <span className="text-[8px] sm:text-[9px] xl:text-[10px] font-extrabold text-slate-500 tracking-widest uppercase mt-0.5 block whitespace-nowrap">
              TRUST • GROWTH • PROSPERITY
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links (Visible on XL screens 1150px+) */}
        <nav className="hidden xl:flex items-center gap-4 xl:gap-6">
          <Link
            to="/about"
            className={`text-xs xl:text-sm font-bold transition-colors whitespace-nowrap ${
              isActive('/about') ? 'text-blue-700 font-extrabold' : 'text-slate-700 hover:text-blue-700'
            }`}
          >
            About Us
          </Link>

          <Link
            to="/loans"
            className={`text-xs xl:text-sm font-bold transition-colors whitespace-nowrap ${
              isActive('/loans') ? 'text-blue-700 font-extrabold' : 'text-slate-700 hover:text-blue-700'
            }`}
          >
            Loans
          </Link>

          <Link
            to="/register"
            className={`text-xs xl:text-sm font-bold transition-colors whitespace-nowrap ${
              isActive('/register') ? 'text-blue-700 font-extrabold' : 'text-slate-700 hover:text-blue-700'
            }`}
          >
            Become a Member
          </Link>

          <Link
            to="/brochure"
            className={`text-xs xl:text-sm font-bold transition-colors whitespace-nowrap ${
              isActive('/brochure') ? 'text-blue-700 font-extrabold' : 'text-slate-700 hover:text-blue-700'
            }`}
          >
            Brochure
          </Link>

          <Link
            to="/gallery"
            className={`text-xs xl:text-sm font-bold transition-colors whitespace-nowrap ${
              isActive('/gallery') ? 'text-blue-700 font-extrabold' : 'text-slate-700 hover:text-blue-700'
            }`}
          >
            Gallery
          </Link>

          {/* DESKTOP PRODUCTS DROPDOWN */}
          <div 
            className="relative" 
            ref={desktopDropdownRef}
            onMouseEnter={() => setDesktopProductsOpen(true)}
            onMouseLeave={() => setDesktopProductsOpen(false)}
          >
            <button
              type="button"
              onClick={() => setDesktopProductsOpen(!desktopProductsOpen)}
              className={`text-xs xl:text-sm font-bold transition-colors flex items-center gap-1 cursor-pointer py-1 whitespace-nowrap ${
                isProductsActive ? 'text-blue-700 font-extrabold' : 'text-slate-700 hover:text-blue-700'
              }`}
            >
              <span>Products</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${desktopProductsOpen ? 'rotate-180 text-blue-700' : 'text-slate-400'}`} />
            </button>

            {desktopProductsOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-64 bg-white rounded-2xl border border-slate-200/90 shadow-xl py-2 z-50 text-left animate-fade-in">
                <div className="px-3.5 pb-2 mb-1.5 border-b border-slate-100">
                  <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase block">
                    OUR FINANCIAL PRODUCTS
                  </span>
                </div>
                {productItems.map((prod) => {
                  const Icon = prod.icon;
                  const active = isActive(prod.path);
                  return (
                    <Link
                      key={prod.name}
                      to={prod.path}
                      onClick={() => setDesktopProductsOpen(false)}
                      className={`flex items-start gap-3 px-3.5 py-2.5 rounded-xl transition-all mx-1 group ${
                        active
                          ? 'bg-blue-50 text-blue-700 font-extrabold'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-blue-700'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 mt-0.5 transition-colors ${prod.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold leading-snug">{prod.name}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <span className="text-[10px] text-slate-500 font-normal block truncate mt-0.5">
                          {prod.description}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <Link
            to="/contact"
            className={`text-xs xl:text-sm font-bold transition-colors whitespace-nowrap ${
              isActive('/contact') ? 'text-blue-700 font-extrabold' : 'text-slate-700 hover:text-blue-700'
            }`}
          >
            Help &amp; Support
          </Link>
        </nav>

        {/* Right: Action Buttons */}
        <div className="hidden xl:flex items-center gap-2.5 xl:gap-3 shrink-0">
          {/* Auth Button: Admin when admin logged in, District Admin when district admin logged in, Member when member logged in, otherwise Login */}
          {isAdmin ? (
            <Link
              to="/admin-dashboard"
              className="text-xs xl:text-sm font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 px-3.5 py-2 rounded-xl transition-all border border-amber-300 shadow-xs whitespace-nowrap flex items-center gap-1.5 hover:shadow-sm"
              title="Super Admin Portal"
            >
              <Shield className="w-3.5 h-3.5 text-amber-600 fill-amber-500/20" />
              <span>Admin</span>
            </Link>
          ) : districtAdminUser ? (
            <Link
              to="/district-dashboard"
              className="text-xs xl:text-sm font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition-all border border-blue-300 shadow-xs whitespace-nowrap flex items-center gap-1.5 hover:shadow-sm"
              title={`District Admin: ${districtAdminUser.name || 'District Partner'} (${districtAdminUser.assignedDistrict || 'Circle'})`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>District</span>
            </Link>
          ) : isMember ? (
            <Link
              to="/member-dashboard"
              className="text-xs xl:text-sm font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition-all border border-blue-200 shadow-xs whitespace-nowrap flex items-center gap-1.5 hover:shadow-sm"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-blue-700" />
              <span>{memberUser?.name ? memberUser.name.split(' ')[0] : 'Member'}</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="text-xs xl:text-sm font-bold text-slate-700 hover:text-blue-700 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 rounded-xl transition-all border border-slate-200 shadow-xs whitespace-nowrap"
            >
              Login
            </Link>
          )}

          {/* Join Button */}
          <Link
            to="/register"
            className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs xl:text-sm px-3.5 py-2 xl:px-4.5 xl:py-2.5 rounded-xl shadow-md shadow-blue-700/20 transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <UserPlus className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
            <span>Join</span>
          </Link>
        </div>

        {/* Mobile / Tablet menu toggle (visible below XL breakpoint) */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="xl:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none cursor-pointer"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-xl animate-fade-in text-left">
          <nav className="flex flex-col gap-1">
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold ${
                isActive('/about') ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>About Us</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/loans"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold ${
                isActive('/loans') ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Loans</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold ${
                isActive('/register') ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Become a Member</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/brochure"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold ${
                isActive('/brochure') ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Brochure</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/gallery"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold ${
                isActive('/gallery') ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Gallery</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>

            {/* MOBILE PRODUCTS ACCORDION */}
            <div>
              <button
                type="button"
                onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                  isProductsActive || mobileProductsOpen
                    ? 'bg-blue-50/80 text-blue-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Products</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                    mobileProductsOpen ? 'rotate-180 text-blue-700' : ''
                  }`}
                />
              </button>

              {/* Accordion Submenu Items with Icons */}
              {mobileProductsOpen && (
                <div className="ml-3 mt-1 pl-3 border-l-2 border-blue-200 space-y-1.5 py-1">
                  {productItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setMobileProductsOpen(false);
                        }}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                          active
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={active ? 'text-white' : 'text-blue-500 font-extrabold text-sm'}>›</span>
                          <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-blue-600'}`} />
                          <span>{item.name}</span>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-slate-400'}`} />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold ${
                isActive('/contact') ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Help &amp; Support</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            {isAdmin ? (
              <Link
                to="/admin-dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors border border-amber-300 shadow-xs"
              >
                <Shield className="w-4 h-4 text-amber-600 fill-amber-500/20" />
                <span>Admin Portal</span>
              </Link>
            ) : districtAdminUser ? (
              <Link
                to="/district-dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors border border-blue-300 shadow-xs"
              >
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>District Portal</span>
              </Link>
            ) : isMember ? (
              <Link
                to="/member-dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors border border-blue-200 shadow-xs"
              >
                <LayoutDashboard className="w-4 h-4 text-blue-700" />
                <span>{memberUser?.name ? `${memberUser.name} (Member Portal)` : 'Member'}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors border border-slate-200"
              >
                <span>Login</span>
              </Link>
            )}

            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Join Utkal Finance</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;

