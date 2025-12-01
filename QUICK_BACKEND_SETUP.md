# 🚀 Quick Backend Setup for Testing

## Option 1: ngrok (Fastest - 5 minutes) ⚡

### Step 1: Install ngrok
```bash
# macOS
brew install ngrok

# Or download from: https://ngrok.com/download
```

### Step 2: Start Your Backend Locally
```bash
# Make sure all services are running locally
cd backend/api-gateway
./run.sh
# (Or use docker-compose up)
```

### Step 3: Expose Backend with ngrok
```bash
ngrok http 8080
```

You'll get a URL like: `https://abc123.ngrok.io`

### Step 4: Update Amplify Environment Variable
1. Go to AWS Amplify Console
2. Your App → App settings → Environment variables
3. Add: `VITE_API_URL` = `https://abc123.ngrok.io`
4. Save & Redeploy

### Step 5: Update CORS in Backend
Add ngrok URL to CORS in all backend services:
```java
@CrossOrigin(origins = {
    "http://localhost:3000",
    "https://main.d3hpgmmz6e17ag.amplifyapp.com",
    "https://abc123.ngrok.io"  // Add your ngrok URL
})
```

---

## Option 2: AWS EC2 (Production - 1-2 hours)

### Step 1: Launch EC2 Instance
1. Go to AWS EC2 Console
2. Launch Instance
3. Choose: Amazon Linux 2023
4. Instance type: t3.medium (or larger)
5. Configure security group:
   - SSH (22) from your IP
   - HTTP (8080-8085) from anywhere
   - Custom TCP (5432) for RDS

### Step 2: Connect to EC2
```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

### Step 3: Install Docker
```bash
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user
sudo yum install git -y
```

### Step 4: Clone and Deploy
```bash
git clone https://github.com/smartclient360LLC/GROCERY-STORE-APP.git
cd GROCERY-STORE-APP

# Update docker-compose.yml with RDS endpoints
# Then:
docker-compose up -d
```

### Step 5: Set Up RDS Database
1. Go to AWS RDS Console
2. Create database → PostgreSQL 15
3. Note the endpoint
4. Update application.yml files with RDS endpoint

### Step 6: Update Amplify
Set `VITE_API_URL` = `http://your-ec2-ip:8080`

---

## Option 3: AWS Elastic Beanstalk (Easier than EC2)

### Step 1: Install EB CLI
```bash
pip install awsebcli
```

### Step 2: Initialize for Each Service
```bash
cd backend/auth-service
eb init -p "Java 17" -r us-east-1
eb create auth-service-env
eb deploy
```

Repeat for each service.

---

## 🔐 Important: Update CORS

Add your Amplify domain to ALL backend services:

**In each controller:**
```java
@CrossOrigin(origins = {
    "http://localhost:3000",
    "https://main.d3hpgmmz6e17ag.amplifyapp.com"
})
```

**Or in SecurityConfig.java:**
```java
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:3000",
    "https://main.d3hpgmmz6e17ag.amplifyapp.com"
));
```

---

## ✅ Quick Test Checklist

- [ ] Backend running (locally or on AWS)
- [ ] CORS updated with Amplify domain
- [ ] VITE_API_URL set in Amplify
- [ ] Frontend redeployed
- [ ] Test login/register
- [ ] Test product listing
- [ ] Test cart functionality

---

## 🆘 Troubleshooting

### CORS Errors
- ✅ Check backend CORS includes Amplify domain
- ✅ Verify backend is accessible
- ✅ Check security groups (if AWS)

### Connection Refused
- ✅ Verify backend is running
- ✅ Check URL in VITE_API_URL
- ✅ Test backend URL directly in browser

### 401 Unauthorized
- ✅ Check JWT token is being sent
- ✅ Verify auth service is running
- ✅ Check token in browser localStorage

