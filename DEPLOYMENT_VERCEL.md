# Vercel Deployment Guide

Complete step-by-step guide for deploying the Attorney Directory application to Vercel using GitHub integration.

## Prerequisites

- ✅ Vercel account (you mentioned you already have one)
- ✅ GitHub repository access (already connected: `tonyjurso-collab/attorney-directory`)
- ✅ Environment variables ready (from your `.env.local` file)
- ✅ Node.js 18+ (for local testing)

## Step 1: Connect GitHub Repository to Vercel

### Option A: Import Existing Repository

1. **Log in to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your account

2. **Import Project**
   - Click **"Add New..."** → **"Project"**
   - Or go to your dashboard and click **"Import Project"**

3. **Select Repository**
   - If not already connected, click **"Connect Git Provider"** and authorize Vercel to access your GitHub
   - Search for `attorney-directory` or `tonyjurso-collab/attorney-directory`
   - Click **"Import"** on your repository

### Option B: Connect Existing Project

If you already have a Vercel project:

1. Go to your project settings
2. Navigate to **Settings** → **Git**
3. Connect your GitHub repository if not already connected

## Step 2: Configure Project Settings

1. **Project Name**
   - Vercel will auto-detect the name from your repository
   - You can change it if needed (e.g., `attorney-directory`)

2. **Framework Preset**
   - Vercel should auto-detect **Next.js**
   - Verify it shows "Next.js" as the framework

3. **Root Directory**
   - Leave as `.` (root) unless your project is in a subdirectory
   - Your project is at the root, so no changes needed

4. **Build and Output Settings**
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

5. **Environment Variables**
   - **DO NOT** add them here yet - we'll do this in the next step
   - Click **"Deploy"** to create the project first, or skip to Step 3

## Step 3: Configure Environment Variables

⚠️ **Important**: You must configure environment variables before your first production deployment.

1. **Navigate to Environment Variables**
   - Go to your project dashboard
   - Click **Settings** → **Environment Variables**

2. **Add Variables from Your `.env.local`**
   - Open your local `.env.local` file
   - For each variable, click **"Add New"** in Vercel
   - Copy the variable name and value
   - Select the appropriate environment:
     - **Production**: For your live site
     - **Preview**: For preview deployments (pull requests)
     - **Development**: For local development (if using Vercel CLI)
     - **All**: If the variable should be the same across all environments

3. **Reference Guide**
   - See [VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md) for the complete list of variables
   - Copy values from your `.env.local` file

4. **Quick Checklist**
   - [ ] All `NEXT_PUBLIC_*` variables (public, exposed to browser)
   - [ ] All private API keys (server-side only)
   - [ ] `SESSION_SECRET` and `CRON_SECRET`
   - [ ] Feature flags (`ENABLE_NEW_CHAT`)

## Step 4: Initial Deployment

### Automatic Deployment

1. **Push to Main Branch**
   - Vercel will automatically deploy when you push to the `main` branch
   - If you haven't pushed the latest changes yet:
     ```bash
     git push origin main
     ```

2. **Monitor Deployment**
   - Go to your Vercel project dashboard
   - Click on the **"Deployments"** tab
   - Watch the build logs in real-time

3. **Wait for Build to Complete**
   - Build typically takes 2-5 minutes
   - You'll see progress in the deployment logs

### Manual Deployment (If Needed)

If you want to trigger a deployment manually:

1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Or use the **"Deploy"** button if available

## Step 5: Verify Deployment

### 1. Check Build Logs

- Look for any errors or warnings
- Common issues:
  - Missing environment variables → Add them in Settings
  - Build failures → Check error messages in logs
  - TypeScript errors → Fix in code before deploying

### 2. Test the Application

1. **Visit Your Deployment URL**
   - Vercel provides a URL like: `https://attorney-directory-xxxxx.vercel.app`
   - Click the deployment to open it in a new tab

2. **Test Key Features**
   - Homepage loads correctly
   - Search functionality works
   - Chat widget appears and functions
   - API endpoints respond (e.g., `/api/health`)

3. **Check Browser Console**
   - Open DevTools (F12)
   - Look for any JavaScript errors
   - Verify environment variables are loaded (public ones only)

### 3. Health Check Endpoint

Visit: `https://your-domain.vercel.app/api/health`

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  ...
}
```

## Step 6: Configure Custom Domain (Optional)

1. **Add Domain**
   - Go to **Settings** → **Domains**
   - Click **"Add Domain"**
   - Enter your domain name (e.g., `attorneydirectory.com`)

2. **Configure DNS**
   - Follow Vercel's DNS configuration instructions
   - Add the required DNS records to your domain provider
   - Vercel will provide the exact records needed

3. **SSL Certificate**
   - Vercel automatically provisions SSL certificates
   - Wait for DNS propagation (usually 5-60 minutes)
   - SSL will be active once DNS is configured

## Step 7: Post-Deployment Configuration

### 1. Update CORS Settings

If your application makes API calls to external services:

- Update your PHP chat API (`freshlocal.co`) to allow your Vercel domain
- Add your Vercel domain to allowed origins in your backend services

### 2. Update External Services

- **LeadProsper**: Update webhook URLs if needed
- **Stripe**: Update webhook endpoints to point to your Vercel domain
- **Algolia**: Verify API keys work in production

### 3. Monitor Performance

- Use Vercel's **Analytics** tab to monitor performance
- Check **Logs** tab for any runtime errors
- Set up **Speed Insights** if available on your plan

## Troubleshooting

### Build Failures

**Problem**: Build fails with TypeScript errors
- **Solution**: Fix TypeScript errors locally, then push again
- **Check**: Run `npm run build` locally first

**Problem**: Build fails with "Module not found"
- **Solution**: Ensure all dependencies are in `package.json`
- **Check**: Run `npm install` and verify `node_modules` is in `.gitignore`

**Problem**: Build fails with environment variable errors
- **Solution**: Add missing environment variables in Vercel dashboard
- **Check**: Verify variable names match exactly (case-sensitive)

### Runtime Errors

**Problem**: Application loads but features don't work
- **Solution**: Check browser console for errors
- **Check**: Verify environment variables are set correctly
- **Check**: Test API endpoints directly (`/api/health`)

**Problem**: API routes return 500 errors
- **Solution**: Check Vercel function logs in dashboard
- **Check**: Verify API keys are valid and have correct permissions
- **Check**: Ensure database connections are working

**Problem**: Environment variables not loading
- **Solution**: Verify variables are set for the correct environment
- **Solution**: Redeploy after adding new environment variables
- **Check**: Public variables must start with `NEXT_PUBLIC_`

### Deployment Issues

**Problem**: Changes not appearing after deployment
- **Solution**: Clear browser cache or use incognito mode
- **Solution**: Verify you pushed to the correct branch
- **Check**: Check deployment logs to ensure new code was deployed

**Problem**: Preview deployments not working
- **Solution**: Ensure environment variables are set for "Preview" environment
- **Check**: Verify GitHub integration is properly configured

## Continuous Deployment

Vercel automatically deploys:

- **Production**: Every push to `main` branch
- **Preview**: Every pull request to `main` branch
- **Manual**: When you click "Redeploy" in dashboard

### Branch Protection

- Vercel will create preview deployments for all branches
- Only `main` branch deploys to production by default
- You can configure branch protection in Settings → Git

## Monitoring and Maintenance

### Viewing Logs

1. Go to your project dashboard
2. Click **"Logs"** tab
3. Filter by function, timeframe, or search terms

### Performance Monitoring

1. Enable **Analytics** in Settings (if available on your plan)
2. Monitor Core Web Vitals
3. Track API response times

### Updating Environment Variables

1. Go to **Settings** → **Environment Variables**
2. Edit existing variables or add new ones
3. **Redeploy** your application for changes to take effect

## Rollback Deployment

If you need to rollback to a previous version:

1. Go to **Deployments** tab
2. Find the deployment you want to restore
3. Click the **"..."** menu → **"Promote to Production"**

## Next Steps

- ✅ Set up custom domain (if needed)
- ✅ Configure monitoring and alerts
- ✅ Set up staging environment
- ✅ Review and optimize performance
- ✅ Set up automated testing in CI/CD

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Vercel Support](https://vercel.com/support)

## Quick Reference

**Project Dashboard**: `https://vercel.com/dashboard`

**Deployment URL**: Check in your project dashboard after first deployment

**Environment Variables**: Settings → Environment Variables

**Build Logs**: Deployments → [Select Deployment] → View Logs

**Health Check**: `https://your-domain.vercel.app/api/health`

---

**Congratulations!** Your application should now be live on Vercel. If you encounter any issues, refer to the troubleshooting section above or check the Vercel documentation.

