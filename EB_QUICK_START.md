# Elastic Beanstalk Quick Start

## 🚀 Deploy Auth Service First (Test Deployment)

### Step 1: Navigate to Service

```bash
cd /Users/sravankumarbodakonda/Documents/SmartClient360/GROCERYSTOREAPP/backend/auth-service
```

### Step 2: Initialize EB

```bash
eb init -p java-17 grocerystore-auth --region us-east-2
```

**When prompted:**
- Application name: `grocerystore-auth` (or press Enter for default)
- Platform: Java 17 (should auto-select)
- Platform version: Latest (press Enter)
- SSH: Yes (optional, for debugging)

### Step 3: Create Environment with Environment Variables

**Important:** Replace `YOUR_RDS_PASSWORD` and `YOUR_RABBITMQ_PASSWORD` with your actual passwords!

```bash
eb create grocerystore-auth-prod \
  --instance-type t3.small \
  --envvars \
    DB_HOST=database-1.cnuq0uuoq8b1.us-east-2.rds.amazonaws.com,\
    DB_PORT=5432,\
    DB_NAME=grocerystore_auth,\
    DB_USER=postgres,\
    DB_PASSWORD=YOUR_RDS_PASSWORD,\
    JWT_SECRET=3dc79832a314f288b203c3bd479a798111e751fec10757725dcba080204195a4,\
    JWT_EXPIRATION=86400000,\
    RABBITMQ_HOST=b-bede77dc-0652-44cb-b9ff-580e384de00b.mq.us-east-2.on.aws,\
    RABBITMQ_PORT=5671,\
    RABBITMQ_USER=admin,\
    RABBITMQ_PASSWORD=YOUR_RABBITMQ_PASSWORD,\
    SERVER_PORT=8081
```

**This will:**
- Create the EB environment
- Launch EC2 instances
- Build and deploy your application
- Take 5-10 minutes

### Step 4: Get the URL

After deployment completes:

```bash
eb status
```

You'll see the CNAME/URL like: `grocerystore-auth-prod.us-east-2.elasticbeanstalk.com`

### Step 5: Test

```bash
# Open in browser
eb open

# Or test with curl
curl http://grocerystore-auth-prod.us-east-2.elasticbeanstalk.com/actuator/health
```

---

## 📝 Environment Variables Reference

**Common for all services:**
```
DB_HOST=database-1.cnuq0uuoq8b1.us-east-2.rds.amazonaws.com
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=[Your RDS password]
JWT_SECRET=3dc79832a314f288b203c3bd479a798111e751fec10757725dcba080204195a4
JWT_EXPIRATION=86400000
RABBITMQ_HOST=b-bede77dc-0652-44cb-b9ff-580e384de00b.mq.us-east-2.on.aws
RABBITMQ_PORT=5671
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=[Your RabbitMQ password]
```

**Service-specific:**
- auth-service: `DB_NAME=grocerystore_auth`, `SERVER_PORT=8081`
- catalog-service: `DB_NAME=grocerystore_catalog`, `SERVER_PORT=8084`
- cart-service: `DB_NAME=grocerystore_cart`, `SERVER_PORT=8083`
- order-service: `DB_NAME=grocerystore_order`, `SERVER_PORT=8085`
- payment-service: `DB_NAME=grocerystore_payment`, `SERVER_PORT=8086` + Stripe keys
- api-gateway: No DB_NAME, `SERVER_PORT=8087`

---

## 🔄 After Auth Service Works

Once auth-service is deployed and working, repeat for other services:

1. `cd backend/catalog-service`
2. `eb init -p java-17 grocerystore-catalog --region us-east-2`
3. `eb create ...` (with catalog-specific variables)
4. `eb deploy`

See `ELASTIC_BEANSTALK_DEPLOYMENT.md` for complete commands for all services.

---

## 🐛 Troubleshooting

### "Application not found"
- Make sure you're in the correct directory
- Run `eb init` first

### Build fails
- Check logs: `eb logs`
- Verify Java/Maven dependencies in `pom.xml`

### Environment variables not working
- Use `eb setenv KEY=value` to update
- Redeploy: `eb deploy`

### Port conflicts
- Make sure `SERVER_PORT` matches your `application.yml`
- EB might use port 5000 by default - check your configuration

---

**Start with auth-service deployment now!**
