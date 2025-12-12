# ECS Task Startup Time - Expected Timeline

## ⏱️ Typical Timeline: PENDING → RUNNING

### Total Time: **3-8 minutes** (average)

Here's what happens during each phase:

## 📊 Phase Breakdown

### Phase 1: PENDING (1-2 minutes)
**What's happening:**
- ECS is provisioning the Fargate task
- Allocating CPU and memory resources
- Setting up network interfaces
- Pulling Docker image from ECR

**Status:** Task appears in ECS Console but not running yet

### Phase 2: Image Pull (1-2 minutes)
**What's happening:**
- Downloading Docker image from ECR
- Image size: ~200-500 MB (Java apps are larger)
- Network speed dependent

**Status:** Still PENDING, but image is being pulled

### Phase 3: Container Start (30 seconds - 1 minute)
**What's happening:**
- Container is starting
- Java runtime initializing
- Application starting up

**Status:** Transitioning from PENDING to RUNNING

### Phase 4: Application Initialization (1-3 minutes)
**What's happening:**
- Spring Boot application starting
- Connecting to database
- Connecting to RabbitMQ
- Loading configuration
- Running Flyway migrations (if any)

**Status:** RUNNING, but may not be healthy yet

### Phase 5: Health Check (1-2 minutes)
**What's happening:**
- Health checks running
- Application must respond to `/actuator/health` or `/`
- Target group health checks passing

**Status:** RUNNING and HEALTHY ✅

---

## ⏰ Total Expected Time

| Phase | Time | Status |
|-------|------|--------|
| Task Provisioning | 1-2 min | PENDING |
| Image Pull | 1-2 min | PENDING |
| Container Start | 30s-1min | PENDING → RUNNING |
| App Initialization | 1-3 min | RUNNING |
| Health Checks | 1-2 min | RUNNING → HEALTHY |
| **TOTAL** | **3-8 minutes** | **PENDING → HEALTHY** |

---

## 🎯 Factors Affecting Startup Time

### Faster Startup:
- ✅ Smaller Docker images
- ✅ Faster network (ECR in same region)
- ✅ Less application initialization
- ✅ No database migrations

### Slower Startup:
- ⏳ Large Docker images (Java apps are ~200-500MB)
- ⏳ Database migrations running
- ⏳ Slow database connections
- ⏳ Complex application initialization
- ⏳ First-time image pull (subsequent pulls are faster)

---

## 🔍 How to Monitor Progress

### In ECS Console:
1. Go to **ECS Console** → **grocerystore-cluster**
2. Click **"Tasks"** tab
3. Watch task status:
   - **PENDING** → Task starting
   - **RUNNING** → Container started, app initializing
   - **HEALTHY** → App ready, health checks passing

### Check Task Logs:
```bash
# View CloudWatch logs (replace log-group-name)
aws logs tail /ecs/grocerystore-auth-service --follow --region us-east-2
```

You'll see:
- Container starting messages
- Spring Boot startup logs
- Database connection attempts
- Application ready messages

---

## ⚠️ If Tasks Take Longer Than 10 Minutes

### Possible Issues:
1. **Image pull failing** - Check ECR permissions
2. **Application startup errors** - Check logs
3. **Database connection issues** - Check RDS security groups
4. **Health checks failing** - Check health check path
5. **Resource constraints** - Check CPU/memory allocation

### Troubleshooting:
```bash
# Check stopped tasks
aws ecs list-tasks --cluster grocerystore-cluster --desired-status STOPPED --region us-east-2

# Get stopped reason
aws ecs describe-tasks --cluster grocerystore-cluster --tasks <task-arn> --region us-east-2 --query 'tasks[0].stoppedReason'
```

---

## ✅ Quick Status Check

```bash
# Check all services status
aws ecs describe-services \
  --cluster grocerystore-cluster \
  --services grocerystore-auth-service-service-ltzuczey \
  --region us-east-2 \
  --query 'services[0].{Running:runningCount,Desired:desiredCount,Events:events[0].message}'
```

---

## 📝 Summary

**Expected time:** 3-8 minutes from PENDING to RUNNING and HEALTHY

**What to do:**
1. Wait 3-5 minutes after task appears
2. Check ECS Console Tasks tab
3. Verify status is RUNNING
4. Check target groups show healthy targets
5. Test API endpoints

**If still PENDING after 10 minutes:** Check logs for errors

---

**Your tasks should be RUNNING within 5-8 minutes! 🚀**
