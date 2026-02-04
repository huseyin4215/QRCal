#!/bin/bash

# Qnnect Deployment Script
# This script sets up the application on a remote server via SSH

set -e  # Exit on error

echo "🚀 Qnnect Deployment Script"
echo "============================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SERVER_USER="${DEPLOY_USER:-root}"
SERVER_HOST="${DEPLOY_HOST:-}"
SERVER_PORT="${DEPLOY_PORT:-22}"
APP_DIR="${APP_DIR:-/var/www/qnnect}"
NODE_VERSION="18"

# Check if server host is provided
if [ -z "$SERVER_HOST" ]; then
    echo -e "${RED}Error: DEPLOY_HOST environment variable is not set${NC}"
    echo "Usage: DEPLOY_HOST=your-server.com DEPLOY_USER=root ./deploy.sh"
    exit 1
fi

echo -e "${GREEN}Server: ${SERVER_USER}@${SERVER_HOST}:${SERVER_PORT}${NC}"
echo -e "${GREEN}App Directory: ${APP_DIR}${NC}"
echo ""

# Function to run commands on remote server
remote_exec() {
    ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_HOST} "$1"
}

# Function to copy files to remote server
remote_copy() {
    scp -P ${SERVER_PORT} -r "$1" ${SERVER_USER}@${SERVER_HOST}:"$2"
}

echo "📦 Step 1: Installing Node.js and dependencies..."
remote_exec "curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash - && sudo apt-get install -y nodejs"

echo "📦 Step 2: Installing MongoDB..."
remote_exec "wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add - && echo 'deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse' | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list && sudo apt-get update && sudo apt-get install -y mongodb-org"

echo "📦 Step 3: Installing PM2..."
remote_exec "sudo npm install -g pm2"

echo "📦 Step 4: Installing Git..."
remote_exec "sudo apt-get update && sudo apt-get install -y git"

echo "📦 Step 5: Creating application directory..."
remote_exec "sudo mkdir -p ${APP_DIR} && sudo chown -R ${SERVER_USER}:${SERVER_USER} ${APP_DIR}"

echo "📦 Step 6: Cloning repository..."
remote_exec "cd ${APP_DIR} && git clone https://github.com/huseyin4215/QRCal.git . || (cd ${APP_DIR} && git pull)"

echo "📦 Step 7: Installing frontend dependencies..."
remote_exec "cd ${APP_DIR} && npm install"

echo "📦 Step 8: Installing backend dependencies..."
remote_exec "cd ${APP_DIR}/backend && npm install"

echo "📦 Step 9: Setting up environment files..."
echo -e "${YELLOW}Please create .env files manually:${NC}"
echo "  - Frontend: ${APP_DIR}/.env"
echo "  - Backend: ${APP_DIR}/backend/.env"

echo "📦 Step 10: Building frontend..."
remote_exec "cd ${APP_DIR} && npm run build"

echo "📦 Step 11: Starting MongoDB service..."
remote_exec "sudo systemctl enable mongod && sudo systemctl start mongod"

echo "📦 Step 12: Setting up PM2 ecosystem..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'qnnect-backend',
      script: './backend/server.js',
      cwd: '${APP_DIR}',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
EOF

remote_copy "ecosystem.config.js" "${APP_DIR}/ecosystem.config.js"
rm ecosystem.config.js

echo "📦 Step 13: Creating logs directory..."
remote_exec "mkdir -p ${APP_DIR}/logs"

echo "📦 Step 14: Starting application with PM2..."
remote_exec "cd ${APP_DIR} && pm2 start ecosystem.config.js && pm2 save && pm2 startup"

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Create .env files in ${APP_DIR} and ${APP_DIR}/backend"
echo "2. Configure MongoDB connection"
echo "3. Set up reverse proxy (Nginx) if needed"
echo "4. Configure SSL certificates"
echo ""
echo "PM2 Commands:"
echo "  - pm2 status"
echo "  - pm2 logs qnnect-backend"
echo "  - pm2 restart qnnect-backend"
echo "  - pm2 stop qnnect-backend"

