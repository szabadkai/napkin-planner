# Security Guidelines

## 🔐 API Key Management

**NEVER commit API keys to the repository!**

### Environment Variables
- Create a `.env.local` file in the `napkin-next/` directory  
- Add your API key: `GEMINI_API_KEY=your_api_key_here`
- The `.env.local` file is already in `.gitignore` and will not be committed

### For Vercel Deployment
Set environment variables in the Vercel dashboard:
- Variable: `GEMINI_API_KEY`
- Value: Your Google Gemini API key

### If You Accidentally Commit API Keys
If you accidentally commit API keys:
1. **Immediately revoke/regenerate** the API key in Google AI Studio
2. Remove the file from git: `git rm --cached path/to/file`
3. Add the file pattern to `.gitignore`
4. Commit the removal: `git commit -m "Remove API key from tracking"`

## 🚫 Never Commit These Files
- `.env`, `.env.local`, `.env.*` (environment files)
- `node_modules/` (dependencies)
- `.next/` (build files)
- `.vercel/` (Vercel config)
- Any files containing secrets, tokens, or credentials

## ✅ Safe to Commit
- `.env.example` files (without real values)
- Configuration files without secrets
- Source code
- Documentation

## 🔍 How to Check
Before committing, always run:
```bash
git status
git diff --cached
```

Look for any files that might contain sensitive information.

## 📋 Emergency Response
If you've committed API keys:
1. **Revoke the key immediately** 
2. Generate a new key
3. Update your local `.env.local`
4. Update Vercel environment variables
5. Remove the committed key from git history

Remember: **Security first!** 🛡️