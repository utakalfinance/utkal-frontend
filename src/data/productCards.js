import { PiggyBank, TrendingUp, CreditCard, Wallet } from 'lucide-react';
import savingsCardImg from '../assets/image copy 15.png';
import depositsCardImg from '../assets/image copy 16.png';
import loansCardImg from '../assets/image copy 17.png';
import insuranceCardImg from '../assets/image copy 21.png';

export const PRODUCT_CARDS = [
  {
    id: 'savings',
    title: 'Savings Account',
    description: 'Earn up to 7.50%* on your Savings Account and get interest credited quarterly.',
    icon: PiggyBank,
    topBadge: 'HIGH LIQUIDITY',
    ratePill: 'Up to 7.50%*',
    image: savingsCardImg,
    features: [
      'Zero Balance BSBDA Available',
      'Instant Digital Passbook',
      'Unlimited UPI & ATM Usage',
      'Quarterly Interest Payout',
    ],
    buttonText: 'Open Savings Account',
    buttonVariant: 'outline',
  },
  {
    id: 'deposits',
    title: 'Deposits (FD & RD)',
    description: 'Earn interest rates up to 8.25%* p.a. and 8.50%* p.a. for Senior Citizens.',
    icon: TrendingUp,
    topBadge: 'GUARANTEED RETURNS',
    ratePill: 'Up to 8.25%*',
    image: depositsCardImg,
    features: [
      'Safe DICGC Insurance Cover',
      'Compounded Quarterly Returns',
      'Tenures from 7 Days to 10 Yrs',
      'Tax Saver 80C Options',
    ],
    buttonText: 'Book Fixed Deposit',
    buttonVariant: 'outline',
  },
  {
    id: 'loans',
    title: 'Loans & Advances',
    description: 'Get Loan amount up to ₹10 Crores with flexible tenure up to 15 years.',
    icon: CreditCard,
    topBadge: 'QUICK APPROVAL',
    ratePill: 'From 8.4% p.a.',
    image: loansCardImg,
    features: [
      'Home Loan & Griha Sudhar',
      'MSME Working Capital',
      'Instant Gold Loan Valuation',
      'Minimal KYC Documentation',
    ],
    buttonText: 'Apply for Loan',
    buttonVariant: 'outline',
  },
  {
    id: 'insurance',
    title: 'Insurance & Investments',
    description: 'Turn your surplus funds into security for a better and confident tomorrow.',
    icon: Wallet,
    topBadge: 'FAMILY SECURITY',
    ratePill: 'Protection + Growth',
    image: insuranceCardImg,
    features: [
      'Family Term Life Insurance',
      'Cashless Health Hospitalisation',
      'Atal Pension Yojana (APY)',
      'Dedicated Advisory Desk',
    ],
    buttonText: 'Explore Coverage',
    buttonVariant: 'outline',
  },
];

export const productCards = PRODUCT_CARDS;
