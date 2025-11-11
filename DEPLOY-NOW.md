# Deploy to Digital Ocean - Quick Start

## Method 1: App Platform (Easiest - 10 minutes)

### Step 1: Push to GitHub
```bash
cd c:\Users\Admin\Downloads\linear-reporting\linear-reporting

# Initialize git
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/linear-reporting.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Digital Ocean
1. Go to: https://cloud.digitalocean.com/apps
2. Click **"Create App"**
3. Choose **"GitHub"** as source
4. Select your **linear-reporting** repository
5. Click **"Next"**

### Step 3: Configure App
**Web Service:**
- Name: `linear-web`
- Build Command: `npm install && cd client && npm install && npm run build`
- Run Command: `node server.js`
- HTTP Port: `5001`

**Worker Service (for scheduler):**
- Name: `linear-scheduler`
- Build Command: `npm install`
- Run Command: `node scheduler-periodic.js`

### Step 4: Add Environment Variables
Click **"Edit"** next to environment variables and add:
```
LINEAR_API_KEY=your_linear_api_key_here
NODE_ENV=production
```

### Step 5: Choose Plan
- **Basic**: $5/month (512MB RAM) - Good for start
- **Professional**: $12/month (1GB RAM) - Recommended

### Step 6: Deploy
- Click **"Create Resources"**
- Wait 5-10 minutes
- Your app will be live at: `https://linear-reporting-xxxxx.ondigitalocean.app`

## Method 2: Droplet (More Control - 30 minutes)

### Step 1: Create Droplet
1. Go to: https://cloud.digitalocean.com/droplets
2. Click **"Create Droplet"**
3. Choose:
   - Ubuntu 22.04 LTS
   - Basic - $6/month (1GB RAM)
   - Frankfurt datacenter
   - Add your SSH key

### Step 2: Connect & Setup
```bash
# Connect
ssh root@YOUR_DROPLET_IP

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2
npm install -g pm2

# Clone your repo
cd /var/www
git clone https://github.com/YOUR_USERNAME/linear-reporting.git
cd linear-reporting

# Install dependencies
npm install
cd client && npm install && npm run build && cd ..

# Create .env file
nano .env
```

Add to .env:
```
LINEAR_API_KEY=your_linear_api_key_here
NODE_ENV=production
PORT=5001
```

### Step 3: Start Services
```bash
# Start web server
pm2 start server.js --name linear-web

# Start scheduler
pm2 start scheduler-periodic.js --name linear-scheduler

# Save and auto-start
pm2 save
pm2 startup
```

### Step 4: Configure Firewall
```bash
ufw allow 22
ufw allow 80
ufw allow 5001
ufw enable
```

## Quick Commands

### Test Before Deploying
```bash
# Test reports locally
npm run report:weekly
npm run report:monthly

# Test server
npm start
```

### After Deployment
```bash
# Check status (Droplet)
pm2 status
pm2 logs

# Restart services
pm2 restart all

# Update code
git pull
npm install
pm2 restart all
```

## Costs
- **App Platform**: $5-12/month
- **Droplet**: $6/month
- **Domain** (optional): $12/year

## Support
- Digital Ocean Docs: https://docs.digitalocean.com
- Support Tickets: https://cloud.digitalocean.com/support

---

**Recommended: Use App Platform for easiest deployment!**
