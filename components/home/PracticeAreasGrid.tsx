import Link from 'next/link';
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
  Car 
} from 'lucide-react';

const practiceAreas = [
  {
    id: 'personal-injury',
    name: 'Personal Injury',
    description: 'Accidents, injuries, and compensation claims',
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    href: '/search?practice_area=personal injury law',
  },
  {
    id: 'family-law',
    name: 'Family Law',
    description: 'Divorce, custody, and family matters',
    icon: Scale,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    href: '/search?practice_area=family law',
  },
  {
    id: 'criminal-defense',
    name: 'Criminal Defense',
    description: 'Defense against criminal charges',
    icon: Shield,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    href: '/search?practice_area=criminal law',
  },
  {
    id: 'business-law',
    name: 'Business Law',
    description: 'Corporate and business legal services',
    icon: Building2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    href: '/search?practice_area=business law',
  },
  {
    id: 'real-estate-law',
    name: 'Real Estate Law',
    description: 'Property transactions and disputes',
    icon: Home,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    href: '/search?practice_area=real estate law',
  },
  {
    id: 'estate-planning',
    name: 'Estate Planning',
    description: 'Wills, trusts, and estate administration',
    icon: FileText,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    href: '/search?practice_area=estate planning',
  },
  {
    id: 'immigration-law',
    name: 'Immigration Law',
    description: 'Immigration and naturalization services',
    icon: Globe,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    href: '/search?practice_area=immigration law',
  },
  {
    id: 'employment-law',
    name: 'Employment Law',
    description: 'Workplace disputes and employment issues',
    icon: Briefcase,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    href: '/search?practice_area=employment law',
  },
  {
    id: 'bankruptcy',
    name: 'Bankruptcy',
    description: 'Debt relief and bankruptcy proceedings',
    icon: CreditCard,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    href: '/search?practice_area=bankruptcy',
  },
  {
    id: 'dui-defense',
    name: 'DUI/DWI Defense',
    description: 'Driving under the influence defense',
    icon: Car,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    href: '/search?practice_area=dui defense',
  },
];

export function PracticeAreasGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {practiceAreas.map((area) => {
        const IconComponent = area.icon;
        
        return (
          <Link
            key={area.id}
            href={area.href}
            className="group relative bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200"
          >
            <div className="flex flex-col items-center text-center">
              <div className={`${area.bgColor} rounded-full p-3 mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <IconComponent className={`h-6 w-6 ${area.color}`} />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                {area.name}
              </h3>
              
              <p className="text-sm text-gray-600 leading-relaxed">
                {area.description}
              </p>
            </div>
            
            {/* Hover effect overlay */}
            <div className="absolute inset-0 rounded-lg bg-blue-50 opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
          </Link>
        );
      })}
    </div>
  );
}
