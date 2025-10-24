# Attorney Directory & Lead Generation Platform

A comprehensive web platform that connects clients with qualified attorneys through an advanced search system, lead generation, and subscription-based attorney memberships.

## 🚀 Features

### For Clients
- **Advanced Search**: Find attorneys by practice area, location, and membership tier
- **Geolocation**: Automatic location detection for local attorney discovery
- **Attorney Profiles**: Detailed profiles with practice areas, experience, and reviews
- **Lead Generation**: Contact forms that route leads to subscribed attorneys
- **Responsive Design**: Mobile-first design with modern UI/UX

### For Attorneys
- **Profile Management**: Create and manage detailed attorney profiles
- **Membership Tiers**: Free, Standard ($49/month), and Exclusive ($149/month) plans
- **Lead Delivery**: Direct lead routing through LeadProsper integration
- **Dashboard**: Comprehensive dashboard with stats, leads, and subscription management
- **Search Visibility**: Enhanced visibility based on membership tier

### For Administrators
- **User Management**: Role-based access control
- **Subscription Management**: Stripe integration for billing and webhooks
- **Lead Tracking**: Monitor lead generation and attorney performance

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Search**: Algolia
- **Lead Management**: LeadProsper API
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

Before running this project, you'll need:

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Supabase** account and project
4. **Stripe** account
5. **Algolia** account
6. **LeadProsper** account (optional for MVP)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd attorney-directory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Stripe Configuration
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   STRIPE_STANDARD_PRICE_ID=your_standard_price_id
   STRIPE_EXCLUSIVE_PRICE_ID=your_exclusive_price_id

   # Algolia Configuration
   NEXT_PUBLIC_ALGOLIA_APP_ID=your_algolia_app_id
   ALGOLIA_ADMIN_API_KEY=your_algolia_admin_api_key
   NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=your_algolia_search_api_key

   # LeadProsper Configuration
   LEADPROSPER_API_KEY=your_leadprosper_api_key
   LEADPROSPER_WEBHOOK_SECRET=your_leadprosper_webhook_secret

   # Next.js Configuration
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Set up the database**
   - Run the SQL schema from `lib/database/schema.sql` in your Supabase SQL editor
   - This will create all necessary tables, indexes, and RLS policies

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄 Database Schema

The application uses the following main tables:

- **profiles**: User profiles extending Supabase auth
- **attorneys**: Attorney information and membership details
- **practice_areas**: Legal practice area definitions
- **attorney_practice_areas**: Many-to-many relationship between attorneys and practice areas
- **leads**: Client leads and case information
- **reviews**: Client reviews and ratings

## 🔐 Authentication

The platform uses Supabase Auth with role-based access control:

- **Clients**: Can search for attorneys and submit leads
- **Attorneys**: Can manage profiles, view leads, and manage subscriptions
- **Admins**: Full system access

## 💳 Payment Integration

### Stripe Setup
1. Create Stripe products and prices for Standard and Exclusive plans
2. Set up webhook endpoints for subscription events
3. Configure customer portal for subscription management

### Membership Tiers
- **Free**: Basic profile listing, low search ranking
- **Standard ($49/month)**: Enhanced visibility, direct lead delivery
- **Exclusive ($149/month)**: Top search ranking, featured placement, profile video

## 🔍 Search Integration

### Algolia Setup
1. Create an Algolia application
2. Set up search indices for attorneys
3. Configure search filters and sorting
4. Implement real-time search updates

## 📊 Lead Management

### LeadProsper Integration
1. Set up LeadProsper API credentials
2. Configure lead routing rules
3. Implement lead status tracking

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set up environment variables in Vercel dashboard
3. Deploy and configure custom domains

### Database Setup
1. Set up production Supabase project
2. Run database migrations
3. Configure production environment variables

## 📱 API Routes

- `/api/stripe/checkout` - Create Stripe checkout sessions
- `/api/stripe/portal` - Create customer portal sessions
- `/api/stripe/webhook` - Handle Stripe webhooks
- `/api/leads` - Submit leads to LeadProsper

## 🧪 Testing

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Run build
npm run build
```

## 📈 Performance Optimization

- **Server Components**: Leverage React Server Components for better performance
- **Image Optimization**: Next.js Image component with WebP support
- **Caching**: Implement proper caching strategies
- **Code Splitting**: Automatic code splitting with Next.js

## 🔒 Security

- **Row Level Security**: Supabase RLS policies for data protection
- **Input Validation**: Zod schemas for form validation
- **Authentication**: Secure authentication with Supabase Auth
- **API Security**: Protected API routes with proper error handling

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0**: Initial MVP release with core functionality
- **v1.1.0**: Enhanced search and filtering
- **v1.2.0**: Advanced analytics and reporting
- **v1.3.0**: Mobile app integration

## 🎯 Roadmap

- [ ] Mobile application (React Native)
- [ ] Advanced analytics dashboard
- [ ] AI-powered attorney matching
- [ ] Video consultation integration
- [ ] Multi-language support
- [ ] Advanced reporting and analytics

---

Built with ❤️ using Next.js, Supabase, and modern web technologies.