import { mockDelay } from './api';

export const MOCK_LOAN_PRODUCTS = [
  {
    id: 'personal-loan',
    title: 'Personal Loan',
    slug: 'personal-loan',
    category: 'Individual',
    icon: 'UserCheck',
    tagline: 'Quick financial support for urgent personal needs and unexpected expenses.',
    minAmount: 25000,
    maxAmount: 1500000,
    interestRateRange: '10.5% - 16.0% p.a.',
    minRate: 10.5,
    maxTenureMonths: 60,
    features: [
      'Minimal Documentation Required',
      'Fast 24-48 Hour Processing',
      'Flexible Repayment Tenure (12-60 months)',
      'No Collateral Needed',
    ],
    eligibility: [
      'Age between 21 and 60 years',
      'Minimum monthly income of ₹15,000',
      'Salaried or Self-Employed Individuals',
    ],
    popular: true,
  },
  {
    id: 'business-loan',
    title: 'Business Growth Loan',
    slug: 'business-loan',
    category: 'Commercial',
    icon: 'Briefcase',
    tagline: 'Empower your small or medium enterprise with tailored working capital.',
    minAmount: 100000,
    maxAmount: 5000000,
    interestRateRange: '11.0% - 18.0% p.a.',
    minRate: 11.0,
    maxTenureMonths: 84,
    features: [
      'Customized Repayment Schedules',
      'Higher Loan Amount Eligibility',
      'Equipment & Inventory Financing',
      'Working Capital Assistance',
    ],
    eligibility: [
      'Business operational for at least 2 years',
      'Valid GST & Business Registration',
      'Annual Turnover of ₹5 Lakhs+',
    ],
    popular: true,
  },
  {
    id: 'home-loan',
    title: 'Home & Property Loan',
    slug: 'home-loan',
    category: 'Property',
    icon: 'Home',
    tagline: 'Turn your dream of owning a home or renovating property into reality.',
    minAmount: 300000,
    maxAmount: 10000000,
    interestRateRange: '8.5% - 12.5% p.a.',
    minRate: 8.5,
    maxTenureMonths: 240,
    features: [
      'Longer Tenure up to 20 Years',
      'Competitive Low Rates',
      'Property Purchase & Home Construction',
      'Balance Transfer Available',
    ],
    eligibility: [
      'Salaried or Business Owners',
      'Clear Property Title Documents',
      'Age 21 to 65 years at maturity',
    ],
    popular: true,
  },
  {
    id: 'gold-loan',
    title: 'Gold Loan Assist',
    slug: 'gold-loan',
    category: 'Secured',
    icon: 'Coins',
    tagline: 'Instant cash against gold ornaments with maximum valuation and safe storage.',
    minAmount: 10000,
    maxAmount: 2500000,
    interestRateRange: '9.0% - 14.0% p.a.',
    minRate: 9.0,
    maxTenureMonths: 36,
    features: [
      'Same Day Quick Transfer',
      'Minimal Paperwork',
      'Safe Vault Storage',
      'Bullet Repayment Options',
    ],
    eligibility: [
      'Gold ornaments of 18-24 Karat purity',
      'Valid Govt Photo ID & Address Proof',
      'Age 18 years and above',
    ],
    popular: false,
  },
  {
    id: 'vehicle-loan',
    title: 'Vehicle & Auto Loan',
    slug: 'vehicle-loan',
    category: 'Vehicle',
    icon: 'Car',
    tagline: 'Drive your dream car or commercial vehicle with hassle-free financing.',
    minAmount: 50000,
    maxAmount: 3000000,
    interestRateRange: '9.5% - 15.0% p.a.',
    minRate: 9.5,
    maxTenureMonths: 84,
    features: [
      'Up to 85-90% On-Road Funding',
      'New & Used Vehicle Options',
      'Flexible Monthly EMIs',
      'Quick Verification',
    ],
    eligibility: [
      'Regular Income Proof',
      'Salaried/Self-Employed',
      'Driving License & ID Proof',
    ],
    popular: false,
  },
  {
    id: 'micro-finance',
    title: 'Micro Enterprise Loan',
    slug: 'micro-finance',
    category: 'Micro',
    icon: 'Sprout',
    tagline: 'Supporting rural entrepreneurs, artisans, and small traders to expand.',
    minAmount: 15000,
    maxAmount: 300000,
    interestRateRange: '12.0% - 17.0% p.a.',
    minRate: 12.0,
    maxTenureMonths: 36,
    features: [
      'Doorstep Consultation Support',
      'Flexible Repayment Cycles',
      'No Complex Balance Sheet Required',
      'Promoting Local Entrepreneurship',
    ],
    eligibility: [
      'Micro Business Activity',
      'Aadhaar & PAN Card',
      'Resident of Serviceable Area',
    ],
    popular: false,
  },
];

export const MOCK_TESTIMONIALS = [
  {
    id: 1,
    name: 'Rajesh Kumar Swain',
    role: 'Small Business Owner, Cuttack',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    comment: 'Utkal Finance helped me expand my hardware retail shop with a business loan within 3 days. The process was transparent and the staff were very supportive.',
    rating: 5,
    loanType: 'Business Growth Loan',
  },
  {
    id: 2,
    name: 'Priyanka Das',
    role: 'Software Engineer, Bhubaneswar',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    comment: 'The EMI calculator on the portal matched the exact offer I received. Very clear repayment schedule without hidden charges.',
    rating: 5,
    loanType: 'Home & Property Loan',
  },
  {
    id: 3,
    name: 'Amitabh Mohanty',
    role: 'Logistics Manager, Rourkela',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    comment: 'Extremely quick processing for personal loan. The online application took less than 5 minutes and guidance was provided every step of the way.',
    rating: 5,
    loanType: 'Personal Loan',
  },
];

export const MOCK_FAQS = [
  {
    question: 'What documents are required to apply for a loan?',
    answer: 'Standard documents include identity proof (Aadhaar/PAN card), address proof, latest 3-6 months bank statements, and salary slips or income tax returns for business applicants.',
  },
  {
    question: 'How long does the loan application process take?',
    answer: 'Once all documents are submitted, application review typically takes 24 to 48 business hours.',
  },
  {
    question: 'Can I calculate my EMI before applying?',
    answer: 'Yes! Use our interactive EMI Calculator on the website to choose your loan amount, expected interest rate, and tenure to check exact monthly payouts.',
  },
  {
    question: 'Are there any hidden fees or pre-payment charges?',
    answer: 'We maintain 100% transparency. All processing fees and foreclosure norms are detailed upfront in the loan offer documentation.',
  },
  {
    question: 'How do I check my loan application status?',
    answer: 'You can track status by logging into your user portal using your registered mobile number or email.',
  },
];

/**
 * Service functions ready to be connected to MongoDB API backend in future
 */
export async function getLoanProducts() {
  await mockDelay(300);
  return MOCK_LOAN_PRODUCTS;
}

export async function getLoanProductBySlug(slug) {
  await mockDelay(200);
  return MOCK_LOAN_PRODUCTS.find((p) => p.slug === slug) || null;
}

import { submitLoanEnquiryApi } from './loanEnquiryService';

export async function submitLoanApplication(applicationData) {
  try {
    const res = await submitLoanEnquiryApi(applicationData);
    return {
      success: true,
      applicationId: res.enquiryId,
      enquiryId: res.enquiryId,
      message: res.message,
      enquiry: res.enquiry,
    };
  } catch (err) {
    throw err;
  }
}
