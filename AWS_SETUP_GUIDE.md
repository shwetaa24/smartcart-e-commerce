# SwiftCart AWS Infrastructure Setup Guide

This guide outlines the steps to configure AWS EC2 and RDS for the production-ready SwiftCart application.

## 1. AWS RDS Setup (PostgreSQL)

### A. Create RDS Instance
1. Go to **RDS Console** -> **Create Database**.
2. **Engine Options**: PostgreSQL.
3. **Templates**: Free Tier (for dev) or Production.
4. **Settings**:
   - DB instance identifier: `swiftcart-db`
   - Master username: `postgres`
   - Master password: `[YOUR_SECURE_PASSWORD]`
5. **Connectivity**:
   - Public access: No (Keep it private for security).
   - VPC Security Group: Create new (e.g., `swiftcart-rds-sg`).
6. **Additional Configuration**:
   - Initial database name: `swiftcart`.

### B. Security Group Configuration
- Edit `swiftcart-rds-sg` Inbound rules:
  - Add rule: Type `PostgreSQL`, Port `5432`, Source `[EC2-Security-Group-ID]`.

---

## 2. AWS EC2 Setup (Application Server)

### A. Launch Instance
1. Go to **EC2 Console** -> **Launch Instance**.
2. **AMI**: Ubuntu Server 22.04 LTS.
3. **Instance Type**: t2.micro (Free Tier) or larger.
4. **Security Group**: Create `swiftcart-ec2-sg`.
   - Inbound Rules:
     - SSH (Port 22): My IP.
     - HTTP (Port 80): Anywhere.
     - Backend (Port 5000): If needed (usually accessed via frontend/nginx).

### B. Configure EC2 Environment
SSH into your instance and run:
```bash
# Update and install Docker
sudo apt-get update
sudo apt-get install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ubuntu

# Create project directory
mkdir ~/swiftcart
cd ~/swiftcart

# Create .env for Backend on EC2
cat <<EOF > .env
DB_USER=postgres
DB_PASSWORD=[YOUR_RDS_PASSWORD]
DB_HOST=[YOUR_RDS_ENDPOINT]
DB_NAME=swiftcart
DB_PORT=5432
NODE_ENV=production
EOF
```

---

## 3. GitHub Actions Secrets
Add the following secrets to your GitHub Repository (**Settings -> Secrets and variables -> Actions**):

- `DOCKERHUB_USERNAME`: Your Docker Hub username.
- `DOCKERHUB_TOKEN`: Your Docker Hub Access Token.
- `EC2_HOST`: The Public IPv4 address of your EC2.
- `EC2_USERNAME`: `ubuntu`.
- `EC2_SSH_KEY`: Your private key content (`.pem` file).

---

## 4. Local Deployment
To run locally for testing:
```bash
docker-compose up --build
```
The frontend will be available at `http://localhost`.
