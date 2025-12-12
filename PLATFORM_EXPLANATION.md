# Why ARM64 vs linux/amd64 - MacBook Explanation

## 🍎 The Issue

**Your MacBook:** Apple Silicon (M1/M2/M3) = ARM64 architecture
**AWS ECS Fargate:** Runs on linux/amd64 (x86_64) architecture

When you build Docker images on your MacBook, Docker builds them for your native architecture (ARM64) by default. But ECS Fargate needs linux/amd64 images.

## 🔍 How to Check Your Mac Architecture

```bash
# Check your Mac's architecture
uname -m
# Output: arm64 (Apple Silicon) or x86_64 (Intel Mac)
```

## ✅ Solution: Build for linux/amd64

The `deploy.sh` script has been updated to build for the correct platform using `--platform linux/amd64` flag.

### What This Does

```bash
docker build --platform linux/amd64 -t grocerystore-$SERVICE .
```

This tells Docker to:
- Build the image for linux/amd64 architecture
- Even though you're on an ARM64 Mac
- Docker will use emulation (QEMU) to build for the target platform

## ⏱️ Build Time Impact

- **ARM64 build (native):** Faster (~2-3 minutes per service)
- **linux/amd64 build (emulated):** Slower (~5-8 minutes per service)
  - Docker uses emulation, so it takes longer
  - But it's necessary for ECS Fargate compatibility

## 🎯 Alternative Solutions

### Option 1: Use GitHub Actions (Recommended for CI/CD)
- Build images in GitHub Actions (runs on linux/amd64)
- Automatically builds for correct platform
- No emulation needed

### Option 2: Use AWS CodeBuild
- Build images in AWS CodeBuild
- Native linux/amd64 builds
- Faster than local emulation

### Option 3: Use Docker Buildx (Multi-platform)
- Build for multiple platforms at once
- More complex setup

## 📝 Current Solution

For now, the updated `deploy.sh` script will build for linux/amd64 using emulation. It will work, just takes longer.

## ✅ Next Steps

1. Run `./deploy.sh` to rebuild all images for linux/amd64
2. Wait for builds to complete (10-15 minutes)
3. Force new deployments in ECS
4. Tasks should start successfully

---

**The updated deploy.sh script will handle this automatically!**
