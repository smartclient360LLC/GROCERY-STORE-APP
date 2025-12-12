# AWS Amplify Environment Variables Setup

## ⚠️ Required Environment Variables

Your AWS Amplify deployment needs these environment variables to build and run correctly:

### 1. Go to AWS Amplify Console
- Navigate to: https://console.aws.amazon.com/amplify/
- Select your app
- Go to **App settings** → **Environment variables**

### 2. Add These Variables

#### Required for Build:
```
VITE_STRIPE_PUBLIC_KEY=pk_test_51QxX4UK840hddnWYszVWwwBF7D3AAk8NC0hi6qcqrH2Keioq9QY8FEhzAnXWELeRBUfO7Pspe1pkLR0KJMg3Eo8u00MZKCYO1i
```

#### Required for API Calls (set after backend is deployed):
```
VITE_API_BASE_URL=https://your-api-gateway-url.com
```

**For local/development testing:**
```
VITE_API_BASE_URL=http://localhost:8087
```

**For production (after backend is deployed):**
```
VITE_API_BASE_URL=https://your-alb-dns-name.elb.amazonaws.com
```

### 3. Save and Redeploy

1. Click **Save** after adding variables
2. Go to **App** → **Redeploy this version** (or wait for next commit to trigger auto-deploy)

## 🔍 Troubleshooting

### Build Fails with "Environment variable not found"
- ✅ Make sure variables start with `VITE_` prefix (Vite requirement)
- ✅ Check for typos in variable names
- ✅ Ensure variables are saved in Amplify console

### Build Succeeds but App Doesn't Work
- ✅ Check browser console for API errors
- ✅ Verify `VITE_API_BASE_URL` points to correct backend
- ✅ Ensure CORS is configured in backend services

### Stripe Payment Not Working
- ✅ Verify `VITE_STRIPE_PUBLIC_KEY` is set correctly
- ✅ Check that Stripe keys match (public key in frontend, secret key in backend)

## 📝 Current Configuration

Your `amplify.yml` is correctly configured:
- ✅ Builds from `frontend` directory
- ✅ Uses `npm ci` for reliable installs
- ✅ Outputs to `frontend/dist`
- ✅ Caches `node_modules` for faster builds

## 🔐 Security Note

**Never commit actual secret keys to git!** 
- ✅ Stripe secret keys are now removed from code
- ✅ Use environment variables in AWS Amplify
- ✅ For production, use Stripe live keys (not test keys)
