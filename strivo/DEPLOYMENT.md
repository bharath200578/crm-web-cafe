# Deploying to Netlify

This guide will help you deploy your Next.js restaurant booking application to Netlify.

## Prerequisites

1. A GitHub, GitLab, or Bitbucket account
2. A Netlify account
3. No database required! This app uses localStorage for data persistence

## Step 1: Prepare Your Repository

1. Make sure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket)
2. Ensure all environment variables are properly configured

## Step 2: No Database Setup Required!

This application uses localStorage for data persistence, so no database setup is needed. All data will be stored locally in the user's browser.

## Step 3: Deploy to Netlify

### Option A: Deploy via Netlify UI

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "New site from Git"
3. Choose your Git provider and select your repository
4. Configure the build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Node version**: `18`
5. Click "Deploy site"

### Option B: Deploy via Netlify CLI

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Initialize and deploy:
   ```bash
   netlify init
   netlify deploy --prod
   ```

## Step 4: Configure Environment Variables (Optional)

Since this app uses localStorage, environment variables are optional. However, if you want to customize the admin login, you can set:

1. Go to Site settings > Environment variables
2. Add the following variables (optional):
   ```
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=https://your-site-name.netlify.app
   JWT_SECRET=your_jwt_secret
   ```

## Step 5: No Database Setup Required!

The application will automatically initialize with default data (tables, cafe settings) when first loaded. No additional setup is needed!

## Step 6: Configure Custom Domain (Optional)

1. In your Netlify dashboard, go to Domain settings
2. Add your custom domain
3. Update your `NEXTAUTH_URL` environment variable to match your custom domain

## Troubleshooting

### Common Issues

1. **Build Failures**: Check the build logs in Netlify dashboard
2. **Data Not Persisting**: Data is stored in localStorage, so it's per-browser
3. **Authentication Issues**: Check that `NEXTAUTH_URL` matches your deployed URL

### Environment Variables

Environment variables are optional since this app uses localStorage:
- `NEXTAUTH_SECRET` (optional)
- `NEXTAUTH_URL` (optional)
- `JWT_SECRET` (optional)

### Data Storage

This app uses localStorage for data persistence:
- All data is stored locally in the user's browser
- Data persists between sessions but is not shared between devices
- No server-side database is required

## Support

If you encounter issues:
1. Check the Netlify build logs
2. Verify your environment variables
3. Test your API routes locally first
4. Check the Netlify documentation for Next.js deployments
