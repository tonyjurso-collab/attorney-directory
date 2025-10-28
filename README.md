# Attorney Directory

A comprehensive legal services platform that connects clients with qualified attorneys through dynamic landing pages, AI-powered chatbots, and streamlined lead generation.

## 🚀 Features

- **Dynamic Landing Pages** - SEO-optimized pages for every practice area and location
- **AI-Powered Chatbot** - Intelligent conversation flow with lead capture
- **Attorney Search** - Advanced search with filtering and location-based results
- **Lead Generation** - Multi-step forms with validation and tracking
- **Real-time Tracking** - Jornaya LeadID and TrustedForm integration
- **Responsive Design** - Mobile-first approach with modern UI/UX

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI, Radix UI
- **Database**: Supabase (PostgreSQL)
- **Search**: Algolia
- **AI**: OpenAI GPT-4, Vercel AI SDK
- **Lead Management**: LeadProsper API
- **Tracking**: Jornaya LeadID, TrustedForm
- **Maps**: Google Places API

### Key Components
- Dynamic route structure (`/d/[state]/[category]`)
- AI chatbot with conversation management and session handling
- Attorney profiles with contact forms and avatar support
- Lead capture and submission system with queue processing
- Search functionality powered by Algolia
- Remote API client for chat functionality
- Session management with Redis and Supabase stores
- Comprehensive logging and error handling

## 📁 Project Structure

```
├── app/
│   ├── d/[state]/[category]/          # Dynamic landing pages
│   ├── api/
│   │   ├── chat/                      # Chat API endpoints
│   │   ├── search-attorneys/          # Attorney search
│   │   └── lead-capture/              # Lead submission
│   └── attorney/[id]/                 # Attorney profile pages
├── components/
│   ├── landing/                       # Landing page components
│   ├── chat/                         # Chatbot components
│   ├── attorney/                     # Attorney-related components
│   └── search/                      # Search components
├── lib/
│   ├── chat/                         # Chat logic and AI integration
│   ├── algolia/                      # Search configuration
│   ├── supabase/                     # Database client
│   └── utils/                        # Utility functions
└── public/
    └── practice_areas_config.json    # Practice area configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key
- Algolia account
- LeadProsper account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/attorney-directory.git
   cd attorney-directory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🔧 Configuration

### Environment Variables

Create `.env.local` with the following variables:

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI
OPENAI_API_KEY=your_openai_api_key

# Search
NEXT_PUBLIC_ALGOLIA_APP_ID=your_algolia_app_id
ALGOLIA_ADMIN_API_KEY=your_algolia_admin_key
ALGOLIA_SEARCH_API_KEY=your_algolia_search_key

# Lead Management
LEADPROSPER_API_KEY=your_leadprosper_key
LEADPROSPER_SUPPLIER_ID=your_supplier_id

# Tracking
NEXT_PUBLIC_JORNAYA_CAMPAIGN_ID=your_jornaya_campaign_id
NEXT_PUBLIC_TRUSTEDFORM_FIELD=xxTrustedFormCertUrl

# Google Places
GOOGLE_PLACES_API_KEY=your_google_places_key
```

### Practice Areas

The `practice_areas_config.json` file defines:
- Practice area names and descriptions
- Required fields for each area
- Chat flow configuration
- LeadProsper campaign settings

**Valid Categories**:
- `personal-injury`, `family-law`, `criminal-defense`
- `business-law`, `real-estate-law`, `estate-planning`
- `immigration-law`, `employment-law`, `bankruptcy-law`
- `dui-law`, `workers-compensation`, `medical-malpractice`
- `product-liability`, `premises-liability`, `wrongful-death`

## 📖 Documentation

- **[Development Guide](DEVELOPMENT_GUIDE.md)** - Comprehensive development documentation
- **[API Documentation](API_DOCUMENTATION.md)** - Complete API reference
- **[Testing Guide](TESTING_GUIDE.md)** - Testing strategies and test cases
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[Setup Guide](SETUP_GUIDE.md)** - Initial setup and configuration instructions
- **[Production Deployment](PRODUCTION_DEPLOYMENT.md)** - Production deployment details
- **[Chat Architecture](docs/CHAT_ARCHITECTURE.md)** - Chat system architecture documentation
- **[Chat Runbook](docs/CHAT_RUNBOOK.md)** - Chat system operations and troubleshooting
- **[Test Results](TEST_RESULTS.md)** - Comprehensive test results and analysis
- **[Integration Complete](INTEGRATION_COMPLETE.md)** - Integration completion summary
- **[Product Requirements](PRD.md)** - Product requirements and specifications

## 🧪 Testing

### Test Pages
- `/test-chatbot` - Chatbot functionality testing
- `/test-chatbot-suite` - Comprehensive chatbot testing
- `/test-dynamic-form` - Form testing
- `/test-search` - Search functionality testing

### Test Scripts
```bash
# Test practice area field requirements
node test-category-fields.js

# Test field validation logic
node test-required-fields.js

# Test session reset functionality
node test-reset.js

# Test chat flow
node scripts/test-chat-flow.js

# Test infrastructure
node scripts/test-infrastructure.js

# Windows-specific chatbot testing
.\test-chatbot.ps1
```

### Running Tests
```bash
# Run all tests (Jest)
npm run test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Test chat flow directly
npm run test:chat-flow
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker
```bash
# Build Docker image
docker build -t attorney-directory .

# Run container
docker run -p 3000:3000 --env-file .env.production attorney-directory
```

### Traditional Server
```bash
# Build for production
npm run build

# Start with PM2
pm2 start npm --name "attorney-directory" -- start
```

## 🔍 API Reference

### Chat API
```typescript
POST /api/chat
{
  "message": "I need help with a divorce"
}
```

### Search API
```typescript
POST /api/search-attorneys
{
  "practice_area": "Personal Injury",
  "state": "NC",
  "category": "personal-injury"
}
```

### Lead Capture API
```typescript
POST /api/lead-capture
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "(555) 123-4567",
  "zip_code": "12345",
  "describe": "I need legal help",
  "main_category": "personal_injury_law",
  "sub_category": "car_accident",
  "has_attorney": "no"
}
```

## 🎯 Key Features

### Dynamic Landing Pages
- URL structure: `/d/[state]/[category]`
- Example: `/d/nc/personal-injury`
- SEO-optimized content
- Mobile-responsive design

### AI Chatbot
- Natural conversation flow
- Practice area detection
- Field extraction and validation
- Lead capture with tracking
- TCPA compliance

### Attorney Search
- Advanced filtering
- Location-based results
- Practice area specialization
- Detailed profiles

### Lead Generation
- Multi-step forms
- Field validation
- Lead scoring
- CRM integration
- Tracking and attribution

## 📊 Performance

### Metrics
- Page load time: < 3 seconds
- API response time: < 500ms
- Uptime: 99.9%
- Mobile performance score: > 90

### Monitoring
- Health check endpoint: `/api/health`
- Performance monitoring with PM2
- Error tracking and logging
- Automated backups

## 🔒 Security

### Security Features
- SSL/TLS encryption
- GDPR compliance
- TCPA compliance
- Data protection and privacy
- Secure API endpoints
- Rate limiting
- Input validation

### Best Practices
- Regular security audits
- Dependency updates
- Environment variable protection
- CORS configuration
- Error handling

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make changes with descriptive commits
4. Test thoroughly
5. Create a pull request

### Code Style
- Use TypeScript for all new code
- Follow React 19 best practices
- Use Tailwind CSS for styling
- Implement proper error handling
- Add comprehensive comments

### Testing
- Write tests for new features
- Maintain test coverage
- Use test pages for manual testing
- Follow testing best practices

## 📈 Roadmap

### Short-term (3-6 months)
- Advanced search filters
- Attorney video profiles
- Client review system
- Mobile app development

### Medium-term (6-12 months)
- AI-powered case evaluation
- Document generation tools
- Payment processing integration
- Multi-language support

### Long-term (12+ months)
- Virtual consultations
- Legal document templates
- Case management integration
- International expansion

## 🐛 Troubleshooting

### Common Issues
1. **Chatbot not responding**: Check OpenAI API key and session management
2. **Search not working**: Verify Algolia configuration and index setup
3. **Lead submission failing**: Check LeadProsper API credentials and field mapping
4. **Tracking not working**: Verify Jornaya and TrustedForm script loading

### Debug Tools
- Use test pages for isolated testing
- Check browser console for JavaScript errors
- Monitor API responses in Network tab
- Use Supabase dashboard for database queries

### Support
- Check documentation first
- Review existing test pages
- Check API endpoints and responses
- Consult troubleshooting guides
- Create detailed issue reports

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for AI capabilities
- Supabase for database services
- Algolia for search functionality
- LeadProsper for lead management
- Vercel for deployment platform

## 📞 Support

For questions or support:
- **Development Team**: dev-team@company.com
- **DevOps Team**: devops@company.com
- **Emergency Contact**: +1-555-0123

---

**Built with ❤️ for the legal community**