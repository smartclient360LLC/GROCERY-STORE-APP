# 🚀 AWS Amplify Setup - Quick Guide

## ✅ Your Frontend is Live!

**URL:** https://main.d3hpgmmz6e17ag.amplifyapp.com

---

## 🔧 Step 1: Configure Backend API URL

### In AWS Amplify Console:

1. Go to your app in Amplify Console
2. Click **"App settings"** → **"Environment variables"**
3. Add this variable:
   ```
   Key: VITE_API_URL
   Value: http://your-backend-url:8080
   ```
   (Replace with your actual backend URL once deployed)

4. Click **"Save"**
5. Go to **"Redeploy this version"** to apply changes

---

## 🎯 Step 2: Deploy Backend

You have two options:

### Option A: Quick Test (Local Backend)
If you want to test quickly, you can:
1. Run backend locally on your machine
2. Use a service like **ngrok** to expose it:
   ```bash
   ngrok http 8080
   ```
3. Use the ngrok URL in `VITE_API_URL`

### Option B: AWS Deployment (Production)
Follow the `AWS_DEPLOYMENT_GUIDE.md` for:
- EC2 or Elastic Beanstalk for backend
- RDS for database
- Proper production setup

---

## 🔐 Step 3: Update CORS in Backend

Once you have your backend URL, update CORS in all backend services:

**In each service's controller:**
```java
@CrossOrigin(origins = {
    "http://localhost:3000",
    "https://main.d3hpgmmz6e17ag.amplifyapp.com"
})
```

Or in `SecurityConfig.java`:
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList(
        "http://localhost:3000",
        "https://main.d3hpgmmz6e17ag.amplifyapp.com"
    ));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

---

## ✅ Step 4: Test Connection

1. Visit: https://main.d3hpgmmz6e17ag.amplifyapp.com
2. Open browser console (F12)
3. Check for API errors
4. Try logging in/registering

---

## 🐛 Troubleshooting

### Frontend can't connect to backend
- ✅ Check `VITE_API_URL` is set correctly in Amplify
- ✅ Verify backend is running and accessible
- ✅ Check CORS settings in backend
- ✅ Check browser console for errors

### CORS errors
- ✅ Add Amplify domain to backend CORS allowed origins
- ✅ Ensure backend allows credentials
- ✅ Check security groups (if using AWS)

### Environment variable not working
- ✅ Redeploy after adding environment variable
- ✅ Check variable name is exactly `VITE_API_URL`
- ✅ Clear browser cache

---

## 📝 Next Steps

1. ✅ Frontend deployed (DONE!)
2. ⏳ Deploy backend services
3. ⏳ Set up database (RDS)
4. ⏳ Configure environment variables
5. ⏳ Test end-to-end
6. ⏳ Add custom domain (optional)

---

## 🎉 Current Status

- ✅ Frontend: **LIVE** on AWS Amplify
- ⏳ Backend: Needs deployment
- ⏳ Database: Needs setup
- ⏳ Connection: Needs configuration

You're 25% done! 🚀

