# Linear Project Reporting Dashboard

A simple dashboard that shows project progress from Linear with email reporting capabilities.

## Quick Start Guide

### Step 1: Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install && cd ..
```

### Step 2: Configure

Create a `.env` file in the root directory with your Linear API key:

```
LINEAR_API_KEY=your_linear_api_key
PORT=5001
```

> **Important**: Use port 5001 as port 5000 may be in use by other applications.

### Step 3: Start the Application

```bash
# Start backend (from the root directory)
node server.js

# In a new terminal, start frontend
cd client && npm start
```

The dashboard will open automatically in your browser at http://localhost:3000 (or another port if 3000 is in use).

### Step 4: Send Email Reports

To send a project summary email:

```bash
node send-report.js ivy@purpleelephant.ventures
```

## Features

- **Dashboard**: View all projects with progress indicators
- **Filtering**: Filter projects by status or team
- **Project Details**: Detailed view with issue breakdown and charts
- **Email Reports**: Send summarized project reports via email with visual charts
- **Power BI Integration**: Export data for advanced analytics and custom dashboards
- **Automated Scheduling**: Daily email reports at 5 PM
- **Sorting**: Projects are sorted with ongoing projects with upcoming deadlines first

## API Endpoints

- `GET /api/health`: Health check endpoint
- `GET /api/test-connection`: Test Linear API connection
- `GET /api/teams`: Get all teams
- `GET /api/projects`: Get all projects
- `GET /api/projects/:projectId`: Get detailed project information
- `GET /api/projects/:projectId/summary`: Get project summary statistics
- `GET /api/powerbi/data`: Get all data for Power BI (combined)
- `GET /api/powerbi/projects`: Get projects data for Power BI
- `GET /api/powerbi/issues`: Get issues data for Power BI
- `GET /api/powerbi/teams`: Get teams data for Power BI
- `GET /api/powerbi/metrics`: Get summary metrics for Power BI

## Email Reports

Send project summary reports via email with **visual charts and insights**:

```bash
# Send to default recipient (ivy@purpleelephant.ventures)
node send-report.js

# Or specify a different recipient
node send-report.js someone@example.com
```

### 📊 What's Included

The report includes:
- **4 Visual Charts**: Status distribution, progress overview, team comparison, upcoming deadlines
- **Project Statistics**: Total, active, and completion rates
- **Team Progress**: Detailed breakdown per team
- **Active Projects**: With progress bars and deadline tracking
- **Recently Completed**: Last 5 completed projects
- **Color-Coded Alerts**: 🚨 Overdue, ⚠️ Due Soon, 🔄 In Progress, ✅ Completed

A local HTML copy is also saved as `linear-report-YYYY-MM-DD.html`.

For detailed information about charts and insights, see [EMAIL-REPORT-FEATURES.md](EMAIL-REPORT-FEATURES.md).

## Automated Daily Reports

Set up automated daily email reports sent at 5:00 PM:

### Quick Setup (Windows Task Scheduler)

```powershell
# Run the setup script (requires administrator privileges)
powershell -ExecutionPolicy Bypass -File setup-scheduler.ps1

# Start the scheduled task
Start-ScheduledTask -TaskName "LinearReportScheduler"
```

### Manual Start (Terminal Must Stay Open)

```bash
npm run scheduler
```

The scheduler will automatically send reports to `ivy@purpleelephant.ventures` every day at 5:00 PM (Israel time).

For detailed setup instructions, troubleshooting, and schedule customization, see [SCHEDULER-SETUP.md](SCHEDULER-SETUP.md).

## Power BI Analytics

Export Linear data to Power BI for advanced analytics and custom dashboards:

### Quick Export

```bash
npm run export-powerbi
```

This creates JSON and CSV files in `./powerbi-export/` folder with:
- **Projects**: 34 records with progress, deadlines, and team assignments
- **Issues**: 250 records with states, estimates, and assignments
- **Teams**: Team information and statistics
- **Metrics**: Summary metrics and KPIs

### Live API Connection

Connect Power BI directly to live data:
- `http://localhost:5001/api/powerbi/data` - All data combined
- `http://localhost:5001/api/powerbi/projects` - Projects only
- `http://localhost:5001/api/powerbi/issues` - Issues only
- `http://localhost:5001/api/powerbi/teams` - Teams only
- `http://localhost:5001/api/powerbi/metrics` - Summary metrics

### What You Can Analyze

- **Project Health**: Track progress, deadlines, and completion rates
- **Team Performance**: Compare workloads and productivity across teams
- **Issue Tracking**: Analyze cycle time, velocity, and bottlenecks
- **Trend Analysis**: Historical data for forecasting and planning
- **Custom Dashboards**: Build your own visualizations and reports

For complete setup guide, sample dashboards, and DAX measures, see [POWERBI-INTEGRATION.md](POWERBI-INTEGRATION.md).

## Deployment & Security

### Quick Deploy

The application can be deployed to Heroku, Netlify, or Vercel.

```bash
# Example for Heroku
git init
heroku create
heroku config:set LINEAR_API_KEY=your_api_key
git add .
git commit -m "Initial commit"
git push heroku main
```

### Security Notes

- API key is stored in server environment variables only
- All Linear API requests are proxied through the backend
- CORS is configured to restrict API access
