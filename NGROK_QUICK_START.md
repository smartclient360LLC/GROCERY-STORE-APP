# ⚡ ngrok Quick Start Guide

## 🎯 Goal
Connect your AWS Amplify frontend to your local backend in 5 minutes!

---

## ✅ Prerequisites
- ✅ ngrok installed (`brew install ngrok` or download from ngrok.com)
- ✅ Backend services running locally
- ✅ AWS Amplify app deployed

---

## 🚀 Step-by-Step

### Step 1: Start Your Backend
```bash
# Option A: Docker Compose (recommended)
docker-compose up -d

# Option B: Individual services
cd backend/api-gateway && ./run.sh
# (Start other services in separate terminals)
```

**Verify API Gateway is running:**
```bash
curl http://localhost:8087/api/catalog/products
```

### Step 2: Start ngrok
```bash
./start-ngrok.sh
```

Or manually:
```bash
ngrok http 8087
```

### Step 3: Copy ngrok URL
You'll see output like:
```
Forwarding: https://abc123.ngrok.io -> http://localhost:8087
```

**Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

### Step 4: Configure AWS Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click on your app
3. Go to **App settings** → **Environment variables**
4. Click **Manage variables**
5. Add new variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://your-ngrok-url.ngrok.io` (paste your ngrok URL)
6. Click **Save**
7. Go to **App** → **Redeploy this version**

### Step 5: Test!

Visit: https://main.d3hpgmmz6e17ag.amplifyapp.com

**Test these features:**
- ✅ Login/Register
- ✅ Browse products
- ✅ Add to cart
- ✅ View wishlist
- ✅ Checkout

---

## 🔧 Troubleshooting

### ngrok shows "Session Expired"
- Sign up for free ngrok account: https://dashboard.ngrok.com/signup
- Get authtoken: https://dashboard.ngrok.com/get-started/your-authtoken
- Run: `ngrok config add-authtoken YOUR_TOKEN`

### CORS Errors
- ✅ CORS is already configured to allow all origins
- ✅ Make sure backend services are restarted after CORS changes
- ✅ Check browser console for specific error

### Connection Refused
- ✅ Verify backend is running: `curl http://localhost:8087/api/catalog/products`
- ✅ Check ngrok is forwarding to correct port (8087)
- ✅ Verify VITE_API_URL in Amplify matches ngrok URL

### 401 Unauthorized
- ✅ Check JWT token in browser localStorage
- ✅ Verify auth service is running
- ✅ Try logging in again

---

## 📝 Notes

- **ngrok URL changes** each time you restart (free tier)
- **Keep ngrok running** while testing
- For **production**, deploy backend to AWS EC2 with fixed domain
- CORS allows all origins (development only - restrict in production)

---

## 🎉 Success Checklist

- [ ] Backend services running
- [ ] ngrok started and showing URL
- [ ] VITE_API_URL set in Amplify
- [ ] Amplify redeployed
- [ ] Can access app at Amplify URL
- [ ] Can login/register
- [ ] Can browse products
- [ ] Can add to cart

---

## 🚀 Next Steps

Once testing works:
1. Deploy backend to AWS EC2 for production
2. Set up RDS database
3. Use fixed domain instead of ngrok
4. Restrict CORS to specific domains

