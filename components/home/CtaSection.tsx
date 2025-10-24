import Link from 'next/link';
import { ArrowRight, Users, Shield } from 'lucide-react';

export function CtaSection() {
  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6">
            Ready to Find Your Attorney?
          </h2>
          
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Get started today and connect with qualified legal professionals 
            who can help with your specific legal needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/search"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors duration-200"
            >
              Find an Attorney
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            
            <Link
              href="/attorney/join"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-lg font-medium rounded-lg text-white hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors duration-200"
            >
              Join as Attorney
              <Users className="ml-2 h-5 w-5" />
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Verified Attorneys
              </h3>
              <p className="text-blue-100">
                All attorneys are verified and licensed to practice law
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Expert Matching
              </h3>
              <p className="text-blue-100">
                Get matched with attorneys who specialize in your area of need
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <ArrowRight className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Easy Connection
              </h3>
              <p className="text-blue-100">
                Connect directly with attorneys through our secure platform
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
