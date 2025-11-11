# Deploy to Digital Ocean

## Prerequisites

- Digital Ocean account
- SSH key configured
- Domain name (optional)

## Deployment Options

### Option 1: Digital Ocean App Platform (Recommended - Easiest)

The App Platform is a fully managed solution that handles deployment, scaling, and SSL automatically.

#### Steps:

1. **Prepare Your Repository**
   ```bash
   # Initialize git if not already done
   git init
   git add .
   git commit -m "Initial commit"
   
   # Push to GitHub (create a repo first)
   git remote add origin https://github.com/yourusername/linear-reporting.git
   git push -u origin main
   ```

2. **Deploy via Digital Ocean Dashboard**
   - Go to https://cloud.digitalocean.com/apps
   - Click "Create App"
   - Choose "GitHub" as source
   - Select your repository
   - Configure:
     - **Name**: linear-reporting
     - **Region**: Choose closest to Kenya (e.g., Frankfurt or London)
     - **Branch**: main
     - **Build Command**: `npm install && cd client && npm install && npm run build`
     - **Run Command**: `npm run scheduler-periodic`

3. **Set Environment Variables**
   In the App Platform dashboard, add:
   ```
   LINEAR_API_KEY=your_linear_api_key_here
   NODE_ENV=production
   PORT=8080
   ```

4. **Configure Resources**
   - Basic Plan: $5/month (512MB RAM, 1 vCPU)
   - Professional Plan: $12/month (1GB RAM, 1 vCPU) - Recommended

5. **Deploy**
   - Click "Create Resources"
   - Wait 5-10 minutes for deployment
   - Your app will be available at: `https://your-app-name.ondigitalocean.app`

#### Cost: $5-12/month

---

### Option 2: Digital Ocean Droplet (More Control)

Deploy on a virtual machine with full control.

#### Steps:

1. **Create Droplet**
   - Go to https://cloud.digitalocean.com/droplets
   - Click "Create Droplet"
   - Choose:
     - **Image**: Ubuntu 22.04 LTS
     - **Plan**: Basic - $6/month (1GB RAM, 1 vCPU)
     - **Region**: Frankfurt or London (closest to Kenya)
     - **Authentication**: SSH Key
     - **Hostname**: linear-reporting

2. **Connect to Droplet**
   ```bash
   ssh root@your_droplet_ip
   ```

3. **Install Node.js**
   ```bash
   # Update system
   apt update && apt upgrade -y
   
   # Install Node.js 18.x
   curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
   apt install -y nodejs
   
   # Verify installation
   node --version
   npm --version
   ```

4. **Install PM2 (Process Manager)**
   ```bash
   npm install -g pm2
   ```

5. **Clone Your Repository**
   ```bash
   cd /var/www
   git clone https://github.com/yourusername/linear-reporting.git
   cd linear-reporting
   ```

6. **Install Dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies and build
   cd client
   npm install
   npm run build
   cd ..
   ```

7. **Configure Environment Variables**
   ```bash
   nano .env
   ```
   
   Add:
   ```
   LINEAR_API_KEY=your_linear_api_key_here
   NODE_ENV=production
   PORT=5001
   ```

8. **Start Services with PM2**
   ```bash
   # Start web server
   pm2 start server.js --name "linear-web"
   
   # Start scheduler
   pm2 start scheduler-periodic.js --name "linear-scheduler"
   
   # Save PM2 configuration
   pm2 save
   
   # Set PM2 to start on boot
   pm2 startup
   ```

9. **Configure Firewall**
   ```bash
   ufw allow 22    # SSH
   ufw allow 80    # HTTP
   ufw allow 443   # HTTPS
   ufw allow 5001  # App
   ufw enable
   ```

10. **Install Nginx (Optional - for domain)**
    ```bash
    apt install -y nginx
    
    # Create Nginx config
    nano /etc/nginx/sites-available/linear-reporting
    ```
    
    Add:
    ```nginx
    server {
        listen 80;
        server_name your-domain.com;
        
        location / {
            proxy_pass http://localhost:5001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```
    
    Enable site:
    ```bash
    ln -s /etc/nginx/sites-available/linear-reporting /etc/nginx/sites-enabled/
    nginx -t
    systemctl restart nginx
    ```

11. **Install SSL Certificate (Optional)**
    ```bash
    apt install -y certbot python3-certbot-nginx
    certbot --nginx -d your-domain.com
    ```

#### Cost: $6/month + optional domain ($12/year)

---

### Option 3: Digital Ocean Kubernetes (Advanced)

For production-grade deployment with auto-scaling.

**Cost**: Starting at $12/month

---

## Recommended: App Platform Deployment

For your use case, I recommend **Option 1 (App Platform)** because:

✅ **Easiest setup** - No server management
✅ **Auto-scaling** - Handles traffic spikes
✅ **Auto-SSL** - Free HTTPS certificate
✅ **Auto-deploy** - Push to GitHub, auto-deploys
✅ **Monitoring** - Built-in logs and metrics
✅ **Backups** - Automatic
✅ **Cost-effective** - $5-12/month

## Quick Start with App Platform

1. **Push code to GitHub**
2. **Connect Digital Ocean to GitHub**
3. **Create App from repository**
4. **Add environment variables**
5. **Deploy!**

Your app will be live at: `https://linear-reporting-xxxxx.ondigitalocean.app`

## Post-Deployment

### Verify Services:

1. **Web Dashboard**: Visit your app URL
2. **Check Logs**: 
   - App Platform: View in dashboard
   - Droplet: `pm2 logs`

3. **Test Reports**:
   ```bash
   # SSH into droplet or use App Platform console
   npm run report:weekly
   ```

### Monitor:

- **App Platform**: Built-in metrics dashboard
- **Droplet**: 
  ```bash
  pm2 monit
  pm2 status
  ```

### Update Deployment:

**App Platform**: Just push to GitHub
```bash
git add .
git commit -m "Update"
git push
```

**Droplet**:
```bash
cd /var/www/linear-reporting
git pull
npm install
cd client && npm install && npm run build && cd ..
pm2 restart all
```

## Troubleshooting

### Scheduler not running?
```bash
# App Platform: Check logs in dashboard
# Droplet:
pm2 logs linear-scheduler
pm2 restart linear-scheduler
```

### Email not sending?
- Check environment variables are set
- Verify Linear API key is correct
- Check email credentials in code

### Out of memory?
- Upgrade to higher plan
- App Platform: Increase resources in settings
- Droplet: Resize droplet

## Cost Summary

| Option | Monthly Cost | Setup Time | Maintenance |
|--------|-------------|------------|-------------|
| App Platform | $5-12 | 10 min | None |
| Droplet | $6+ | 30 min | Low |
| Kubernetes | $12+ | 1 hour | Medium |

## Security Checklist

✅ Environment variables set (not in code)
✅ Firewall configured
✅ SSL certificate installed
✅ Regular updates enabled
✅ SSH key authentication only
✅ Strong passwords
✅ Monitoring enabled

## Next Steps

1. Choose deployment option
2. Follow steps above
3. Test all reports
4. Monitor for 24 hours
5. Set up alerts (optional)

## Support

- Digital Ocean Docs: https://docs.digitalocean.com
- Community: https://www.digitalocean.com/community
- Support: https://cloud.digitalocean.com/support

---

**Ready to deploy? Start with App Platform for the easiest experience!** 🚀
