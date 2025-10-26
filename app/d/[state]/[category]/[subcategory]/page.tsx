import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { PracticeAreaLandingPage } from '@/components/landing/PracticeAreaLandingPage';

interface SubcategoryPageProps {
  params: Promise<{
    state: string;
    category: string;
    subcategory: string;
  }>;
}

// Valid practice area categories
const VALID_CATEGORIES = [
  'personal-injury',
  'family-law', 
  'criminal-defense',
  'business-law',
  'real-estate-law',
  'estate-planning',
  'immigration-law',
  'employment-law',
  'bankruptcy-law',
  'dui-law',
  'workers-compensation',
  'medical-malpractice',
  'product-liability',
  'premises-liability',
  'wrongful-death'
];

// Valid subcategories for each category
const VALID_SUBCATEGORIES: Record<string, string[]> = {
  'personal-injury': [
    'car-accident',
    'motorcycle-accident',
    'truck-accident',
    'slip-and-fall',
    'medical-malpractice',
    'product-liability',
    'wrongful-death',
    'workers-compensation'
  ],
  'family-law': [
    'divorce',
    'child-custody',
    'child-support',
    'adoption',
    'domestic-violence',
    'prenuptial-agreement',
    'alimony'
  ],
  'criminal-defense': [
    'dui',
    'drug-charges',
    'theft',
    'assault',
    'domestic-violence',
    'white-collar-crime',
    'traffic-violations'
  ],
  'business-law': [
    'contract-disputes',
    'business-formation',
    'employment-law',
    'intellectual-property',
    'commercial-litigation',
    'mergers-acquisitions'
  ],
  'real-estate-law': [
    'property-disputes',
    'real-estate-transactions',
    'landlord-tenant',
    'zoning',
    'construction-defects',
    'foreclosure'
  ],
  'estate-planning': [
    'wills',
    'trusts',
    'probate',
    'power-of-attorney',
    'estate-administration',
    'elder-law'
  ],
  'immigration-law': [
    'visa-applications',
    'green-cards',
    'citizenship',
    'deportation-defense',
    'asylum',
    'work-permits'
  ],
  'employment-law': [
    'discrimination',
    'wrongful-termination',
    'wage-disputes',
    'sexual-harassment',
    'overtime-pay',
    'employment-contracts'
  ],
  'bankruptcy-law': [
    'chapter-7',
    'chapter-13',
    'chapter-11',
    'debt-relief',
    'foreclosure-defense',
    'credit-repair'
  ],
  'dui-law': [
    'first-offense',
    'repeat-offense',
    'felony-dui',
    'license-suspension',
    'ignition-interlock',
    'field-sobriety-test'
  ]
};

// Valid state abbreviations
const VALID_STATES = [
  'al', 'ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga',
  'hi', 'id', 'il', 'in', 'ia', 'ks', 'ky', 'la', 'me', 'md',
  'ma', 'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj',
  'nm', 'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc',
  'sd', 'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 'wi', 'wy',
  'dc'
];

export async function generateMetadata({ params }: SubcategoryPageProps): Promise<Metadata> {
  const { state, category, subcategory } = await params;
  
  const categoryName = category.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  const subcategoryName = subcategory.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  const stateName = state.toUpperCase();
  
  return {
    title: `${subcategoryName} Attorneys in ${stateName} | ${categoryName} Lawyers`,
    description: `Find experienced ${subcategoryName.toLowerCase()} attorneys in ${stateName}. Specialized ${categoryName.toLowerCase()} lawyers ready to help with your case.`,
    keywords: `${subcategoryName.toLowerCase()}, ${categoryName.toLowerCase()}, attorney, lawyer, ${stateName}, legal help, consultation`,
  };
}

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const { state, category, subcategory } = await params;
  
  // Validate state, category, and subcategory
  if (!VALID_STATES.includes(state.toLowerCase()) || 
      !VALID_CATEGORIES.includes(category) ||
      !VALID_SUBCATEGORIES[category]?.includes(subcategory)) {
    notFound();
  }
  
  // Transform names to readable format
  const categoryName = category.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  const subcategoryName = subcategory.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  const stateName = state.toUpperCase();
  
  return (
    <PracticeAreaLandingPage 
      practiceArea={`${subcategoryName} (${categoryName})`}
      state={stateName}
      category={category}
      subcategory={subcategory}
    />
  );
}

// Generate static params for common combinations
export async function generateStaticParams() {
  const commonCombinations = [
    // Personal Injury subcategories
    { state: 'ca', category: 'personal-injury', subcategory: 'car-accident' },
    { state: 'tx', category: 'personal-injury', subcategory: 'car-accident' },
    { state: 'fl', category: 'personal-injury', subcategory: 'car-accident' },
    { state: 'ny', category: 'personal-injury', subcategory: 'car-accident' },
    { state: 'nc', category: 'personal-injury', subcategory: 'car-accident' },
    
    // Family Law subcategories
    { state: 'ca', category: 'family-law', subcategory: 'divorce' },
    { state: 'tx', category: 'family-law', subcategory: 'divorce' },
    { state: 'fl', category: 'family-law', subcategory: 'divorce' },
    { state: 'ny', category: 'family-law', subcategory: 'divorce' },
    { state: 'nc', category: 'family-law', subcategory: 'divorce' },
    
    // Criminal Defense subcategories
    { state: 'ca', category: 'criminal-defense', subcategory: 'dui' },
    { state: 'tx', category: 'criminal-defense', subcategory: 'dui' },
    { state: 'fl', category: 'criminal-defense', subcategory: 'dui' },
    { state: 'ny', category: 'criminal-defense', subcategory: 'dui' },
    { state: 'nc', category: 'criminal-defense', subcategory: 'dui' },
  ];
  
  return commonCombinations;
}
