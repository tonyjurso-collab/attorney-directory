import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { PracticeAreaLandingPage } from '@/components/landing/PracticeAreaLandingPage';

interface CategoryPageProps {
  params: Promise<{
    state: string;
    category: string;
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

// Valid state abbreviations
const VALID_STATES = [
  'al', 'ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga',
  'hi', 'id', 'il', 'in', 'ia', 'ks', 'ky', 'la', 'me', 'md',
  'ma', 'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj',
  'nm', 'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc',
  'sd', 'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 'wi', 'wy',
  'dc'
];

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { state, category } = await params;
  
  const categoryName = category.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  const stateName = state.toUpperCase();
  
  return {
    title: `${categoryName} Attorneys in ${stateName} | LegalHub`,
    description: `Find experienced ${categoryName.toLowerCase()} attorneys in ${stateName}. Get legal help for your case with our trusted network of lawyers.`,
    keywords: `${categoryName.toLowerCase()}, attorney, lawyer, ${stateName}, legal help, consultation`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { state, category } = await params;
  
  // Validate state and category
  if (!VALID_STATES.includes(state.toLowerCase()) || !VALID_CATEGORIES.includes(category)) {
    notFound();
  }
  
  // Transform category slug to readable name
  const categoryName = category.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  const stateName = state.toUpperCase();
  
  return (
    <PracticeAreaLandingPage 
      practiceArea={categoryName}
      state={stateName}
      category={category}
    />
  );
}

// Generate static params for common combinations
export async function generateStaticParams() {
  const commonCombinations = [
    // Personal Injury in major states
    { state: 'ca', category: 'personal-injury' },
    { state: 'tx', category: 'personal-injury' },
    { state: 'fl', category: 'personal-injury' },
    { state: 'ny', category: 'personal-injury' },
    { state: 'nc', category: 'personal-injury' },
    
    // Family Law in major states
    { state: 'ca', category: 'family-law' },
    { state: 'tx', category: 'family-law' },
    { state: 'fl', category: 'family-law' },
    { state: 'ny', category: 'family-law' },
    { state: 'nc', category: 'family-law' },
    
    // Criminal Defense in major states
    { state: 'ca', category: 'criminal-defense' },
    { state: 'tx', category: 'criminal-defense' },
    { state: 'fl', category: 'criminal-defense' },
    { state: 'ny', category: 'criminal-defense' },
    { state: 'nc', category: 'criminal-defense' },
  ];
  
  return commonCombinations;
}
