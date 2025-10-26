# Admin Dashboard

A comprehensive admin dashboard for managing the Attorney Directory platform with full CRUD operations and state management.

## 🚀 Features

### Dashboard Overview
- **Real-time Statistics** - Total attorneys, leads, practice areas, and users
- **Quick Actions** - One-click access to common admin tasks
- **Recent Activity** - Live feed of platform activity
- **System Status** - Health monitoring for all integrations

### Attorney Management
- **Full CRUD Operations** - Create, read, update, delete attorneys
- **Advanced Filtering** - Search by name, firm, location, membership tier
- **Bulk Actions** - Manage multiple attorneys at once
- **Profile Management** - Complete attorney profile editing
- **Verification Status** - Toggle attorney verification status

### Practice Area Management
- **Practice Area CRUD** - Manage all practice areas
- **Slug Management** - Auto-generate SEO-friendly URLs
- **Status Toggle** - Activate/deactivate practice areas
- **Usage Tracking** - See which practice areas are assigned to attorneys

### Lead Management
- **Lead Overview** - View all leads with detailed information
- **Status Management** - Update lead status (new, contacted, qualified, converted, closed)
- **Assignment Tracking** - See which attorney is assigned to each lead
- **Source Analytics** - Track lead sources (website, chatbot, referral)

### User Management
- **User Administration** - Manage all platform users
- **Role Management** - Toggle between attorney and admin roles
- **Profile Management** - Edit user profiles and information
- **Account Status** - Activate/deactivate user accounts

### System Settings
- **Platform Configuration** - Site name, description, contact info
- **Feature Toggles** - Enable/disable platform features
- **API Configuration** - Manage external service integrations
- **System Monitoring** - Health status of all services

## 🔐 Authentication & Authorization

### Admin Access
- **Role-based Access Control** - Only users with `admin` role can access
- **Secure Authentication** - Integrated with Supabase Auth
- **Session Management** - Automatic logout on session expiry

### Security Features
- **API Protection** - All admin endpoints require authentication
- **Role Validation** - Server-side role checking on every request
- **Audit Logging** - Track all admin actions (coming soon)

## 📁 File Structure

```
app/
├── admin/
│   └── page.tsx                 # Main admin dashboard page
├── api/
│   └── admin/
│       ├── attorneys/
│       │   ├── route.ts         # GET, POST attorneys
│       │   └── [id]/
│       │       └── route.ts     # GET, PUT, DELETE attorney by ID
│       ├── practice-areas/
│       │   ├── route.ts         # GET, POST practice areas
│       │   └── [id]/
│       │       └── route.ts     # GET, PUT, DELETE practice area by ID
│       ├── leads/
│       │   ├── route.ts         # GET leads
│       │   └── [id]/
│       │       └── route.ts     # PUT, DELETE lead by ID
│       ├── users/
│       │   ├── route.ts         # GET, POST users
│       │   └── [id]/
│       │       └── route.ts     # PUT, DELETE user by ID
│       ├── stats/
│       │   └── route.ts         # GET dashboard statistics
│       └── settings/
│           └── route.ts         # GET, PUT system settings

components/
└── admin/
    ├── AdminDashboard.tsx      # Main dashboard component
    ├── AdminHeader.tsx         # Dashboard header
    ├── AdminNavigation.tsx     # Tab navigation
    ├── AdminStats.tsx         # Statistics overview
    ├── AttorneyManagement.tsx  # Attorney CRUD interface
    ├── PracticeAreaManagement.tsx # Practice area CRUD interface
    ├── LeadManagement.tsx      # Lead management interface
    ├── UserManagement.tsx      # User management interface
    └── AdminSettings.tsx      # System settings interface

lib/
└── utils/
    └── admin-auth.ts           # Admin authentication helper

scripts/
└── create-admin-user.js        # Development script to create admin user
```

## 🛠️ Setup Instructions

### 1. Create Admin User

Run the admin user creation script:

```bash
node scripts/create-admin-user.js
```

This will create an admin profile in the database. You'll then need to:
1. Create a Supabase auth user with the same email
2. Link the auth user to the admin profile

### 2. Access Admin Dashboard

1. Log in with your admin credentials
2. Navigate to `/admin` or click "Admin Dashboard" in the navigation
3. The dashboard will load with all management interfaces

### 3. Environment Variables

Ensure these environment variables are set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🎯 Usage Guide

### Managing Attorneys
1. **View Attorneys**: See all attorneys with filtering options
2. **Add Attorney**: Click "Add New Attorney" to create a new profile
3. **Edit Attorney**: Click "Edit" on any attorney row
4. **Delete Attorney**: Click "Delete" (with confirmation)
5. **Filter**: Use search and tier filters to find specific attorneys

### Managing Practice Areas
1. **View Practice Areas**: See all practice areas with status
2. **Add Practice Area**: Create new practice areas with auto-generated slugs
3. **Toggle Status**: Click status badges to activate/deactivate
4. **Edit Details**: Modify name, description, and slug
5. **Delete**: Remove unused practice areas (with safety checks)

### Managing Leads
1. **View Leads**: See all leads with client and attorney information
2. **Update Status**: Use dropdown to change lead status
3. **Filter**: Search by client name, attorney, or source
4. **Delete**: Remove leads (with confirmation)

### Managing Users
1. **View Users**: See all platform users with roles
2. **Toggle Roles**: Switch between attorney and admin roles
3. **Edit Profiles**: Modify user information
4. **Delete Users**: Remove user accounts (with safety checks)

### System Settings
1. **General Settings**: Configure site name, description, contact info
2. **Feature Toggles**: Enable/disable platform features
3. **API Keys**: Manage external service configurations
4. **System Status**: Monitor service health

## 🔧 API Endpoints

### Attorneys
- `GET /api/admin/attorneys` - List all attorneys
- `POST /api/admin/attorneys` - Create new attorney
- `GET /api/admin/attorneys/[id]` - Get attorney by ID
- `PUT /api/admin/attorneys/[id]` - Update attorney
- `DELETE /api/admin/attorneys/[id]` - Delete attorney

### Practice Areas
- `GET /api/admin/practice-areas` - List all practice areas
- `POST /api/admin/practice-areas` - Create new practice area
- `GET /api/admin/practice-areas/[id]` - Get practice area by ID
- `PUT /api/admin/practice-areas/[id]` - Update practice area
- `DELETE /api/admin/practice-areas/[id]` - Delete practice area

### Leads
- `GET /api/admin/leads` - List all leads
- `PUT /api/admin/leads/[id]` - Update lead
- `DELETE /api/admin/leads/[id]` - Delete lead

### Users
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

### Statistics
- `GET /api/admin/stats` - Get dashboard statistics

### Settings
- `GET /api/admin/settings` - Get system settings
- `PUT /api/admin/settings` - Update system settings

## 🚨 Security Considerations

### Authentication
- All admin endpoints require valid authentication
- Role-based access control enforced server-side
- Session management with automatic expiry

### Data Protection
- Input validation on all forms
- SQL injection protection via Supabase
- XSS protection through React's built-in escaping

### Access Control
- Admin role required for all operations
- Self-deletion prevention for admin users
- Cascade deletion protection for related data

## 🔄 State Management

The admin dashboard uses React's built-in state management with:
- **Local State**: Component-level state for forms and UI
- **Server State**: Real-time data fetching from API endpoints
- **Optimistic Updates**: Immediate UI updates with server sync
- **Error Handling**: Comprehensive error states and user feedback

## 🎨 UI/UX Features

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interface

### User Experience
- Loading states and skeletons
- Confirmation dialogs for destructive actions
- Toast notifications for feedback
- Keyboard navigation support

### Accessibility
- ARIA labels and roles
- Keyboard navigation
- Screen reader compatibility
- High contrast support

## 🚀 Future Enhancements

### Planned Features
- **Audit Logging**: Track all admin actions
- **Bulk Operations**: Multi-select and bulk actions
- **Advanced Analytics**: Detailed reporting and insights
- **Export Functionality**: CSV/PDF export capabilities
- **Real-time Notifications**: Live updates for system events
- **Advanced Search**: Full-text search across all entities
- **Role Permissions**: Granular permission system
- **Backup Management**: Automated backup and restore

### Integration Opportunities
- **Email Notifications**: Admin alerts and summaries
- **Slack Integration**: System alerts and notifications
- **Analytics Integration**: Google Analytics and custom metrics
- **Monitoring Tools**: Integration with monitoring services

## 🐛 Troubleshooting

### Common Issues

**Admin Dashboard Not Loading**
- Check if user has admin role in database
- Verify authentication status
- Check browser console for errors

**API Errors**
- Verify environment variables are set
- Check Supabase connection
- Review server logs for detailed errors

**Permission Denied**
- Ensure user profile has `role: 'admin'`
- Check if user is properly authenticated
- Verify API endpoint permissions

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
```

This will provide detailed error messages and API response logging.

## 📞 Support

For technical support or feature requests:
1. Check the troubleshooting section above
2. Review the API documentation
3. Check server logs for detailed error messages
4. Contact the development team

---

**Note**: This admin dashboard is designed for internal use only. Ensure proper security measures are in place before deploying to production.
