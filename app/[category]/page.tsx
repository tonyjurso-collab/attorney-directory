import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { PracticeAreaOnlyLandingPage } from '@/components/landing/PracticeAreaOnlyLandingPage';

interface CategoryPageProps {
  params: Promise<{
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

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  
  const categoryName = category.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  return {
    title: `${categoryName} Attorneys | LegalHub`,
    description: `Find experienced ${categoryName.toLowerCase()} attorneys. Get legal help for your case with our trusted network of lawyers across all states.`,
    keywords: `${categoryName.toLowerCase()}, attorney, lawyer, legal help, consultation`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  
  // Validate category
  if (!VALID_CATEGORIES.includes(category)) {
    notFound();
  }
  
  // Transform category slug to readable name
  const categoryName = category.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  return (
    <PracticeAreaOnlyLandingPage 
      practiceArea={categoryName}
      category={category}
    />
  );
}

// Generate static params for all practice area categories
export async function generateStaticParams() {
  return VALID_CATEGORIES.map((category) => ({
    category,
  }));
}

