# 🚀 Next Steps - Complete Your Deployment

## ✅ What's Done
- ✅ All 6 backend services deployed to ECS Fargate
- ✅ All services running (1/1 tasks each)
- ✅ ALB configured and routing traffic
- ✅ Platform mismatch fixed (linux/amd64)

## 🎯 Next Steps

### Step 1: Test Backend Services (5 minutes)

Verify your backend is responding:

```bash
# Set your ALB DNS
ALB_DNS="grocerystore-alb-154297842.us-east-2.elb.amazonaws.com"

# Test each service
echo "Testing Auth Service..."
curl -v http://$ALB_DNS/api/auth/health

echo "Testing Catalog Service..."
curl -v http://$ALB_DNS/api/catalog/products

echo "Testing Cart Service..."
curl -v http://$ALB_DNS/api/cart/health

echo "Testing Order Service..."
curl -v http://$ALB_DNS/api/orders/health

echo "Testing Payment Service..."
curl -v http://$ALB_DNS/api/payment/health
```

**Expected:** HTTP 200 or 404 (404 is OK if endpoint doesn't exist, means service is responding)

### Step 2: Update Frontend API URL in AWS Amplify (10 minutes)

Your frontend uses `VITE_API_BASE_URL` environment variable. Set it in AWS Amplify:

#### Option A: Via AWS Console

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Select your app
3. Go to **App settings** → **Environment variables**
4. Click **Manage variables**
5. Add/Update:
   - **Key:** `VITE_API_BASE_URL`
   - **Value:** `http://grocerystore-alb-154297842.us-east-2.elb.amazonaws.com`
6. Click **Save**
7. Go to **App settings** → **Build settings**
8. Click **Redeploy this version** or wait for next commit to trigger rebuild

#### Option B: Via AWS CLI

```bash
# Get your Amplify App ID
aws amplify list-apps --region us-east-2 --query 'apps[?name==`YOUR_APP_NAME`].appId' --output text

# Set environment variable (replace APP_ID with your app ID)
APP_ID="YOUR_APP_ID"
aws amplify update-app \
    --app-id $APP_ID \
    --environment-variables VITE_API_BASE_URL=http://grocerystore-alb-154297842.us-east-2.elb.amazonaws.com \
    --region us-east-2

# Trigger a new build
aws amplify start-job \
    --app-id $APP_ID \
    --branch-name main \
    --job-type RELEASE \
    --region us-east-2
```

### Step 3: Verify Frontend Configuration

Your frontend is already configured correctly:
- ✅ Uses `VITE_API_BASE_URL` from environment
- ✅ Axios interceptors set up for auth tokens
- ✅ Error handling configured

### Step 4: Test Full Application (15 minutes)

After frontend redeploys:

1. **Open your Amplify app URL**
2. **Test User Registration/Login**
   - Register a new user
   - Login with credentials
   - Verify JWT token is stored

3. **Test Product Browsing**
   - Browse products
   - View product details
   - Search products

4. **Test Shopping Cart**
   - Add items to cart
   - Update quantities
   - Remove items

5. **Test Checkout**
   - Proceed to checkout
   - Enter shipping info
   - Complete payment (test mode)

6. **Test Order History**
   - View past orders
   - Check order details

### Step 5: Monitor and Troubleshoot

#### Check Service Logs

```bash
# View logs for a service
aws logs tail /ecs/grocerystore-auth-service --follow --region us-east-2

# View logs for all services
for service in auth-service catalog-service cart-service order-service payment-service api-gateway; do
    echo "=== $service ==="
    aws logs tail /ecs/grocerystore-$service --since 10m --region us-east-2 | tail -20
    echo ""
done
```

#### Check ECS Service Status

```bash
aws ecs describe-services \
    --cluster grocerystore-cluster \
    --services $(aws ecs list-services --cluster grocerystore-cluster --region us-east-2 --query 'serviceArns' --output text | tr '\t' ' ') \
    --region us-east-2 \
    --query 'services[*].{Name:serviceName,Desired:desiredCount,Running:runningCount,Status:status}' \
    --output table
```

#### Check ALB Target Health (if you have permissions)

In AWS Console:
1. Go to EC2 → Target Groups
2. Check each target group
3. Verify targets are "healthy"

### Step 6: Set Up HTTPS (Optional but Recommended)

For production, set up HTTPS:

1. **Request SSL Certificate in ACM:**
   ```bash
   # Request certificate (if you have a domain)
   aws acm request-certificate \
       --domain-name yourdomain.com \
       --validation-method DNS \
       --region us-east-2
   ```

2. **Update ALB Listener:**
   - Add HTTPS listener (port 443)
   - Attach SSL certificate
   - Redirect HTTP to HTTPS

3. **Update Frontend URL:**
   - Change `VITE_API_BASE_URL` to use `https://` instead of `http://`

### Step 7: Set Up Monitoring (Optional)

#### CloudWatch Alarms

```bash
# Example: Alarm for high CPU usage
aws cloudwatch put-metric-alarm \
    --alarm-name grocerystore-high-cpu \
    --alarm-description "Alert when CPU exceeds 80%" \
    --metric-name CPUUtilization \
    --namespace AWS/ECS \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --evaluation-periods 2 \
    --region us-east-2
```

#### CloudWatch Dashboard

Create a dashboard in AWS Console to monitor:
- ECS service metrics (CPU, Memory)
- ALB metrics (Request count, Response time)
- Application logs (Error rates)

## 🔍 Troubleshooting Common Issues

### Frontend Can't Connect to Backend

**Symptoms:** CORS errors, network errors, 404s

**Solutions:**
1. Verify `VITE_API_BASE_URL` is set correctly in Amplify
2. Check CORS configuration in backend services
3. Verify ALB is accessible (test with curl)
4. Check browser console for specific errors

### Services Are Running But Not Responding

**Symptoms:** Tasks running but health checks failing

**Solutions:**
1. Check service logs for errors
2. Verify environment variables are set correctly
3. Check database connectivity
4. Verify RabbitMQ connectivity
5. Check security group rules

### Authentication Not Working

**Symptoms:** Can't login, tokens not working

**Solutions:**
1. Verify JWT_SECRET is set in all services
2. Check auth-service logs
3. Verify token is being sent in requests (check Network tab)
4. Check token expiration settings

## 📋 Quick Reference

### Important URLs

- **ALB DNS:** `grocerystore-alb-154297842.us-east-2.elb.amazonaws.com`
- **ECS Console:** https://console.aws.amazon.com/ecs/v2/clusters/grocerystore-cluster/services?region=us-east-2
- **Amplify Console:** https://console.aws.amazon.com/amplify/
- **CloudWatch Logs:** https://console.aws.amazon.com/cloudwatch/home?region=us-east-2#logsV2:log-groups

### Environment Variables Needed

**Backend (ECS Task Definitions):**
- Database connection strings
- RabbitMQ connection strings
- JWT_SECRET
- Stripe keys (payment service)

**Frontend (Amplify):**
- `VITE_API_BASE_URL` = `http://grocerystore-alb-154297842.us-east-2.elb.amazonaws.com`

## ✅ Checklist

- [ ] Test backend services with curl
- [ ] Set `VITE_API_BASE_URL` in AWS Amplify
- [ ] Trigger frontend redeployment
- [ ] Test user registration/login
- [ ] Test product browsing
- [ ] Test shopping cart
- [ ] Test checkout flow
- [ ] Test order history
- [ ] Monitor service logs
- [ ] Set up CloudWatch alarms (optional)
- [ ] Set up HTTPS (optional)

---

**🎉 You're almost there! Follow these steps to complete your deployment!**
