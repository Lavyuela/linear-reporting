# Automation Setup Summary

## ✅ What Was Configured

### 1. Daily Email Reports with Visual Charts
- **Recipient**: ivy@purpleelephant.ventures
- **Schedule**: Every day at 5:00 PM (Israel time - GMT+3)
- **Content**: 
  - 📊 **4 Visual Charts**: Status distribution, progress overview, team comparison, deadline tracking
  - Project statistics, team progress, active projects, and recently completed work
  - Color-coded alerts for overdue and urgent projects

### 2. Files Created

#### `scheduler.js`
- Node.js script using `node-cron` for scheduling
- Runs `send-report.js` daily at 5:00 PM
- Configured for Israel timezone (Asia/Jerusalem)

#### `setup-scheduler.ps1`
- PowerShell script to create Windows Task Scheduler entry
- Sets up the scheduler to run automatically at system startup
- Includes error handling and auto-restart on failure

#### `SCHEDULER-SETUP.md`
- Complete documentation for scheduler setup
- Troubleshooting guide
- Instructions for customizing schedule times

### 3. Package Updates
- Added `node-cron` dependency to `package.json`
- Added `scheduler` script: `npm run scheduler`

## 🚀 How to Start the Automation

### Option A: Windows Task Scheduler (Recommended - Runs in Background)

1. **Setup** (one-time, requires admin):
   ```powershell
   powershell -ExecutionPolicy Bypass -File setup-scheduler.ps1
   ```

2. **Start**:
   ```powershell
   Start-ScheduledTask -TaskName "LinearReportScheduler"
   ```

3. **Verify**:
   ```powershell
   Get-ScheduledTask -TaskName "LinearReportScheduler" | Select-Object State
   ```

### Option B: Manual Start (Terminal Must Stay Open)

```bash
npm run scheduler
```

## 📧 Test Email Report

To test immediately without waiting for 5 PM:

```bash
node send-report.js ivy@purpleelephant.ventures
```

**Result**: ✅ Test email sent successfully on 2025-10-06

## 📋 What the Report Includes

### 📊 Visual Charts (NEW!)

1. **Project Status Distribution** (Doughnut Chart)
   - Active, Completed, Canceled, Paused breakdown
   - Color-coded for quick identification

2. **Project Progress Distribution** (Bar Chart)
   - Groups projects by progress ranges (0-20%, 21-40%, etc.)
   - Red to green color coding

3. **Team Project Progress** (Bar Chart)
   - Active vs completed projects per team
   - Side-by-side comparison

4. **Upcoming Project Deadlines** (Horizontal Bar)
   - Top 10 nearest deadlines
   - Color-coded by urgency (overdue, due soon, normal)

### 📈 Detailed Statistics

1. **Project Overview**
   - Total projects count
   - Active projects count
   - Overall completion rate

2. **Team Statistics**
   - Projects per team
   - Active vs completed breakdown
   - Team completion rates

3. **Active Projects Table**
   - Project name with status emoji
   - Current state
   - Progress bar with percentage
   - Start and target dates
   - Days remaining/overdue

4. **Recently Completed Projects**
   - Last 5 completed projects
   - Same details as active projects

5. **Local Backup**
   - HTML file saved as `linear-report-YYYY-MM-DD.html`

## 🔧 Customization Options

### Change Schedule Time

Edit `scheduler.js` line 12:

```javascript
// Current: Daily at 5:00 PM
cron.schedule('0 17 * * *', () => { ... });

// Examples:
cron.schedule('0 9 * * *', ...);   // 9:00 AM daily
cron.schedule('0 12 * * *', ...);  // 12:00 PM daily
cron.schedule('0 9 * * 1', ...);   // 9:00 AM every Monday
```

### Change Recipient

Edit `scheduler.js` line 16:

```javascript
const recipient = 'different@email.com';
```

Or pass as argument when running manually:

```bash
node send-report.js different@email.com
```

### Change Timezone

Edit `scheduler.js` line 31:

```javascript
timezone: "America/New_York"  // EST/EDT
timezone: "Europe/London"     // GMT/BST
timezone: "Asia/Tokyo"        // JST
```

## 🛠️ Management Commands

```powershell
# Check status
Get-ScheduledTask -TaskName "LinearReportScheduler"

# Start
Start-ScheduledTask -TaskName "LinearReportScheduler"

# Stop
Stop-ScheduledTask -TaskName "LinearReportScheduler"

# Remove
Unregister-ScheduledTask -TaskName "LinearReportScheduler" -Confirm:$false

# View logs
# Open Task Scheduler → LinearReportScheduler → History tab
```

## ✅ Current Status

- ✅ Scheduler script created
- ✅ Dependencies installed (`node-cron`, `chartjs-node-canvas`)
- ✅ Setup script created
- ✅ Documentation complete
- ✅ **Enhanced with 4 visual charts**
- ✅ Test email sent successfully with charts
- ⏳ Awaiting Windows Task Scheduler setup (run setup-scheduler.ps1)

## 📝 Next Steps

1. **Run the setup script** to create the Windows scheduled task:
   ```powershell
   powershell -ExecutionPolicy Bypass -File setup-scheduler.ps1
   ```

2. **Start the task**:
   ```powershell
   Start-ScheduledTask -TaskName "LinearReportScheduler"
   ```

3. **Verify it's running**:
   ```powershell
   Get-ScheduledTask -TaskName "LinearReportScheduler" | Select-Object State
   ```
   Should show: `State: Running`

4. **Wait for 5:00 PM** or test manually:
   ```bash
   node send-report.js ivy@purpleelephant.ventures
   ```

## 📞 Support

For issues or questions, refer to:
- `SCHEDULER-SETUP.md` - Detailed setup and troubleshooting
- `README.md` - General project documentation
- `send-report.js` - Email report script source code
- `scheduler.js` - Scheduler configuration
