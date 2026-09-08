import { PlanFeature } from '../types';

export const SUBSCRIPTION_PLANS = {
  basic: {
    id: 'basic',
    name: 'Basic Plan',
    tagline: 'Essential Coverage Advisory',
    priceMonthly: 9.99,
    priceAnnual: 99.0,
    features: [
      'Unlimited AI Coverage & Fee Checks',
      'Contract Clause Storage & Parser',
      'Voice AI Diagnostic Assistant',
      'Coverage Confidence Score & Gauges',
      'Basic Dispatch Fee vs Out-of-Pocket Risk Calculator',
      'Community Support',
    ],
  },
  premium: {
    id: 'premium',
    name: 'Premium Plan',
    tagline: 'Complete Warranty Defense & Home Vault',
    priceMonthly: 19.99,
    priceAnnual: 199.0,
    isPopular: true,
    features: [
      'Everything in Basic',
      'Advanced Claim Preparation Word-for-Word Scripts',
      'Denial Trap & Forbidden Keywords Auto-Detector',
      'Interactive Step-by-Step Diagnostic Follow-Up Flow',
      'Full Home Inventory Management & Appliance Vault',
      'Lifetime Repair & Maintenance History Tracking',
      'Priority 24/7 Homeowner Claims Officer Access',
      '15% Exclusive Discount on Local Contractor Network',
      'Multi-Policy Comparison & Upgrade ROI Estimator',
    ],
  },
};

export const PLAN_COMPARISON_TABLE: PlanFeature[] = [
  {
    name: 'AI Warranty Coverage Triages',
    basic: 'Unlimited',
    premium: 'Unlimited (Priority Speed)',
    description: 'Instant multimodal voice, photo, and text issue evaluation.',
  },
  {
    name: 'Grounded Contract Citations',
    basic: true,
    premium: true,
    description: 'Exact clauses from your active policy agreement.',
  },
  {
    name: 'Dispatch Fee vs Repair Calculator',
    basic: true,
    premium: true,
    description: 'Compares upfront $100-$125 trade call fee against DIY & out-of-pocket costs.',
  },
  {
    name: 'Word-for-Word Claim Phone Scripts',
    basic: 'Basic Script',
    premium: 'Advanced Bulletproof Scripts',
    description: 'Precise phrasing to prevent claims reps from invoking automatic denial traps.',
  },
  {
    name: 'Forbidden Phrases & Denial Trap Radar',
    basic: false,
    premium: true,
    description: 'Highlights words like "noise for months" that void your coverage.',
  },
  {
    name: 'Home Inventory & Appliance Vault',
    basic: 'Up to 2 Items',
    premium: 'Unlimited Items + Serial Photos',
    description: 'Centralized record of install dates, model numbers, and pre-audited coverage status.',
  },
  {
    name: 'Vetted Local Contractor Referral Network',
    basic: 'Standard Matching',
    premium: '15% Discount on Out-of-Pocket Repairs',
    description: 'Direct matches to licensed HVAC, plumbing, electrical, and appliance pros.',
  },
  {
    name: 'Technician Follow-Up Question Flow',
    basic: false,
    premium: true,
    description: 'Interactive diagnostic prompts that clarify root cause before submitting.',
  },
];
