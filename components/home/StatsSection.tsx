import { Users, Search, Star, Award } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: '500+',
    label: 'Qualified Attorneys',
    description: 'Verified legal professionals across all practice areas',
  },
  {
    icon: Search,
    value: '10,000+',
    label: 'Successful Matches',
    description: 'Clients connected with the right attorney for their needs',
  },
  {
    icon: Star,
    value: '4.8',
    label: 'Average Rating',
    description: 'Based on client reviews and feedback',
  },
  {
    icon: Award,
    value: '50+',
    label: 'Practice Areas',
    description: 'Comprehensive coverage of legal specialties',
  },
];

export function StatsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Trusted by Thousands
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Join the growing community of clients and attorneys
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            
            return (
              <div
                key={index}
                className="text-center group"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors duration-200">
                    <IconComponent className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                
                <div className="text-lg font-semibold text-gray-700 mb-2">
                  {stat.label}
                </div>
                
                <div className="text-sm text-gray-600">
                  {stat.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
