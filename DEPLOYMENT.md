# Deploying Napkin Planner to Vercel

This guide will help you deploy the Napkin Planner to Vercel.

## Prerequisites

1. **Gemini API Key**: You'll need a Google Gemini API key
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Keep it secure for environment variable setup

## Deployment Steps

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from the napkin-next directory**
   ```bash
   cd napkin-next
   vercel
   ```

4. **Set Environment Variables**
   During deployment or afterward in the Vercel dashboard:
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `RESEARCH_MODEL`: `gemini-1.5-flash` (optional, has default)
   - `PLAN_MODEL`: `gemini-1.5-flash` (optional, has default)

### Option 2: Deploy via Vercel Dashboard

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository

2. **Configure Build Settings**
   - Framework Preset: **Next.js**
   - Root Directory: `napkin-next`
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Set Environment Variables**
   In the Vercel project settings:
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `RESEARCH_MODEL`: `gemini-1.5-flash`
   - `PLAN_MODEL`: `gemini-1.5-flash`

4. **Deploy**
   Click "Deploy" and wait for the build to complete.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes |
| `RESEARCH_MODEL` | AI model for research (default: gemini-1.5-flash) | No |
| `PLAN_MODEL` | AI model for planning (default: gemini-1.5-flash) | No |

## Post-Deployment

1. **Test the Application**
   - Visit your deployed URL
   - Try entering a business idea and generating parameters
   - Test the viability scoring functionality

2. **Custom Domain (Optional)**
   - In Vercel dashboard, go to your project settings
   - Add your custom domain under "Domains"

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check that all environment variables are set
   - Ensure the root directory is set to `napkin-next`

2. **API Errors**
   - Verify your Gemini API key is correct and has quota
   - Check the API key has the necessary permissions

3. **Timeout Issues**
   - The research API has a 30-second timeout configured
   - For longer requests, consider optimizing prompts

### Support

If you encounter issues:
1. Check the Vercel deployment logs
2. Verify environment variables are correctly set
3. Test the API endpoints locally first

## Performance

The application is optimized for production:
- ✅ Static generation where possible
- ✅ Optimized bundle size (~95.9 kB first load)
- ✅ API routes with proper timeout handling
- ✅ Currency detection with geolocation fallback