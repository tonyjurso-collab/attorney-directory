'use client';

interface HeroSectionProps {
  practiceArea: string;
  state: string;
  category?: string;
  subcategory?: string;
}

export function HeroSection({ practiceArea, state, category, subcategory }: HeroSectionProps) {
  const formatPracticeArea = (area: string) => {
    return area.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const formatState = (stateCode: string) => {
    const stateNames: Record<string, string> = {
      'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
      'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
      'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
      'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
      'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
      'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
      'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
      'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
      'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
      'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
      'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
      'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
      'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'Washington D.C.'
    };
    
    return stateNames[stateCode] || stateCode;
  };

  const getHeroContent = () => {
    const area = formatPracticeArea(practiceArea);
    const stateName = formatState(state);
    
    // Customize content based on practice area
    switch (practiceArea.toLowerCase()) {
      case 'personal injury':
        return {
          title: `Personal Injury Lawyers in ${stateName}`,
          subtitle: 'Get the compensation you deserve after an accident',
          description: 'Experienced personal injury attorneys ready to fight for your rights. Free consultation, no fees unless we win.',
          ctaText: 'Get Free Legal Consultation',
          features: [
            'Free Case Evaluation',
            'No Fees Unless We Win',
            '24/7 Legal Support',
            'Experienced Trial Lawyers'
          ]
        };
      case 'family law':
        return {
          title: `Family Law Attorneys in ${stateName}`,
          subtitle: 'Navigate family legal matters with compassion and expertise',
          description: 'Skilled family law attorneys helping with divorce, custody, and other family matters. Get the support you need.',
          ctaText: 'Speak with a Family Lawyer',
          features: [
            'Divorce & Separation',
            'Child Custody Matters',
            'Spousal Support',
            'Compassionate Legal Care'
          ]
        };
      case 'criminal defense':
        return {
          title: `Criminal Defense Lawyers in ${stateName}`,
          subtitle: 'Protect your rights with aggressive criminal defense',
          description: 'Experienced criminal defense attorneys ready to defend your case. Available 24/7 for urgent matters.',
          ctaText: 'Get Criminal Defense Help',
          features: [
            '24/7 Emergency Defense',
            'Experienced Trial Lawyers',
            'Protect Your Rights',
            'Aggressive Representation'
          ]
        };
      case 'business law':
        return {
          title: `Business Lawyers in ${stateName}`,
          subtitle: 'Expert legal guidance for your business needs',
          description: 'Skilled business attorneys helping with contracts, disputes, and business formation. Protect your business interests.',
          ctaText: 'Get Business Legal Help',
          features: [
            'Contract Review',
            'Business Formation',
            'Dispute Resolution',
            'Commercial Litigation'
          ]
        };
      default:
        return {
          title: `${area} Attorneys in ${stateName}`,
          subtitle: 'Expert legal representation when you need it most',
          description: `Experienced ${area.toLowerCase()} attorneys ready to help with your legal needs. Get professional legal assistance today.`,
          ctaText: 'Get Legal Help Now',
          features: [
            'Expert Legal Advice',
            'Experienced Attorneys',
            'Free Consultation',
            '24/7 Support Available'
          ]
        };
    }
  };

  const content = getHeroContent();

  return (
    <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Main Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600/20 border border-blue-400/30 text-blue-100 text-sm font-medium">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Trusted Legal Network
            </div>

            {/* Main Title */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                {content.title}
              </h1>
              <p className="text-xl lg:text-2xl text-blue-100 font-medium">
                {content.subtitle}
              </p>
              <p className="text-lg text-blue-200 leading-relaxed max-w-2xl">
                {content.description}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {content.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-blue-100 font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                {content.ctaText}
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-900 transition-colors duration-200">
                View Attorney Profiles
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-8 pt-8 border-t border-blue-700/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-sm text-blue-200">Attorneys</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">50K+</div>
                <div className="text-sm text-blue-200">Cases Won</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-sm text-blue-200">Support</div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual/Form */}
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">Get Legal Help Now</h3>
                  <p className="text-blue-100">Speak with a qualified attorney in minutes</p>
                </div>
                
                {/* Quick Form */}
                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Your name" 
                    className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <input 
                    type="email" 
                    placeholder="Email address" 
                    className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <input 
                    type="tel" 
                    placeholder="Phone number" 
                    className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <textarea 
                    placeholder="Briefly describe your legal issue..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  />
                </div>
                
                <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl">
                  Get Free Legal Consultation
                </button>
                
                <p className="text-xs text-blue-200">
                  By submitting, you agree to our terms and privacy policy. 
                  We'll connect you with qualified attorneys.
                </p>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-green-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
