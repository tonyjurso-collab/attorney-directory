/**
 * Practice Areas configuration and utilities
 * Centralized practice area data with subcategories
 */

import { 
  Scale, 
  Heart, 
  Shield, 
  Building2, 
  Home, 
  FileText, 
  Globe, 
  Briefcase, 
  CreditCard, 
  Car,
  Pill,
  Package,
  AlertTriangle,
  Skull
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface PracticeArea {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  href: string;
  subcategories: string[];
}

export interface PracticeAreaSubcategory {
  slug: string;
  name: string;
}

export const PRACTICE_AREA_SUBCATEGORIES: Record<string, PracticeAreaSubcategory[]> = {
  'personal-injury': [
    { slug: 'car-accident', name: 'Car Accident' },
    { slug: 'motorcycle-accident', name: 'Motorcycle Accident' },
    { slug: 'truck-accident', name: 'Truck Accident' },
    { slug: 'slip-and-fall', name: 'Slip and Fall' },
    { slug: 'medical-malpractice', name: 'Medical Malpractice' },
    { slug: 'product-liability', name: 'Product Liability' },
    { slug: 'wrongful-death', name: 'Wrongful Death' },
    { slug: 'workers-compensation', name: 'Workers\' Compensation' }
  ],
  'family-law': [
    { slug: 'divorce', name: 'Divorce' },
    { slug: 'child-custody', name: 'Child Custody' },
    { slug: 'child-support', name: 'Child Support' },
    { slug: 'adoption', name: 'Adoption' },
    { slug: 'domestic-violence', name: 'Domestic Violence' },
    { slug: 'prenuptial-agreement', name: 'Prenuptial Agreement' },
    { slug: 'alimony', name: 'Alimony' }
  ],
  'criminal-defense': [
    { slug: 'dui', name: 'DUI' },
    { slug: 'drug-charges', name: 'Drug Charges' },
    { slug: 'theft', name: 'Theft' },
    { slug: 'assault', name: 'Assault' },
    { slug: 'domestic-violence', name: 'Domestic Violence' },
    { slug: 'white-collar-crime', name: 'White Collar Crime' },
    { slug: 'traffic-violations', name: 'Traffic Violations' }
  ],
  'business-law': [
    { slug: 'contract-disputes', name: 'Contract Disputes' },
    { slug: 'business-formation', name: 'Business Formation' },
    { slug: 'employment-law', name: 'Employment Law' },
    { slug: 'intellectual-property', name: 'Intellectual Property' },
    { slug: 'commercial-litigation', name: 'Commercial Litigation' },
    { slug: 'mergers-acquisitions', name: 'Mergers & Acquisitions' }
  ],
  'real-estate-law': [
    { slug: 'property-disputes', name: 'Property Disputes' },
    { slug: 'real-estate-transactions', name: 'Real Estate Transactions' },
    { slug: 'landlord-tenant', name: 'Landlord Tenant' },
    { slug: 'zoning', name: 'Zoning' },
    { slug: 'construction-defects', name: 'Construction Defects' },
    { slug: 'foreclosure', name: 'Foreclosure' }
  ],
  'estate-planning': [
    { slug: 'wills', name: 'Wills' },
    { slug: 'trusts', name: 'Trusts' },
    { slug: 'probate', name: 'Probate' },
    { slug: 'power-of-attorney', name: 'Power of Attorney' },
    { slug: 'estate-administration', name: 'Estate Administration' },
    { slug: 'elder-law', name: 'Elder Law' }
  ],
  'immigration-law': [
    { slug: 'visa-applications', name: 'Visa Applications' },
    { slug: 'green-cards', name: 'Green Cards' },
    { slug: 'citizenship', name: 'Citizenship' },
    { slug: 'deportation-defense', name: 'Deportation Defense' },
    { slug: 'asylum', name: 'Asylum' },
    { slug: 'work-permits', name: 'Work Permits' }
  ],
  'employment-law': [
    { slug: 'discrimination', name: 'Discrimination' },
    { slug: 'wrongful-termination', name: 'Wrongful Termination' },
    { slug: 'wage-disputes', name: 'Wage Disputes' },
    { slug: 'sexual-harassment', name: 'Sexual Harassment' },
    { slug: 'overtime-pay', name: 'Overtime Pay' },
    { slug: 'employment-contracts', name: 'Employment Contracts' }
  ],
  'bankruptcy-law': [
    { slug: 'chapter-7', name: 'Chapter 7' },
    { slug: 'chapter-13', name: 'Chapter 13' },
    { slug: 'chapter-11', name: 'Chapter 11' },
    { slug: 'debt-relief', name: 'Debt Relief' },
    { slug: 'foreclosure-defense', name: 'Foreclosure Defense' },
    { slug: 'credit-repair', name: 'Credit Repair' }
  ],
  'dui-law': [
    { slug: 'first-offense', name: 'First Offense' },
    { slug: 'repeat-offense', name: 'Repeat Offense' },
    { slug: 'felony-dui', name: 'Felony DUI' },
    { slug: 'license-suspension', name: 'License Suspension' },
    { slug: 'ignition-interlock', name: 'Ignition Interlock' },
    { slug: 'field-sobriety-test', name: 'Field Sobriety Test' }
  ],
  'workers-compensation': [
    { slug: 'workplace-injury', name: 'Workplace Injury' },
    { slug: 'occupational-disease', name: 'Occupational Disease' },
    { slug: 'permanent-disability', name: 'Permanent Disability' },
    { slug: 'return-to-work', name: 'Return to Work' },
    { slug: 'benefits-dispute', name: 'Benefits Dispute' }
  ],
  'medical-malpractice': [
    { slug: 'surgical-errors', name: 'Surgical Errors' },
    { slug: 'misdiagnosis', name: 'Misdiagnosis' },
    { slug: 'birth-injury', name: 'Birth Injury' },
    { slug: 'medication-errors', name: 'Medication Errors' },
    { slug: 'hospital-negligence', name: 'Hospital Negligence' }
  ],
  'product-liability': [
    { slug: 'defective-product', name: 'Defective Product' },
    { slug: 'dangerous-drugs', name: 'Dangerous Drugs' },
    { slug: 'consumer-safety', name: 'Consumer Safety' },
    { slug: 'manufacturing-defects', name: 'Manufacturing Defects' }
  ],
  'premises-liability': [
    { slug: 'slip-and-fall', name: 'Slip and Fall' },
    { slug: 'unsafe-property', name: 'Unsafe Property' },
    { slug: 'security-negligence', name: 'Security Negligence' },
    { slug: 'dog-bites', name: 'Dog Bites' }
  ],
  'wrongful-death': [
    { slug: 'car-accident-death', name: 'Car Accident Death' },
    { slug: 'medical-malpractice-death', name: 'Medical Malpractice Death' },
    { slug: 'workplace-fatalities', name: 'Workplace Fatalities' },
    { slug: 'product-liability-death', name: 'Product Liability Death' }
  ]
};

export const PRACTICE_AREAS: PracticeArea[] = [
  {
    id: 'personal-injury',
    name: 'Personal Injury',
    description: 'Accidents, injuries, and compensation claims',
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    href: '/search?practice_area=personal injury law',
    subcategories: PRACTICE_AREA_SUBCATEGORIES['personal-injury'].map(s => s.slug)
  },
  {
    id: 'family-law',
    name: 'Family Law',
    description: 'Divorce, custody, and family matters',
    icon: Scale,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    href: '/search?practice_area=family law',
    subcategories: PRACTICE_AREA_SUBCATEGORIES['family-law'].map(s => s.slug)
  },
  {
    id: 'criminal-defense',
    name: 'Criminal Defense',
    description: 'Defense against criminal charges',
    icon: Shield,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    href: '/search?practice_area=criminal law',
    subcategories: PRACTICE_AREA_SUBCATEGORIES['criminal-defense'].map(s => s.slug)
  },
  {
    id: 'business-law',
    name: 'Business Law',
    description: 'Corporate and business legal services',
    icon: Building2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    href: '/search?practice_area=business law',
    subcategories: PRACTICE_AREA_SUBCATEGORIES['business-law'].map(s => s.slug)
  },
  {
    id: 'real-estate-law',
    name: 'Real Estate Law',
    description: 'Property transactions and disputes',
    icon: Home,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    href: '/search?practice_area=real estate law',
    subcategories: PRACTICE_AREA_SUBCATEGORIES['real-estate-law'].map(s => s.slug)
  },
  {
    id: 'estate-planning',
    name: 'Estate Planning',
    description: 'Wills, trusts, and estate administration',
    icon: FileText,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    href: '/search?practice_area=estate planning',
    subcategories: PRACTICE_AREA_SUBCATEGORIES['estate-planning'].map(s => s.slug)
  },
  {
    id: 'immigration-law',
    name: 'Immigration Law',
    description: 'Immigration and naturalization services',
    icon: Globe,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    href: '/search?practice_area=immigration law',
    subcategories: PRACTICE_AREA_SUBCATEGORIES['immigration-law'].map(s => s.slug)
  },
  {
    id: 'employment-law',
    name: 'Employment Law',
    description: 'Workplace disputes and employment issues',
    icon: Briefcase,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    href: '/search?practice_area=employment law',
    subcategories: PRACTICE_AREA_SUBCATEGORIES['employment-law'].map(s => s.slug)
  },
  {
    id: 'bankruptcy-law',
    name: 'Bankruptcy',
    description: 'Debt relief and bankruptcy proceedings',
    icon: CreditCard,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    href: '/search?practice_area=bankruptcy',
    subcategories: PRACTICE_AREA_SUBCATEGORIES['bankruptcy-law'].map(s => s.slug)
  },
  {
    id: 'dui-law',
    name: 'DUI/DWI Defense',
    description: 'Driving under the influence defense',
    icon: Car,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    href: '/search?practice_area=dui defense',
    subcategories: PRACTICE_AREA_SUBCATEGORIES['dui-law'].map(s => s.slug)
  },
  {
    id: 'workers-compensation',
    name: 'Workers Compensation',
    description: 'Workplace injury compensation claims',
    icon: Pill,
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    href: '/search?practice_area=workers compensation',
    subcategories: PRACTICE_AREA_SUBCATEGORIES['workers-compensation'].map(s => s.slug)
  },
  {
    id: 'medical-malpractice',
    name: 'Medical Malpractice',
    description: 'Medical negligence and malpractice claims',
    icon: AlertTriangle,
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    href: '/search?practice_area=medical malpractice',
    subcategories: PRACTICE_AREA_SUBCATEGORIES['medical-malpractice'].map(s => s.slug)
  },
  {
    id: 'product-liability',
    name: 'Product Liability',
    description: 'Defective product injury claims',
    icon: Package,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    href: '/search?practice_area=product liability',
    subcategories: PRACTICE_AREA_SUBCATEGORIES['product-liability'].map(s => s.slug)
  },
  {
    id: 'premises-liability',
    name: 'Premises Liability',
    description: 'Injuries on unsafe properties',
    icon: Home,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    href: '/search?practice_area=premises liability',
    subcategories: PRACTICE_AREA_SUBCATEGORIES['premises-liability'].map(s => s.slug)
  },
  {
    id: 'wrongful-death',
    name: 'Wrongful Death',
    description: 'Fatality due to negligence',
    icon: Skull,
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    href: '/search?practice_area=wrongful death',
    subcategories: PRACTICE_AREA_SUBCATEGORIES['wrongful-death'].map(s => s.slug)
  }
];

/**
 * Get practice area configuration by ID
 */
export function getPracticeArea(id: string): PracticeArea | undefined {
  return PRACTICE_AREAS.find(area => area.id === id);
}

/**
 * Get subcategories for a practice area
 */
export function getSubcategories(practiceAreaId: string): PracticeAreaSubcategory[] {
  return PRACTICE_AREA_SUBCATEGORIES[practiceAreaId] || [];
}

/**
 * Format slug to readable name
 */
export function formatSlug(slug: string): string {
  return slug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

