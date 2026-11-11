import React, { useState } from 'react';
import { useCalculator } from '../hooks/useCalculator';
import { formatCurrency } from '../utils/formatters';
import { Home, Briefcase, TrendingUp, Award, ArrowRight } from 'lucide-react';

export function EmiCalculator({ onApplyNow }) {
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'msme', 'deposit', 'gold'
  const [isSeniorCitizen, setIsSeniorCitizen] = useState(false);
  const [goldWeight, setGoldWeight] = useState(40);
  const [goldPurity, setGoldPurity] = useState('22'); // '22' or '24'

  // Presets for different tabs
  const tabConfigs = {
    home: {
      title: 'Home Loan',
      labelAmount: 'HOME LOAN AMOUNT',
      minAmount: 500000,
      maxAmount: 10000000,
      stepAmount: 100000,
      minAmountLabel: '₹5 Lakhs',
      midAmountLabel: '₹50 Lakhs',
      maxAmountLabel: '₹1 Crore',
      defaultAmount: 2500000,
      defaultRate: 8.75,
      minRate: 8.0,
      midRate: 11.5,
      maxRate: 15.0,
      defaultTenure: 180, // 15 years
      minTenure: 12,
      midTenure: 120,
      maxTenure: 240,
      minTenureLabel: '1 Year',
      midTenureLabel: '10 Years',
      maxTenureLabel: '20 Years',
    },
    msme: {
      title: 'MSME & Personal',
      labelAmount: 'LOAN AMOUNT',
      minAmount: 100000,
      maxAmount: 5000000,
      stepAmount: 50000,
      minAmountLabel: '₹1 Lakh',
      midAmountLabel: '₹25 Lakhs',
      maxAmountLabel: '₹50 Lakhs',
      defaultAmount: 1000000,
      defaultRate: 11.5,
      minRate: 9.5,
      midRate: 14.0,
      maxRate: 18.0,
      defaultTenure: 60,
      minTenure: 12,
      midTenure: 36,
      maxTenure: 84,
      minTenureLabel: '1 Year',
      midTenureLabel: '3 Years',
      maxTenureLabel: '7 Years',
    },
    deposit: {
      title: 'FD & RD Returns',
      labelAmount: 'DEPOSIT PRINCIPAL AMOUNT',
      minAmount: 10000,
      maxAmount: 2500000,
      stepAmount: 10000,
      minAmountLabel: '₹10,000',
      midAmountLabel: '₹12.5 Lakhs',
      maxAmountLabel: '₹25 Lakhs',
      defaultAmount: 300000,
      defaultRate: 8.25,
      minRate: 6.5,
      midRate: 7.5,
      maxRate: 8.5,
      defaultTenure: 36, // 3 yrs
      minTenure: 12,
      midTenure: 60,
      maxTenure: 120,
      minTenureLabel: '1 Year',
      midTenureLabel: '5 Years',
      maxTenureLabel: '10 Years',
    },
    gold: {
      title: 'Gold Loan',
      labelAmount: 'REQUIRED CASH AMOUNT',
      minAmount: 25000,
      maxAmount: 2500000,
      stepAmount: 25000,
      minAmountLabel: '₹25,000',
      midAmountLabel: '₹10 Lakhs',
      maxAmountLabel: '₹25 Lakhs',
      defaultAmount: 300000,
      defaultRate: 9.0,
      minRate: 8.5,
      midRate: 11.0,
      maxRate: 14.0,
      defaultTenure: 24,
      minTenure: 6,
      midTenure: 18,
      maxTenure: 36,
      minTenureLabel: '6 Months',
      midTenureLabel: '18 Months',
      maxTenureLabel: '36 Months',
    },
  };

  const config = tabConfigs[activeTab];

  const {
    amount,
    setAmount,
    rate,
    setRate,
    tenure,
    setTenure,
    emi,
    totalInterest,
    totalPayment,
  } = useCalculator(config.defaultAmount, config.defaultRate, config.defaultTenure);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    const newConfig = tabConfigs[tabKey];
    setAmount(newConfig.defaultAmount);
    setRate(newConfig.defaultRate);
    setTenure(newConfig.defaultTenure);
  };

  const tenureYears = Math.max(1, Math.round(tenure / 12));

  // FD Quarterly Compounding Calculation
  const effectiveFdRate = isSeniorCitizen ? 8.50 : 8.25;
  const quarterlyRate = effectiveFdRate / 400;
  const totalQuarters = tenureYears * 4;
  const fdMaturityValue = Math.round(amount * Math.pow(1 + quarterlyRate, totalQuarters));
  const fdInterestEarned = fdMaturityValue - amount;

  // Gold Loan Calculation
  const goldValuationRate = goldPurity === '22' ? 6250 : 6800;
  const totalGoldValuation = goldWeight * goldValuationRate;
  const goldEligibleLoan = Math.round(totalGoldValuation * 0.75);

  return (
    <div className="space-y-8">
      {/* 4 Tabs Switcher */}
      <div className="flex justify-center">
        <div className="bg-white rounded-full p-1.5 shadow-md border border-slate-200/90 inline-flex flex-wrap items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => handleTabChange('home')}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'home'
                ? 'bg-blue-800 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home Loan</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('msme')}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'msme'
                ? 'bg-blue-800 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>MSME &amp; Personal</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('deposit')}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'deposit'
                ? 'bg-blue-800 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>FD &amp; RD Returns</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('gold')}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === 'gold'
                ? 'bg-blue-800 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>Gold Loan</span>
          </button>
        </div>
      </div>

      {/* Main Calculator Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-10 max-w-5xl mx-auto">
        {activeTab === 'deposit' ? (
          /* FD & RD Calculator View matching Screenshot */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column: Sliders & Senior Citizen Toggle */}
            <div className="lg:col-span-7 space-y-7">
              {/* Deposit Principal Amount */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    DEPOSIT PRINCIPAL AMOUNT
                  </label>
                  <span className="text-xl font-black text-emerald-600 tracking-tight">
                    {formatCurrency(amount)}
                  </span>
                </div>
                <input
                  type="range"
                  min={10000}
                  max={2500000}
                  step={10000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-2 font-semibold">
                  <span>₹10,000</span>
                  <span>₹12.5 Lakhs</span>
                  <span>₹25 Lakhs</span>
                </div>
              </div>

              {/* Tenure (Years) */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    TENURE (YEARS)
                  </label>
                  <span className="text-xl font-black text-emerald-600 tracking-tight">
                    {tenureYears} {tenureYears === 1 ? 'Year' : 'Years'}
                  </span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={120}
                  step={12}
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-2 font-semibold">
                  <span>1 Year</span>
                  <span>5 Years</span>
                  <span>10 Years</span>
                </div>
              </div>

              {/* Senior Citizen Bonus Toggle Card */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4.5 flex items-center justify-between shadow-xs">
                <div>
                  <h5 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Senior Citizen Bonus (+0.25%)
                  </h5>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                    Applicable for investors 60 years and above
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isSeniorCitizen}
                  onChange={(e) => setIsSeniorCitizen(e.target.checked)}
                  className="w-5 h-5 accent-emerald-600 cursor-pointer rounded border-slate-300 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Right Column: Forest Green Result Card */}
            <div className="lg:col-span-5 bg-[#045031] text-white p-7 sm:p-8 rounded-3xl shadow-2xl flex flex-col justify-between h-full border border-emerald-800">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200/90 block mb-2">
                  MATURITY VALUE ({effectiveFdRate.toFixed(2)}% P.A.)
                </span>
                <div className="text-3xl sm:text-4xl font-black text-white mb-1 tracking-tight">
                  {formatCurrency(fdMaturityValue)}
                </div>
                <p className="text-xs text-emerald-200/80 mb-8 font-medium">
                  Compounded quarterly over {tenureYears} {tenureYears === 1 ? 'year' : 'years'}
                </p>

                <div className="space-y-4 pt-6 border-t border-emerald-700/60 text-xs sm:text-sm">
                  <div className="flex justify-between text-emerald-100 font-medium">
                    <span>Total Deposit</span>
                    <span className="font-extrabold text-white">{formatCurrency(amount)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-100 font-medium">
                    <span>Interest Earned</span>
                    <span className="font-black text-amber-400">{formatCurrency(fdInterestEarned)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => onApplyNow && onApplyNow(amount, tenure)}
                  className="w-full bg-white hover:bg-slate-100 text-[#045031] font-extrabold py-3.5 px-4 rounded-xl shadow-lg transition-all duration-200 text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <span>BOOK FIXED DEPOSIT</span>
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === 'gold' ? (
          /* Gold Loan Calculator View matching Screenshot */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column: Weight Slider & Purity Cards */}
            <div className="lg:col-span-7 space-y-7">
              {/* Gold Weight Slider */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    GOLD WEIGHT IN GRAMS (NET)
                  </label>
                  <span className="text-xl font-black text-amber-600 tracking-tight">
                    {goldWeight} Grams
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={250}
                  step={1}
                  value={goldWeight}
                  onChange={(e) => setGoldWeight(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-2 font-semibold">
                  <span>5 g</span>
                  <span>125 g</span>
                  <span>250 g</span>
                </div>
              </div>

              {/* Gold Purity Standard Cards */}
              <div>
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-2.5">
                  GOLD PURITY STANDARD
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => setGoldPurity('22')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      goldPurity === '22'
                        ? 'bg-amber-50/90 border-amber-400 shadow-sm'
                        : 'bg-white border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                      22 Karat (91.6%)
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 mt-1">
                      ₹6,250 / gram
                    </div>
                  </div>

                  <div
                    onClick={() => setGoldPurity('24')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      goldPurity === '24'
                        ? 'bg-amber-50/90 border-amber-400 shadow-sm'
                        : 'bg-white border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                      24 Karat (99.9%)
                    </div>
                    <div className="text-[11px] font-semibold text-slate-500 mt-1">
                      ₹6,800 / gram
                    </div>
                  </div>
                </div>
              </div>

              {/* Safe & Insured Vault Storage Card */}
              <div className="bg-amber-50/60 border border-amber-200/90 rounded-2xl p-4.5">
                <h5 className="text-xs sm:text-sm font-extrabold text-amber-900 mb-1">
                  Safe &amp; Insured Vault Storage
                </h5>
                <p className="text-[11px] text-amber-800/90 leading-relaxed font-medium">
                  Your gold jewellery is evaluated transparently and stored in high-security biometric bank vaults.
                </p>
              </div>
            </div>

            {/* Right Column: Warm Bronze Gold Result Card */}
            <div className="lg:col-span-5 bg-[#853406] text-white p-7 sm:p-8 rounded-3xl shadow-2xl flex flex-col justify-between h-full border border-amber-900">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-200/90 block mb-2">
                  ELIGIBLE LOAN AMOUNT (75% LTV)
                </span>
                <div className="text-3xl sm:text-4xl font-black text-amber-300 mb-1 tracking-tight">
                  {formatCurrency(goldEligibleLoan)}
                </div>
                <p className="text-xs text-amber-200/80 mb-8 font-medium">
                  Instant valuation on {goldWeight}g @ {goldPurity === '22' ? '22K' : '24K'}
                </p>

                <div className="space-y-4 pt-6 border-t border-amber-700/60 text-xs sm:text-sm">
                  <div className="flex justify-between text-amber-100 font-medium">
                    <span>Valuation Rate</span>
                    <span className="font-extrabold text-white">₹{goldValuationRate}/g</span>
                  </div>
                  <div className="flex justify-between text-amber-100 font-medium">
                    <span>Max Disbursal Time</span>
                    <span className="font-extrabold text-white">Under 30 Minutes</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => onApplyNow && onApplyNow()}
                  className="w-full bg-white hover:bg-slate-100 text-[#853406] font-extrabold py-3.5 px-4 rounded-xl shadow-lg transition-all duration-200 text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>APPLY FOR GOLD LOAN</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Standard Loan Calculator View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column: Loan Sliders */}
            <div className="lg:col-span-7 space-y-7">
              {/* Amount Slider */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {config.labelAmount}
                  </label>
                  <span className="text-lg font-extrabold text-blue-800 tracking-tight">
                    {formatCurrency(amount)}
                  </span>
                </div>
                <input
                  type="range"
                  min={config.minAmount}
                  max={config.maxAmount}
                  step={config.stepAmount}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1.5 font-medium">
                  <span>{config.minAmountLabel}</span>
                  <span>{config.midAmountLabel}</span>
                  <span>{config.maxAmountLabel}</span>
                </div>
              </div>

              {/* Tenure Slider */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    TENURE
                  </label>
                  <span className="text-lg font-extrabold text-blue-800 tracking-tight">
                    {tenureYears} {tenureYears === 1 ? 'Year' : 'Years'} ({tenure} Mos)
                  </span>
                </div>
                <input
                  type="range"
                  min={config.minTenure}
                  max={config.maxTenure}
                  step="6"
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1.5 font-medium">
                  <span>{config.minTenureLabel}</span>
                  <span>{config.midTenureLabel}</span>
                  <span>{config.maxTenureLabel}</span>
                </div>
              </div>

              {/* Interest Rate Slider */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    INTEREST RATE (% P.A.)
                  </label>
                  <span className="text-lg font-extrabold text-blue-800 tracking-tight">
                    {rate}%
                  </span>
                </div>
                <input
                  type="range"
                  min={config.minRate}
                  max={config.maxRate}
                  step="0.25"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1.5 font-medium">
                  <span>{config.minRate.toFixed(1)}%</span>
                  <span>{config.midRate.toFixed(1)}%</span>
                  <span>{config.maxRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Right Column: Dark Result Card */}
            <div className="lg:col-span-5 bg-[#0B1528] text-white p-7 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl flex flex-col justify-between h-full">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  CALCULATED MONTHLY EMI
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 mb-1 tracking-tight">
                  {formatCurrency(emi)}
                </div>
                <p className="text-xs text-slate-400 mb-6 font-medium">
                  Per month for {tenure} installments
                </p>

                <div className="space-y-3.5 pt-4 border-t border-slate-800 text-xs sm:text-sm">
                  <div className="flex justify-between text-slate-300">
                    <span>Principal Amount:</span>
                    <span className="font-bold text-white">{formatCurrency(amount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Total Interest:</span>
                    <span className="font-bold text-amber-400">{formatCurrency(totalInterest)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-slate-800 text-sm sm:text-base font-extrabold text-white">
                    <span>Total Amount Payable:</span>
                    <span className="text-emerald-400">{formatCurrency(totalPayment)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => onApplyNow && onApplyNow()}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg transition-all duration-200 text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>APPLY FOR THIS LOAN</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
