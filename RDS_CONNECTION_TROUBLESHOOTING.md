# RDS Connection Troubleshooting - Complete Guide

If you're still getting connection timeouts, let's check the RDS configuration and fix it.

## 🔍 Step 1: Verify RDS Configuration

### Check if RDS is Publicly Accessible

1. Go to [RDS Console](https://console.aws.amazon.com/rds/)
2. Select your database: `database-1`
3. Click on **"Connectivity & security"** tab
4. Check these settings:

   **Public access:**
   - Should be **"Publicly accessible: Yes"**
   - If it says "No", you need to modify the database:
     - Click **"Modify"** button
     - Under **"Connectivity"**, expand **"Additional connectivity configuration"**
     - Set **"Public access"** to **"Yes"**
     - Click **"Continue"** → **"Apply immediately"**
     - Wait 5-10 minutes for the change to apply

   **VPC:**
   - Note which VPC it's in (e.g., `vpc-xxxxx`)

   **Subnet group:**
   - Should have subnets in different availability zones

### Check Security Group Rules

1. In the same **"Connectivity & security"** tab
2. Click on the **security group** link (e.g., `sg-xxxxx`)
3. Check **"Inbound rules"**:
   - Should have a rule allowing PostgreSQL (port 5432)
   - Source should be either:
     - Your IP: `107.3.120.70/32`
     - Or: `0.0.0.0/0` (allows from anywhere - less secure but works)
     - Or: A security group ID (for CloudShell/EC2)

## 🔧 Step 2: Fix Common Issues

### Issue 1: RDS Not Publicly Accessible

**Solution:**
1. RDS Console → Select database → **Modify**
2. Under **"Connectivity"** → **"Additional connectivity configuration"**
3. Set **"Public access"** to **"Yes"**
4. **Apply immediately**
5. Wait 5-10 minutes

### Issue 2: Security Group Not Configured

**Solution - Add Rule for Your IP:**
1. RDS Console → Database → **Connectivity & security** → Click security group
2. **Inbound rules** → **Edit inbound rules**
3. **Add rule:**
   - Type: PostgreSQL
   - Port: 5432
   - Source: Custom → `107.3.120.70/32`
   - Description: "My IP"
4. **Save rules**

**Solution - Allow from Anywhere (Less Secure, but Works):**
1. Same steps as above
2. Source: `.0.0/00.0` (allows from anywhere)
3. **Warning:** This is less secure, only use for testing

### Issue 3: CloudShell Can't Connect

If CloudShell also can't connect, the RDS security group needs to allow CloudShell:

1. Find CloudShell's security group:
   - Go to EC2 Console → Security Groups
   - Look for one with "CloudShell" in the name/description
   - Or create a new security group for CloudShell access

2. Add CloudShell security group to RDS:
   - RDS security group → Inbound rules → Add rule
   - Type: PostgreSQL
   - Port: 5432
   - Source: Select the CloudShell security group ID

## 🎯 Alternative Solution: Use AWS Systems Manager Session Manager + EC2

If direct connection isn't working, use an EC2 instance:

### Option A: Use Existing EC2 Instance

If you have an EC2 instance in the same VPC:

1. SSH into EC2 instance
2. Install PostgreSQL client:
   ```bash
   sudo yum install -y postgresql15
   ```
3. Connect:
   ```bash
   psql -h database-1.cnuq0uuoq8b1.us-east-2.rds.amazonaws.com -U postgres -d postgres
   ```

### Option B: Create Temporary EC2 Instance

1. **Launch EC2 Instance:**
   - Go to EC2 Console → Launch Instance
   - AMI: Amazon Linux 2023
   - Instance type: t2.micro (free tier)
   - Same VPC as RDS
   - Security group: Allow SSH (port 22) from your IP
   - Key pair: Create or use existing

2. **Connect via SSH:**
   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-ip
   ```

3. **Install and Connect:**
   ```bash
   sudo yum install -y postgresql15
   psql -h database-1.cnuq0uuoq8b1.us-east-2.rds.amazonaws.com -U postgres -d postgres
   ```

4. **Create databases** (same SQL commands)

5. **Terminate EC2 instance** when done (to save costs)

## 🛠️ Step 3: Verify RDS Endpoint

Make sure you're using the correct endpoint:

1. RDS Console → Your database
2. **Connectivity & security** tab
3. Copy the **"Endpoint"** - should be: `database-1.cnuq0uuoq8b1.us-east-2.rds.amazonaws.com`
4. Make sure you're using the **endpoint**, not the instance identifier

## 🔐 Step 4: Check Database Status

1. RDS Console → Your database
2. Check **"Status"** - should be **"Available"**
3. If it says "Modifying" or "Backing up", wait for it to finish

## ✅ Quick Checklist

Before trying to connect, verify:

- [ ] RDS status is "Available"
- [ ] Public access is "Yes"
- [ ] Security group has inbound rule for port 5432
- [ ] You're using the correct endpoint (not instance ID)
- [ ] You have the correct master password
- [ ] You're using the correct username (usually `postgres`)

## 🚀 Recommended Approach

**For immediate success:**

1. **Make RDS publicly accessible** (if not already)
2. **Add security group rule:** Allow PostgreSQL (5432) from `0.0.0.0/0` (temporarily, for testing)
3. **Wait 5-10 minutes** for changes to apply
4. **Try connecting again**

**After creating databases, tighten security:**
- Change security group rule from `0.0.0.0/0` to your specific IP `107.3.120.70/32`
- Or remove public access if you'll only connect from EC2/CloudShell

## 📞 Still Not Working?

If none of these work, check:

1. **RDS is in the correct region** (us-east-2 based on your endpoint)
2. **No network ACLs blocking traffic**
3. **RDS subnet group has public subnets** (if using public access)
4. **Try from a different network** (your IP might be blocked)

Let me know which step you're stuck on and I can help further!
