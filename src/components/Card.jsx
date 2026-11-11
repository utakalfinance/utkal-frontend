import React from 'react';
import {
  UserCheck,
  Briefcase,
  Home,
  Coins,
  Car,
  Sprout,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Clock,
  Zap,
  Star,
} from 'lucide-react';
import { Button } from './Button';
import { formatCurrency, formatCompactCurrency } from '../utils/formatters';

const iconMap = {
  UserCheck,
  Briefcase,
  Home,
  Coins,
  Car,
  Sprout,
  ShieldCheck,
  Clock,
  Zap,
};

export function LoanCard({ loan, onApply }) {
  const IconComponent = iconMap[loan.icon] || UserCheck;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
      {loan.popular && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
          Popular Choice
        </div>
      )}

      <div>
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-xs">
          <IconComponent className="w-7 h-7" />
        </div>

        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
          {loan.category}
        </span>

        <h3 className="text-xl font-bold text-slate-900 mt-1 mb-2 group-hover:text-blue-600 transition-colors">
          {loan.title}
        </h3>

        <p className="text-slate-600 text-sm leading-relaxed mb-6">
          {loan.tagline}
        </p>

        <div className="bg-slate-50 rounded-xl p-4 mb-6 grid grid-cols-2 gap-3 border border-slate-100">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Interest Rate</span>
            <span className="text-sm font-bold text-slate-900">{loan.interestRateRange}</span>
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Max Loan</span>
            <span className="text-sm font-bold text-slate-900">{formatCompactCurrency(loan.maxAmount)}</span>
          </div>
        </div>

        <ul className="space-y-2.5 mb-6 text-sm text-slate-700">
          {loan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-2">
        <Button
          variant="primary"
          fullWidth
          icon={ArrowRight}
          iconPosition="right"
          onClick={() => onApply(loan)}
        >
          Apply for Loan
        </Button>
      </div>
    </div>
  );
}

export function FeatureCard({ icon: Icon, title, description, badge }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
        {badge && (
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md">
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

export function TestimonialCard({ testimonial }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-1 mb-4 text-amber-400">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-amber-400" />
          ))}
        </div>
        <p className="text-slate-700 text-sm leading-relaxed italic mb-6">
          "{testimonial.comment}"
        </p>
      </div>
      <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          className="w-11 h-11 rounded-full object-cover border-2 border-blue-100"
        />
        <div>
          <h4 className="text-sm font-bold text-slate-900">{testimonial.name}</h4>
          <p className="text-xs text-slate-500">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}
