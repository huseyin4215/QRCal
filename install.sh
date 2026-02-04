#!/bin/bash

# Qnnect Installation Script
# Run this script on your server via Termius after SSH connection

set -e  # Exit on error

echo "🚀 Qnnect Installation Script"
echo "============================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="${APP_DIR:-/var/www/qnnect}"
NODE_VERSION="18"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}Warning: Not running as root. Some commands may require sudo.${NC}"
fi

echo -e "${BLUE}Step 1/15: Updating system packages...${NC}"
sudo apt-get update -qq
sudo apt-get upgrade -y -qq

echo -e "${BLUE}Step 2/15: Installing Node.js ${NODE_VERSION}...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash - > /dev/null 2>&1
    sudo apt-get install -y nodejs > /dev/null 2>&1
else
    echo -e "${GREEN}Node.js already installed: $(node --version)${NC}"
fi

echo -e "${BLUE}Step 3/15: Installing Git...${NC}"
sudo apt-get install -y git > /dev/null 2>&1

echo -e "${BLUE}Step 4/15: Installing MongoDB...${NC}"
if ! command -v mongod &> /dev/null; then
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add - > /dev/null 2>&1
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list > /dev/null
    sudo apt-get update -qq > /dev/null 2>&1
    sudo apt-get install -y mongodb-org > /dev/null 2>&1
    sudo systemctl enable mongod > /dev/null 2>&1
    sudo systemctl start mongod > /dev/null 2>&1
    echo -e "${GREEN}MongoDB installed and started${NC}"
else
    echo -e "${GREEN}MongoDB already installed${NC}"
    sudo systemctl start mongod > /dev/null 2>&1 || true
fi

echo -e "${BLUE}Step 5/15: Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2 > /dev/null 2>&1
    echo -e "${GREEN}PM2 installed${NC}"
else
    echo -e "${GREEN}PM2 already installed${NC}"
fi

echo -e "${BLUE}Step 6/15: Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    sudo apt-get install -y nginx > /dev/null 2>&1
    echo -e "${GREEN}Nginx installed${NC}"
else
    echo -e "${GREEN}Nginx already installed${NC}"
fi

echo -e "${BLUE}Step 7/15: Creating application directory...${NC}"
sudo mkdir -p ${APP_DIR}
sudo chown -R $USER:$USER ${APP_DIR}

echo -e "${BLUE}Step 8/15: Cloning repository...${NC}"
if [ -d "${APP_DIR}/.git" ]; then
    echo -e "${YELLOW}Repository already exists. Pulling latest changes...${NC}"
    cd ${APP_DIR}
    git pull origin main
else
    cd ${APP_DIR}
    git clone https://github.com/huseyin4215/QRCal.git . > /dev/null 2>&1
    echo -e "${GREEN}Repository cloned${NC}"
fi

echo -e "${BLUE}Step 9/15: Installing frontend dependencies...${NC}"
npm install --silent

echo -e "${BLUE}Step 10/15: Installing backend dependencies...${NC}"
cd backend
npm install --silent
cd ..

echo -e "${BLUE}Step 11/15: Creating environment files...${NC}"
if [ ! -f "${APP_DIR}/.env" ]; then
    cat > ${APP_DIR}/.env << 'ENVEOF'
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
ENVEOF
    echo -e "${YELLOW}Frontend .env created. Please update with your values.${NC}"
else
    echo -e "${GREEN}Frontend .env already exists${NC}"
fi

if [ ! -f "${APP_DIR}/backend/.env" ]; then
    cat > ${APP_DIR}/backend/.env << 'ENVEOF'
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/qnnect
JWT_SECRET=change-this-to-a-random-secret-key
JWT_EXPIRE=30d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://your-domain.com/api/google/callback

# Frontend URL
FRONTEND_URL=http://your-domain.com

# Session Secret
SESSION_SECRET=change-this-to-a-random-secret-key
ENVEOF
    echo -e "${YELLOW}Backend .env created. Please update with your values.${NC}"
else
    echo -e "${GREEN}Backend .env already exists${NC}"
fi

echo -e "${BLUE}Step 12/15: Building frontend...${NC}"
npm run build

echo -e "${BLUE}Step 13/15: Creating PM2 ecosystem file...${NC}"
cat > ${APP_DIR}/ecosystem.config.js << 'PM2EOF'
module.exports = {
  apps: [
    {
      name: 'qnnect-backend',
      script: './backend/server.js',
      cwd: '/var/www/qnnect',
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
PM2EOF

echo -e "${BLUE}Step 14/15: Creating logs directory...${NC}"
mkdir -p ${APP_DIR}/logs

echo -e "${BLUE}Step 15/15: Starting application with PM2...${NC}"
cd ${APP_DIR}
pm2 delete qnnect-backend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# Setup PM2 startup
STARTUP_CMD=$(pm2 startup | grep -o 'sudo.*' || echo "")
if [ ! -z "$STARTUP_CMD" ]; then
    echo -e "${YELLOW}Run this command to enable PM2 startup:${NC}"
    echo -e "${GREEN}$STARTUP_CMD${NC}"
fi

echo ""
echo -e "${GREEN}✅ Installation completed successfully!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Update environment files:"
echo "   - ${APP_DIR}/.env"
echo "   - ${APP_DIR}/backend/.env"
echo ""
echo "2. Configure Nginx (see DEPLOYMENT.md)"
echo ""
echo "3. Check application status:"
echo "   ${GREEN}pm2 status${NC}"
echo "   ${GREEN}pm2 logs qnnect-backend${NC}"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  pm2 status              - Check application status"
echo "  pm2 logs qnnect-backend - View logs"
echo "  pm2 restart qnnect-backend - Restart application"
echo "  pm2 stop qnnect-backend    - Stop application"
echo ""

