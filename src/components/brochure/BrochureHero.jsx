import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Shield, 
  FileText, 
  Share2, 
  Printer, 
  Download, 
  CheckCircle2, 
  ShieldCheck,
  Building2,
  Lock,
  Award
} from 'lucide-react';
import brandLogo from '../../assets/image copy 7.png';
import udyamPdf from '../../assets/Print _ Udyam Registration Certificate.pdf';
import { StatutoryPdfModal } from '../common/StatutoryPdfModal';

export function BrochureHero() {
  const navigate = useNavigate();
  const [copyStatus, setCopyStatus] = useState(false);
  const [isStatutoryModalOpen, setIsStatutoryModalOpen] = useState(false);

  const handlePrint = () => {
    setIsStatutoryModalOpen(true);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'New Utkal Finance Brochure',
          text: 'Official Institutional Brochure & Statutory Dossier of New Utkal Finance Limited',
          url: window.location.href,
        });
      } catch (err) {
        console.log(err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopyStatus(true);
      setTimeout(() => setCopyStatus(false), 2500);
    }
  };

  const handleDownloadDoc = (doc) => {
    const docObj = typeof doc === 'object' ? doc : pdfDocs.find(d => d.full === doc || d.name === doc);
    
    if (docObj?.fileUrl || docObj?.full === 'Govt. e-PAN Card' || doc === 'Govt. e-PAN Card') {
      const element = document.createElement('a');
      element.href = docObj?.fileUrl || '/Newutkal_Finance_Govt_ePAN_Card.jpg';
      element.download = 'Newutkal_Finance_Govt_ePAN_Card.jpg';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      return;
    }

    if (docObj?.pdfUrl) {
      const element = document.createElement('a');
      element.href = docObj.pdfUrl;
      element.download = docObj.downloadName || docObj.pdfUrl.substring(docObj.pdfUrl.lastIndexOf('/') + 1);
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      return;
    }

    if (doc === 'Certificate of Incorporation' || docObj?.full === 'Certificate of Incorporation') {
      const element = document.createElement('a');
      element.href = '/Newutkal_Finance_Certificate_of_Incorporation.pdf';
      element.download = 'Newutkal_Finance_Certificate_of_Incorporation.pdf';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      return;
    }

    if (doc === 'MCA Name Reservation Letter' || docObj?.full === 'MCA Name Reservation Letter') {
      const element = document.createElement('a');
      element.href = '/Newutkal_Finance_MCA_Name_Approval.pdf';
      element.download = 'Newutkal_Finance_MCA_Name_Approval.pdf';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      return;
    }

    if (doc === 'Form INC-33 e-MOA' || docObj?.full === 'Form INC-33 e-MOA') {
      const element = document.createElement('a');
      element.href = '/Newutkal_Finance_Official_eMOA_INC33.pdf';
      element.download = 'Newutkal_Finance_Official_eMOA_INC33.pdf';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      return;
    }

    const element = document.createElement('a');
    const docName = docObj?.full || (typeof doc === 'string' ? doc : 'Document');
    const fileContent = `NEW UTKAL FINANCE LIMITED - OFFICIAL REGULATORY DOCUMENT: ${docName}\nCIN: U64199OD2026PLC054968\nPAN: AALCN97566\nGovt. of India Certified Nidhi Company\nRegistered Office: Utkal Tower, Plot no-N/5-172, Nayapalli, Bhubaneswar-751015, Odisha.`;
    const file = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${docName.replace(/\s+/g, '_')}_UtkalFinance.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const pdfDocs = [
    { id: 1, name: 'Certificate of Inc...', full: 'Certificate of Incorporation', pdfUrl: '/Newutkal_Finance_Certificate_of_Incorporation.pdf', downloadName: 'Newutkal_Finance_Certificate_of_Incorporation.pdf' },
    { id: 2, name: 'MSME Udyam Cert...', full: 'Govt. MSME Udyam Registration Certificate', pdfUrl: udyamPdf, downloadName: 'Newutkal_Finance_Govt_MSME_Udyam_Registration.pdf' },
    { id: 3, name: 'Govt. e-PAN Card', full: 'Govt. e-PAN Card', fileUrl: '/Newutkal_Finance_Govt_ePAN_Card.jpg' },
    { id: 4, name: 'MCA Name Rese...', full: 'MCA Name Reservation Letter', pdfUrl: '/Newutkal_Finance_MCA_Name_Approval.pdf', downloadName: 'Newutkal_Finance_MCA_Name_Approval.pdf' },
    { id: 5, name: 'Form INC-33 e-...', full: 'Form INC-33 e-MOA', pdfUrl: '/Newutkal_Finance_Official_eMOA_INC33.pdf', downloadName: 'Newutkal_Finance_Official_eMOA_INC33.pdf' },
    { id: 6, name: 'Form INC-34 e-...', full: 'Form INC-34 e-AOA', pdfUrl: '/Newutkal_Finance_Official_eAOA_INC34.pdf', downloadName: 'Newutkal_Finance_Official_eAOA_INC34.pdf' },
  ];

  return (
    <div className="w-full font-sans">
      {/* 1. TOP TOOLBAR / FULL-WIDTH EDGE-TO-EDGE STICKY NAVIGATION HEADER */}
      <div className="w-full bg-white border-b border-slate-200/90 sticky top-0 z-50 px-4 sm:px-8 py-2.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-colors border border-slate-300 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
            <span>Home</span>
          </button>

          <button
            onClick={() => navigate('/admin')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0B1528] hover:bg-slate-900 text-white text-xs font-bold transition-colors shadow-2xs"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Admin Command</span>
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('statutory-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors border border-slate-200/80"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Statutory Copies</span>
          </button>
        </div>

        {/* Center Status Indicator */}
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="font-bold text-slate-900">Official Institutional Brochure</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 font-normal">Newutkal Finance Limited</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 ml-auto md:ml-0">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors border border-slate-300 shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{copyStatus ? 'Link Copied!' : 'Share'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#004085] hover:bg-blue-900 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-blue-900/20 cursor-pointer"
            title="Open Statutory 2-Page Member Admission Form PDF"
          >
            <Printer className="w-3.5 h-3.5 text-white" />
            <span>PRINT / SAVE PDF</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 pt-4 sm:pt-6">

      {/* 2. CUSTOMER HANDOVER PROSPECTUS BANNER */}
      <div className="bg-[#00266B] border border-blue-900/60 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md relative overflow-hidden w-full">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3.5 text-center sm:text-left flex-col sm:flex-row z-10">
          <div className="w-11 h-11 rounded-xl bg-[#033B26]/90 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-white font-extrabold text-base sm:text-lg tracking-tight">
              Customer Handover Prospectus &amp; Statutory Dossier
            </h3>
            <p className="text-blue-100 text-xs sm:text-sm mt-0.5 font-normal leading-relaxed">
              Includes full certified zero-balance baseline, product matrices, and authentic Government of India PDF copies.
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="bg-[#00C853] hover:bg-emerald-500 text-slate-950 font-black text-xs px-5 py-2.5 rounded-full uppercase tracking-wider transition-all shadow-md shrink-0 z-10 flex items-center gap-2 cursor-pointer"
        >
          <span>EXPORT A4 PDF</span>
        </button>
      </div>

      {/* 3. OFFICIAL REGULATORY PDF DOWNLOADS BAR */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 shrink-0">
          <FileText className="w-4 h-4 text-blue-600" />
          <span>Official Regulatory PDF Downloads:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {pdfDocs.map((doc) => (
            <button
              key={doc.id}
              onClick={() => handleDownloadDoc(doc.full)}
              title={`Download ${doc.full}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold border border-slate-200 hover:border-blue-300 transition-colors cursor-pointer"
            >
              <span>{doc.name}</span>
              <Download className="w-3.5 h-3.5 text-slate-400" />
            </button>
          ))}
        </div>
      </div>

      {/* 4. MAIN INSTITUTIONAL CORPORATE PROSPECTUS CARD */}
      <div className="bg-[#051124] border border-slate-800 rounded-3xl p-6 sm:p-10 lg:p-12 text-white relative overflow-hidden shadow-2xl space-y-8 w-full">
        {/* Subtle Background Radial Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Branding Row */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-slate-800/80 pb-6 relative z-10">
          {/* Logo & Company Name */}
          <div className="flex items-center gap-3.5 bg-slate-900/80 border border-slate-700/80 rounded-2xl p-2.5 px-4">
            <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0">
              <img src={brandLogo} alt="New Utkal Finance Emblem" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1 text-sm sm:text-base font-black tracking-tight leading-none">
                <span className="text-white">NEW UTKAL</span>
                <span className="text-blue-400">FINANCE LTD.</span>
              </div>
              <span className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase mt-0.5 block">
                TRUST • GROWTH • PROSPERITY
              </span>
            </div>
          </div>

          {/* Center Govt. Badge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-400/50 text-emerald-400 font-extrabold text-[11px] uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              CERTIFIED BY GOVT. OF INDIA
            </span>
            <span className="text-slate-300 font-mono text-xs">
              CIN: <strong className="text-white">U64199OD2026PLC054968</strong> • PAN: <strong className="text-amber-400">AALCN97566</strong>
            </span>
          </div>

          {/* Right Prospectus Label */}
          <div className="text-left lg:text-right">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
              INSTITUTIONAL CORPORATE PROSPECTUS
            </span>
            <h4 className="text-xs sm:text-sm font-extrabold text-white">
              Official Handover &amp; Statutory Dossier
            </h4>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Bhubaneswar, Odisha • Certified Regulatory Copy
            </span>
          </div>
        </div>

        {/* Main Prospectus Headline */}
        <div className="space-y-4 max-w-3xl relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white">
            Pioneering Financial Security, Credit Mobility &amp; Wealth Creation in Odisha
          </h1>

          <p className="text-slate-300 text-sm sm:text-base lg:text-lg font-medium leading-relaxed">
            Newutkal Finance Limited is established as a statutory non-banking financial institution dedicated to sustainable retail credit, secured capital growth, transparent statutory deposits, and doorstep financial inclusion across Odisha.
          </p>
        </div>

        {/* BOTTOM STATS ROW INSIDE CARD */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80 relative z-10">
          {/* Card 1: STATUTORY STATUS */}
          <div className="bg-[#0B1A35]/90 border border-blue-900/60 rounded-2xl p-4 space-y-1 shadow-sm">
            <span className="text-[10px] font-extrabold text-blue-300 uppercase tracking-widest block">
              STATUTORY STATUS
            </span>
            <span className="text-base sm:text-lg font-black text-white block">
              Govt. Registered
            </span>
          </div>

          {/* Card 2: PERMANENT ACCOUNT NO. */}
          <div className="bg-[#0B1A35]/90 border border-blue-900/60 rounded-2xl p-4 space-y-1 shadow-sm">
            <span className="text-[10px] font-extrabold text-blue-300 uppercase tracking-widest block">
              PERMANENT ACCOUNT NO.
            </span>
            <span className="text-base sm:text-lg font-black text-amber-400 font-mono block">
              AALCN97566
            </span>
          </div>

          {/* Card 3: SLR LIQUIDITY */}
          <div className="bg-[#0B1A35]/90 border border-blue-900/60 rounded-2xl p-4 space-y-1 shadow-sm">
            <span className="text-[10px] font-extrabold text-blue-300 uppercase tracking-widest block">
              SLR LIQUIDITY
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-400 block">
              100% Compliant
            </span>
          </div>

          {/* Card 4: STATUTORY ANNEXURES */}
          <div className="bg-[#0B1A35]/90 border border-blue-900/60 rounded-2xl p-4 space-y-1 shadow-sm">
            <span className="text-[10px] font-extrabold text-blue-300 uppercase tracking-widest block">
              STATUTORY ANNEXURES
            </span>
            <span className="text-base sm:text-lg font-black text-white block">
              5 Certified Copies
            </span>
          </div>
        </div>
      </div>

      {/* Official Statutory 2-Page Member Admission Form PDF Modal */}
      <StatutoryPdfModal
        isOpen={isStatutoryModalOpen}
        onClose={() => setIsStatutoryModalOpen(false)}
      />
    </div>
  </div>
);
}

export default BrochureHero;
