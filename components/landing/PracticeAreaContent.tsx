'use client';

interface PracticeAreaContentProps {
  practiceArea: string;
  state: string;
}

export function PracticeAreaContent({ practiceArea, state }: PracticeAreaContentProps) {
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

  const getContentSections = () => {
    const area = formatPracticeArea(practiceArea);
    const stateName = formatState(state);
    
    switch (practiceArea.toLowerCase()) {
      case 'personal injury':
        return {
          whyChoose: {
            title: 'Why Choose Our Personal Injury Attorneys',
            description: 'Our network of personal injury lawyers in ' + stateName + ' has a proven track record of securing maximum compensation for accident victims.',
            points: [
              'No fees unless we win your case',
              'Free initial consultation and case evaluation',
              'Experienced trial lawyers with courtroom success',
              '24/7 availability for urgent legal matters',
              'Proven track record of multi-million dollar settlements'
            ]
          },
          services: {
            title: 'Personal Injury Legal Services',
            items: [
              { name: 'Car Accidents', description: 'Representation for auto accident victims seeking compensation' },
              { name: 'Truck Accidents', description: 'Legal help for commercial vehicle accident cases' },
              { name: 'Motorcycle Accidents', description: 'Specialized representation for motorcycle crash victims' },
              { name: 'Slip and Fall', description: 'Premises liability cases for slip and fall injuries' },
              { name: 'Medical Malpractice', description: 'Legal action against negligent healthcare providers' },
              { name: 'Product Liability', description: 'Cases involving defective or dangerous products' }
            ]
          },
          process: {
            title: 'How Our Personal Injury Process Works',
            steps: [
              { step: '1', title: 'Free Consultation', description: 'We evaluate your case at no cost to you' },
              { step: '2', title: 'Investigation', description: 'Gather evidence and build your case' },
              { step: '3', title: 'Negotiation', description: 'Work to secure fair settlement with insurance' },
              { step: '4', title: 'Trial', description: 'Take your case to court if necessary' }
            ]
          }
        };
      case 'family law':
        return {
          whyChoose: {
            title: 'Why Choose Our Family Law Attorneys',
            description: 'Our compassionate family law attorneys in ' + stateName + ' understand the emotional challenges of family legal matters.',
            points: [
              'Compassionate approach to sensitive family matters',
              'Experienced in all aspects of family law',
              'Mediation and collaborative law options',
              'Child-focused custody arrangements',
              'Fair and equitable settlement negotiations'
            ]
          },
          services: {
            title: 'Family Law Services',
            items: [
              { name: 'Divorce', description: 'Complete divorce representation and settlement' },
              { name: 'Child Custody', description: 'Custody arrangements in the best interest of children' },
              { name: 'Child Support', description: 'Fair child support calculations and enforcement' },
              { name: 'Spousal Support', description: 'Alimony and spousal support negotiations' },
              { name: 'Adoption', description: 'Legal guidance through the adoption process' },
              { name: 'Domestic Violence', description: 'Protection orders and safety planning' }
            ]
          },
          process: {
            title: 'Our Family Law Process',
            steps: [
              { step: '1', title: 'Initial Consultation', description: 'Discuss your family law needs confidentially' },
              { step: '2', title: 'Case Strategy', description: 'Develop the best approach for your situation' },
              { step: '3', title: 'Negotiation', description: 'Work toward amicable resolution when possible' },
              { step: '4', title: 'Court Representation', description: 'Strong advocacy in family court when needed' }
            ]
          }
        };
      default:
        return {
          whyChoose: {
            title: `Why Choose Our ${area} Attorneys`,
            description: `Our network of ${area.toLowerCase()} attorneys in ${stateName} provides expert legal representation with personalized service.`,
            points: [
              'Experienced attorneys with proven track records',
              'Personalized attention to your case',
              'Free initial consultation',
              'Competitive fee structures',
              'Local knowledge and expertise'
            ]
          },
          services: {
            title: `${area} Legal Services`,
            items: [
              { name: 'Legal Consultation', description: 'Expert advice on your legal matter' },
              { name: 'Case Evaluation', description: 'Thorough analysis of your legal situation' },
              { name: 'Document Preparation', description: 'Professional legal document drafting' },
              { name: 'Court Representation', description: 'Strong advocacy in legal proceedings' },
              { name: 'Negotiation', description: 'Skilled negotiation for favorable outcomes' },
              { name: 'Legal Strategy', description: 'Comprehensive legal strategy development' }
            ]
          },
          process: {
            title: 'Our Legal Process',
            steps: [
              { step: '1', title: 'Free Consultation', description: 'Initial meeting to understand your needs' },
              { step: '2', title: 'Case Analysis', description: 'Thorough evaluation of your legal matter' },
              { step: '3', title: 'Strategy Development', description: 'Create the best legal approach' },
              { step: '4', title: 'Execution', description: 'Implement strategy for optimal results' }
            ]
          }
        };
    }
  };

  const content = getContentSections();

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Why Choose Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {content.whyChoose.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {content.whyChoose.description}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.whyChoose.points.map((point, index) => (
              <div key={index} className="flex items-start space-x-4 p-6 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-700 font-medium">{point}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Services Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {content.services.title}
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive legal services tailored to your needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.services.items.map((service, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {service.name}
                </h3>
                <p className="text-gray-600">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Process Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {content.process.title}
            </h2>
            <p className="text-xl text-gray-600">
              Simple, transparent process from consultation to resolution
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {content.process.steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 lg:p-12 text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Get Legal Help?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Don't wait to protect your rights. Our experienced attorneys are ready to help you with your legal matter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors duration-200">
              Get Free Consultation
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors duration-200">
              Call Now: (555) 123-4567
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
