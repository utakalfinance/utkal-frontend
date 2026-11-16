import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { getFinancialReportsApi, getInvestorsApi } from '../../../services/investorService';

export function InvestorReportsSection() {
  const [reportType, setReportType] = useState('investor-ledger');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [investorId, setInvestorId] = useState('All');
  const [investors, setInvestors] = useState([]);

  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getInvestorsApi({ limit: 100 })
      .then((res) => setInvestors(res.investors || []))
      .catch((err) => console.warn('Could not load investors for reports:', err));
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getFinancialReportsApi({
        type: reportType,
        startDate,
        endDate,
        investorId: investorId !== 'All' ? investorId : undefined,
      });
      setReportData(res.data || []);
    } catch (err) {
      console.error('Failed to generate report:', err);
      setError(err.message || 'Unable to generate financial report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const reportTypes = [
    { id: 'investor-ledger', name: '1. Investor-wise Financial Ledger' },
    { id: 'investment-collection', name: '2. Overall & Investor Collection Report' },
    { id: 'payouts', name: '3. Payout & Refund History Report' },
    { id: 'maturity-tracking', name: '4. Maturity Tracking Report' },
    { id: 'outstanding-liability', name: '5. Outstanding Contractual Liabilities Report' },
    { id: 'kyc-verification', name: '6. KYC Verification Report' },
    { id: 'date-wise', name: '7. Date-wise Transaction History Report' },
  ];

  // Export to CSV
  const handleExportCSV = () => {
    if (!reportData.length) {
      alert('No data available to export.');
      return;
    }
    const keys = Object.keys(reportData[0]).filter((k) => k !== '_id' && k !== '__v');
    const headerRow = keys.join(',');
    const rows = reportData.map((row) =>
      keys
        .map((k) => {
          let val = row[k];
          if (typeof val === 'object' && val !== null) {
            val = val.fullName || val.planName || JSON.stringify(val);
          }
          return `"${String(val ?? '').replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headerRow, ...rows].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `Report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print / Save to PDF
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Statutory Financial & Operational Reports
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate date-range audit statements and export records in standardized CSV and PDF formats.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={fetchReport}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Generate Report</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={reportData.length === 0}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrintPDF}
              disabled={reportData.length === 0}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
            >
              {reportTypes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Filter by Investor</label>
            <select
              value={investorId}
              onChange={(e) => setInvestorId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none"
            >
              <option value="All">All Investors (Consolidated)</option>
              {investors.map((inv) => (
                <option key={inv.investorId} value={inv.investorId}>
                  {inv.investorId} - {inv.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Report Results Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden print:border-none print:shadow-none">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {reportTypes.find((r) => r.id === reportType)?.name} ({reportData.length} records)
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Generated: {new Date().toLocaleDateString('en-IN')}
          </span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-xs font-semibold">Compiling financial data records...</p>
            </div>
          ) : reportData.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              No records found for the selected parameters.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 text-slate-500 font-extrabold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  {Object.keys(reportData[0])
                    .filter((k) => k !== '_id' && k !== '__v')
                    .slice(0, 8)
                    .map((k) => (
                      <th key={k} className="py-3 px-4 capitalize">
                        {k.replace(/([A-Z])/g, ' $1')}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    {Object.keys(row)
                      .filter((k) => k !== '_id' && k !== '__v')
                      .slice(0, 8)
                      .map((k) => {
                        let val = row[k];
                        if (typeof val === 'object' && val !== null) {
                          val = val.fullName || val.planName || JSON.stringify(val);
                        }
                        if (typeof val === 'string' && val.includes('T') && !isNaN(Date.parse(val)) && val.length > 15) {
                          val = new Date(val).toLocaleDateString('en-IN');
                        }
                        if (typeof val === 'number' && (k.toLowerCase().includes('amount') || k.toLowerCase().includes('credit') || k.toLowerCase().includes('debit') || k.toLowerCase().includes('balance') || k.toLowerCase().includes('liability') || k.toLowerCase().includes('paid'))) {
                          val = `₹${Number(val).toLocaleString('en-IN')}`;
                        }
                        return (
                          <td key={k} className="py-3 px-4 whitespace-nowrap">
                            {val ?? '—'}
                          </td>
                        );
                      })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

