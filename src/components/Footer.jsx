import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  PhoneCall, 
  Mail, 
  MapPin, 
  FileText, 
  Download, 
  ExternalLink, 
  Plus, 
  MessageCircle, 
  ShieldAlert
} from 'lucide-react';
import { StatutoryPdfModal } from './common/StatutoryPdfModal';
import { useMemberAuth } from '../context/MemberAuthContext';
import { useAdmin } from '../context/AdminContext';

export function Footer({ onOpenApplyModal }) {
  const [showDisclosures, setShowDisclosures] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const { isAuthenticated: isMember, memberUser } = useMemberAuth();
  const { isAuthenticated: isAdmin } = useAdmin();

  // Associate session check
  const isAssociate =
    isMember &&
    (memberUser?.role === 'associate' ||
      (() => {
        try {
          const raw = localStorage.getItem('utkal_member_user');
          const u = raw ? JSON.parse(raw) : null;
          return u?.role === 'associate';
        } catch {
          return false;
        }
      })());

  return (
    <footer className="bg-[#070D18] text-slate-300 font-sans border-t border-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Top Certification & Fast Action Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-6">
        <div className="bg-[#0B172E] border border-blue-900/40 rounded-2xl p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl">
          {/* Left Security Badge */}
          <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
            <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h3 className="text-white font-extrabold text-lg sm:text-xl tracking-tight">
                  Certified by Govt. of India
                </h3>
                <span className="bg-amber-400/10 border border-amber-400/50 text-amber-300 text-xs font-mono font-bold px-2.5 py-0.5 rounded tracking-wider">
                  U64199OD2026PLC054968
                </span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Bank-grade 256-bit encryption • 100% Insured • Working on the lines of Nidhi Company (2013 &amp; 2014 Rules)
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={onOpenApplyModal}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-600/30 tracking-wide uppercase flex items-center gap-2 cursor-pointer"
            >
              <span>Become a Member (₹200)</span>
            </button>
            
            <button
              type="button"
              onClick={() => setPdfModalOpen(true)}
              className="border border-slate-700 hover:border-slate-500 bg-slate-900/60 hover:bg-slate-800 text-slate-200 font-semibold text-xs sm:text-sm px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-blue-400" />
              <span>STATUTORY FORM (PDF)</span>
            </button>

            <Link
              to="/brochure"
              onClick={() => window.scrollTo(0, 0)}
              className="border border-slate-700 hover:border-slate-500 bg-slate-900/60 hover:bg-slate-800 text-slate-200 font-semibold text-xs sm:text-sm px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>CORPORATE BROCHURE</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 5-Column Navigation Links Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 text-xs sm:text-sm">
          {/* Column 1: PERSONAL BANKING */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4 pb-1 border-b border-slate-800/80">
              PERSONAL BANKING
            </h4>
            <ul className="space-y-2.5 text-slate-400">
              <li><Link to="/services" className="hover:text-blue-400 transition-colors">Standard Savings Account</Link></li>
              <li><Link to="/services" className="hover:text-blue-400 transition-colors">Premium Savings Account</Link></li>
              <li><Link to="/services" className="hover:text-blue-400 transition-colors">BSBDA Zero Balance Account</Link></li>
              <li><Link to="/services" className="hover:text-blue-400 transition-colors">Fixed Deposits (up to 8.25%*)</Link></li>
              <li><Link to="/services" className="hover:text-blue-400 transition-colors">Senior Citizen Special FD (8.50%)</Link></li>
              <li><Link to="/services" className="hover:text-blue-400 transition-colors">Recurring Deposits (RD)</Link></li>
              <li><Link to="/services" className="hover:text-blue-400 transition-colors">RuPay Debit Cards &amp; Offers</Link></li>
            </ul>
          </div>

          {/* Column 2: LOANS & ADVANCES */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4 pb-1 border-b border-slate-800/80">
              LOANS &amp; ADVANCES
            </h4>
            <ul className="space-y-2.5 text-slate-400">
              <li><Link to="/loans" className="hover:text-blue-400 transition-colors">Home Loan &amp; Griha Sudhar</Link></li>
              <li><Link to="/loans" className="hover:text-blue-400 transition-colors">MSME &amp; Business Loan</Link></li>
              <li><Link to="/loans" className="hover:text-blue-400 transition-colors">Gold Loan (Per Gram Rates)</Link></li>
              <li><Link to="/loans" className="hover:text-blue-400 transition-colors">Personal Emergency Loan</Link></li>
              <li><Link to="/loans" className="hover:text-blue-400 transition-colors">Loan Against Property (LAP)</Link></li>
              <li><Link to="/loans" className="hover:text-blue-400 transition-colors">Commercial Vehicle Financing</Link></li>
              <li><Link to="/loans" className="hover:text-blue-400 transition-colors">Small Enterprise Business Loans</Link></li>
            </ul>
          </div>

          {/* Column 3: WAYS TO BANK */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4 pb-1 border-b border-slate-800/80">
              WAYS TO BANK
            </h4>
            <ul className="space-y-2.5 text-slate-400">
              <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Online Membership Portal</Link></li>
              <li><Link to="/admin" className="hover:text-blue-400 transition-colors">Official Admin Console</Link></li>
              <li>
                <a href="https://wa.me/919776175240" target="_blank" rel="noreferrer" className="hover:text-blue-400 transition-colors inline-flex items-center gap-1">
                  WhatsApp Banking <ExternalLink className="w-3 h-3 text-emerald-400" />
                </a>
              </li>
              <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Branch &amp; Micro-ATM Network</Link></li>
              <li><Link to="/services" className="hover:text-blue-400 transition-colors">Bharat Connect Bill Pay</Link></li>
              <li><Link to="/services" className="hover:text-blue-400 transition-colors">Positive Pay Verification</Link></li>
              <li><Link to="/services" className="hover:text-blue-400 transition-colors">Auto NACH Debit Mandate</Link></li>
            </ul>
          </div>

          {/* Column 4: CALCULATORS & TOOLS */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4 pb-1 border-b border-slate-800/80">
              CALCULATORS &amp; TOOLS
            </h4>
            <ul className="space-y-2.5 text-slate-400">
              <li><a href="#calculator" className="hover:text-blue-400 transition-colors">Home Loan EMI Calculator</a></li>
              <li><a href="#calculator" className="hover:text-blue-400 transition-colors">Personal Loan Calculator</a></li>
              <li><a href="#calculator" className="hover:text-blue-400 transition-colors">Fixed Deposit (FD) Calculator</a></li>
              <li><a href="#calculator" className="hover:text-blue-400 transition-colors">Recurring Deposit (RD) Calculator</a></li>
              <li><a href="#calculator" className="hover:text-blue-400 transition-colors">Gold Loan Value Calculator</a></li>
              <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Branch &amp; ATM Hub Locator</Link></li>
            </ul>
          </div>

          {/* Column 5: ABOUT & GOVERNANCE */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4 pb-1 border-b border-slate-800/80">
              ABOUT &amp; GOVERNANCE
            </h4>
            <ul className="space-y-2.5 text-slate-400">
              <li><Link to="/about" className="hover:text-blue-400 transition-colors">About Utkal Finance Limited</Link></li>
              <li><Link to="/about" className="hover:text-blue-400 transition-colors">Board of Directors &amp; MD Desk</Link></li>
              <li><Link to="/about" className="hover:text-blue-400 transition-colors">Corporate Profile &amp; Handover</Link></li>
              <li><button type="button" onClick={() => setPdfModalOpen(true)} className="hover:text-blue-400 transition-colors cursor-pointer text-left">Download Statutory Forms</button></li>
              <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Grievance Redressal Officer</Link></li>
              <li>
                {isAssociate ? (
                  <Link to="/associate-dashboard" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
                    Associate Dashboard
                  </Link>
                ) : isMember ? (
                  <Link to="/member-dashboard" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
                    Member Dashboard
                  </Link>
                ) : (
                  <Link to="/login" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
                    Member Portal Login
                  </Link>
                )}
              </li>
              <li>
                {isAdmin ? (
                  <Link to="/admin-dashboard" className="text-amber-400 hover:text-amber-300 font-bold transition-colors">
                    Admin Governance Portal
                  </Link>
                ) : (
                  <Link to="/login" className="text-amber-400 hover:text-amber-300 font-bold transition-colors">
                    Admin Governance Login
                  </Link>
                )}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 4 Cards Section: Helplines & Corporate Contact Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 border-t border-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Registered Head Office */}
          <div className="bg-[#0B1528] border border-blue-900/30 rounded-xl p-4 flex items-start gap-3 shadow-md hover:border-blue-700/50 transition-all">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-white font-bold text-xs mb-1">Registered &amp; Head Office:</h5>
              <p className="text-slate-400 text-xs leading-relaxed">
                Utkal Tower, Plot no-N/5-172, Nayapalli, IRC village, Bhubaneswar-751015, Odisha
              </p>
            </div>
          </div>

          {/* Card 2: Tele-Banking & Helplines */}
          <div className="bg-[#0B1528] border border-blue-900/30 rounded-xl p-4 flex items-start gap-3 shadow-md hover:border-blue-700/50 transition-all">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-white font-bold text-xs mb-1">Tele-Banking &amp; Helplines:</h5>
              <p className="text-slate-400 text-xs leading-relaxed">
                Toll Free: <strong className="text-amber-400 font-extrabold">1800 123 9878</strong><br />
                Member Helpdesk: <strong className="text-slate-200">1800 200 1788</strong><br />
                Mobile Desk: <strong className="text-slate-200">+91 9776175240</strong>
              </p>
            </div>
          </div>

          {/* Card 3: Official Communications */}
          <div className="bg-[#0B1528] border border-blue-900/30 rounded-xl p-4 flex items-start gap-3 shadow-md hover:border-blue-700/50 transition-all">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-white font-bold text-xs mb-1">Official Communications:</h5>
              <p className="text-slate-400 text-xs leading-relaxed break-all">
                customercare@utkalfinance.com<br />
                bhagirathimohapatra79@gmail.com<br />
                <span className="text-slate-500 text-[10px]">Mon-Sat (9:30 AM to 6:30 PM)</span>
              </p>
            </div>
          </div>

          {/* Card 4: Customer Protection */}
          <div className="bg-[#0B1528] border border-blue-900/30 rounded-xl p-4 flex items-start gap-3 shadow-md hover:border-blue-700/50 transition-all">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-white font-bold text-xs mb-1">Customer Protection:</h5>
              <p className="text-slate-400 text-xs leading-relaxed mb-1">
                Complaints, compensation policy &amp; RBI Integrated Ombudsman mechanism.
              </p>
              <Link to="/contact" className="text-blue-400 hover:text-blue-300 font-semibold text-xs inline-flex items-center gap-0.5">
                Lodge Complaint &gt;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Regulatory Disclosures & Collapsible Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="bg-[#091122] border border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              REGULATORY DISCLOSURES &amp; STATUTORY INFORMATION
            </span>
          </div>
          <button 
            onClick={() => setShowDisclosures(!showDisclosures)}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            <span>{showDisclosures ? 'Hide Disclosures -' : 'View All Disclosures +'}</span>
          </button>
        </div>

        {showDisclosures && (
          <div className="bg-[#080E1A] border border-slate-800 rounded-xl p-4 mt-2 text-xs text-slate-400 space-y-2 animate-fadeIn">
            <p>
              <strong>Nidhi Company Disclosure:</strong> New Utkal Finance Limited operates strictly under Section 406 of the Companies Act, 2013 and Nidhi Rules 2014. Financial services are restricted exclusively to registered members.
            </p>
            <p>
              <strong>Fair Practice Code:</strong> We strictly adhere to transparent loan documentation, interest rate slabs, and non-coercive recovery mechanisms under standard regulatory practices.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Bar: Copyright & Tech Partner Credits */}
      <div className="bg-[#040810] border-t border-slate-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center md:text-left">
          <div className="space-y-1">
            <p className="text-slate-400">
              © {new Date().getFullYear()} New Utkal Finance Limited. All Rights Reserved. Reg. No.: <span className="text-slate-300 font-mono">U64199OD2026PLC054968</span>.
            </p>
            <p>
              Digital Ecosystem by{' '}
              <a 
                href="https://briskodetechnology.com/" 
                target="_blank" 
                rel="noreferrer" 
                className="text-emerald-400 font-bold hover:underline"
              >
                Briskode Technology Pvt. Ltd.
              </a>
            </p>
          </div>

          {/* Social Links & Netlify indicator */}
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-xs font-medium">Follow Us:</span>
            <div className="flex items-center gap-2">
              <a 
                href="https://wa.me/919776175240" 
                target="_blank" 
                rel="noreferrer" 
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 hover:border-emerald-500 hover:text-emerald-400 flex items-center justify-center transition-colors text-slate-400"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a 
                href="#facebook" 
                onClick={(e) => e.preventDefault()}
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 hover:border-blue-500 hover:text-blue-400 flex items-center justify-center transition-colors text-slate-400"
                title="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="#linkedin" 
                onClick={(e) => e.preventDefault()}
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 hover:border-blue-400 hover:text-blue-300 flex items-center justify-center transition-colors text-slate-400"
                title="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a 
                href="#youtube" 
                onClick={(e) => e.preventDefault()}
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 hover:border-red-500 hover:text-red-400 flex items-center justify-center transition-colors text-slate-400"
                title="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Statutory PDF Viewer Modal */}
      <StatutoryPdfModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
      />
    </footer>
  );
}

