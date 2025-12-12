# AWS CLI Setup and Configuration

## ✅ AWS CLI Installed

AWS CLI is now installed. You need to configure it with your AWS credentials.

## 🔐 Step 1: Configure AWS CLI

Run this command:

```bash
aws configure
```

You'll be prompted for:

1. **AWS Access Key ID:** [Your AWS access key]
2. **AWS Secret Access Key:** [Your AWS secret key]
3. **Default region name:** `us-east-2` (to match your RDS and RabbitMQ)
4. **Default output format:** `json` (recommended)

## 🔑 How to Get AWS Credentials

### Option A: Create IAM User (Recommended)

1. **Go to AWS Console → IAM**
   - URL: https://console.aws.amazon.com/iam/
   - Click "Users" → "Create user"

2. **User Details:**
   - Username: `grocerystore-deployment`
   - Select "Provide user access to the AWS Management Console" (optional)
   - Or just "Access key - Programmatic access"

3. **Set Permissions:**
   - Attach policies:
     - `AmazonEC2ContainerRegistryFullAccess` (for ECR)
     - `AmazonECS_FullAccess` (for ECS)
     - `AmazonRDSFullAccess` (for RDS - if needed)
     - Or create a custom policy with necessary permissions

4. **Create Access Key:**
   - After user is created, go to "Security credentials" tab
   - Click "Create access key"
   - Choose "Command Line Interface (CLI)"
   - **Save the Access Key ID and Secret Access Key** (you won't see the secret again!)

5. **Use these credentials in `aws configure`**

### Option B: Use Existing Credentials

If you already have AWS credentials:
- Access Key ID
- Secret Access Key

Use them in `aws configure`

## ✅ Step 2: Verify Configuration

After configuring, verify it works:

```bash
aws sts get-caller-identity
```

You should see your AWS account ID and user ARN.

## 🚀 Step 3: Run Deployment Script

Once configured, you can run the deployment script:

```bash
cd /Users/sravankumarbodakonda/Documents/SmartClient360/GROCERYSTOREAPP
./deploy.sh
```

## 🔒 Security Best Practices

- **Never commit credentials to git**
- **Use IAM users with least privilege**
- **Rotate access keys regularly**
- **Use AWS SSO or IAM roles when possible**

## 📝 Quick Setup Commands

```bash
# Configure AWS CLI
aws configure

# Verify configuration
aws sts get-caller-identity

# Set default region (if not set during configure)
aws configure set region us-east-2

# Test ECR access
aws ecr describe-repositories --region us-east-2
```

---

**After configuring, run `./deploy.sh` to build and push your Docker images!**
