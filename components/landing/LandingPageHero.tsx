'use client';

interface LandingPageHeroProps {
  title: string;
  subtitle: string;
  state: string;
  category: string;
  subcategory?: string;
}

export function LandingPageHero({ title, subtitle, state, category, subcategory }: LandingPageHeroProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
          <p className="text-xl md:text-2xl mb-8">{subtitle}</p>
          
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-blue-200">
            <span>Home</span>
            <span>/</span>
            <span>{state}</span>
            <span>/</span>
            <span>{category}</span>
            {subcategory && (
              <>
                <span>/</span>
                <span>{subcategory}</span>
              </>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
