# RabbitMQ Connection Details - How to Get Endpoint

Your RabbitMQ broker is running! Here's how to get the connection details you need.

## 🔍 Step 1: Get RabbitMQ Endpoint

1. **In the AWS MQ Console**, on your broker details page
2. Click on the **"Endpoints"** tab (or look for "Connection details" section)
3. You'll see endpoints like:
   - **OpenWire endpoint:** (for ActiveMQ)
   - **AMQPS endpoint (SSL):** `b-bede77dc-0652-44cb-b9ff-580e384de00b-1.mq.us-east-2.amazonaws.com:5671`
   - **AMQP endpoint (non-SSL):** `b-bede77dc-0652-44cb-b9ff-580e384de00b-1.mq.us-east-2.amazonaws.com:5672`

**For your application, use the AMQP endpoint (port 5672) for non-SSL, or 5671 for SSL.**

## 🔐 Step 2: Get Username and Password

1. **In the broker details page**, look for **"Users"** or **"Authentication"** section
2. Or go to: **Amazon MQ → Brokers → RabbitMQ → Users tab**
3. You should see the username (likely `admin` or what you set during creation)
4. **For the password:**
   - If you remember it from creation, use that
   - If not, you may need to reset it or check your notes

## 📝 Connection Details Summary

Once you have the information, your connection details will be:

```
RABBITMQ_HOST=b-bede77dc-0652-44cb-b9ff-580e384de00b-1.mq.us-east-2.amazonaws.com
RABBITMQ_PORT=5672
RABBITMQ_USER=admin (or your username)
RABBITMQ_PASSWORD=[Your password]
```

## ✅ Quick Check: Test Connection

You can test the connection from CloudShell:

```bash
# Install RabbitMQ client tools
sudo yum install -y rabbitmq-server

# Test connection (replace with your actual endpoint and credentials)
rabbitmqadmin -H YOUR_RABBITMQ_ENDPOINT -P 5672 -u admin -p YOUR_PASSWORD list queues
```

## 🎯 Next Steps

Once you have the endpoint and credentials:

1. **Save them securely** - You'll need them for ECS task definitions
2. **Update your deployment guide** with the actual values
3. **Proceed with ECR repositories** and Docker image builds
4. **Configure ECS services** with these RabbitMQ connection details

## ⚠️ Important Notes

- **Public accessibility: Yes** - Your broker is accessible from the internet
- **Security group:** Make sure the security group allows inbound on port 5672
- **Region:** us-east-2 (matches your RDS)
- **Instance type:** mq.m7g.medium (not free tier, but good for production)

## 🔒 Security Recommendation

Since public accessibility is enabled, make sure:
1. Your security group only allows necessary IPs (or 0.0.0.0/0 temporarily)
2. Use strong passwords
3. Consider using SSL (port 5671) for production

---

**Need help finding the endpoint?** Look for "Endpoints" tab or "Connection details" section in the broker page.
