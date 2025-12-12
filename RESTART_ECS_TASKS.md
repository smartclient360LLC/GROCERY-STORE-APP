# Restart ECS Tasks - Quick Reference

## ✅ Tasks Restarted

All 6 services have been updated to force new task deployments:
- ✅ grocerystore-auth-service-service-ltzuczey
- ✅ grocerystore-catalog-service-service-5pxbfyf4
- ✅ grocerystore-cart-service-service-gb2h5uyc
- ✅ grocerystore-order-service-service-44c7c4on
- ✅ grocerystore-payment-service-service-d7nhw2go
- ✅ grocerystore-api-gateway-service-service-mo8wxub8

## ⏱️ What Happens Next

1. **Tasks will start** (takes 1-3 minutes)
2. **Containers will initialize** (Java apps take time to start)
3. **Health checks will run** (may take a few minutes)
4. **Targets will become healthy** in target groups

## 🔍 Monitor Task Status

### Check in Console
1. Go to **ECS Console** → **grocerystore-cluster**
2. Click **"Tasks"** tab
3. Watch tasks transition:
   - **Pending** → Starting
   - **Running** → Started successfully ✅
   - **Stopped** → Check logs for errors ❌

### Check via CLI

```bash
# List all tasks
aws ecs list-tasks --cluster grocerystore-cluster --region us-east-2

# Check service status
aws ecs describe-services --cluster grocerystore-cluster --services <service-name> --region us-east-2 --query 'services[0].{Running:runningCount,Desired:desiredCount,Status:status}'
```

## 🔄 Restart Tasks Again (If Needed)

If tasks stop or you need to restart:

```bash
export AWS_REGION=us-east-2

# Restart all services
aws ecs update-service --cluster grocerystore-cluster --service grocerystore-auth-service-service-ltzuczey --force-new-deployment --region $AWS_REGION
aws ecs update-service --cluster grocerystore-cluster --service grocerystore-catalog-service-service-5pxbfyf4 --force-new-deployment --region $AWS_REGION
aws ecs update-service --cluster grocerystore-cluster --service grocerystore-cart-service-service-gb2h5uyc --force-new-deployment --region $AWS_REGION
aws ecs update-service --cluster grocerystore-cluster --service grocerystore-order-service-service-44c7c4on --force-new-deployment --region $AWS_REGION
aws ecs update-service --cluster grocerystore-cluster --service grocerystore-payment-service-service-d7nhw2go --force-new-deployment --region $AWS_REGION
aws ecs update-service --cluster grocerystore-cluster --service grocerystore-api-gateway-service-service-mo8wxub8 --force-new-deployment --region $AWS_REGION
```

## 📊 Check Task Health

### View Logs
```bash
# Get log group name from task definition, then:
aws logs tail /ecs/grocerystore-auth-service --follow --region us-east-2
```

### Check Target Group Health
1. Go to **EC2 Console** → **Target Groups**
2. Select a target group
3. Check **"Targets"** tab
4. Status should be **"healthy"** when tasks are running

## ⏰ Expected Timeline

- **0-2 minutes:** Tasks starting (Pending → Running)
- **2-5 minutes:** Containers initializing (Java apps starting)
- **5-10 minutes:** Health checks passing, targets becoming healthy

## 🎯 After Tasks Are Running

1. ✅ Verify all tasks are RUNNING
2. ✅ Check target groups show healthy targets
3. ✅ Test API endpoints via ALB
4. ✅ Update frontend API URL if needed

---

**Tasks are restarting now! Check the ECS Console in a few minutes to see if they're running.**
