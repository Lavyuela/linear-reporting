# Automated Email Scheduler Setup Guide

##  Automated Email Reports

The scheduler sends daily email reports at **5:00 PM (17:00) Israel time** to `ivy@purpleelephant.ventures`.

##  Quick Setup (Windows Task Scheduler)

### Option 1: Automatic Setup (Recommended)

1. **Right-click PowerShell** and select **"Run as Administrator"**
2. Navigate to the project folder:
   ```powershell
   cd "c:\Users\Admin\Downloads\linear-reporting\linear-reporting"
   ```
3. Allow script execution (if needed):
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
4. Run the setup script:
   ```powershell
   .\setup-task-scheduler.ps1
   ```

This will:
- Create a Windows Task Scheduler task
- Start the scheduler automatically on Windows startup
- Keep it running in the background

### Option 2: Manual Task Scheduler Setup

1. Open **Task Scheduler** (Press `Win + R`, type `taskschd.msc`, press Enter)
2. Click **"Create Task"** in the right panel
3. **General Tab:**
   - Name: `Linear Report Scheduler`
   - Description: `Sends daily Linear project reports at 5 PM`
   - Select: "Run only when user is logged on"
4. **Triggers Tab:**
   - Click "New"
   - Begin the task: "At startup"
   - Click OK
5. **Actions Tab:**
   - Click "New"
   - Action: "Start a program"
   - Program/script: `cmd.exe`
   - Add arguments: `/c "c:\Users\Admin\Downloads\linear-reporting\linear-reporting\start-scheduler.bat"`
   - Start in: `c:\Users\Admin\Downloads\linear-reporting\linear-reporting`
   - Click OK
6. **Settings Tab:**
   - Check: "Allow task to be run on demand"
   - Check: "Run task as soon as possible after a scheduled start is missed"
   - Check: "If the task fails, restart every: 1 minute"
   - Attempt to restart up to: 3 times
7. Click **OK** to save

##  Start Scheduler Now

To start the scheduler immediately:

**Option A: Double-click**
```
start-scheduler.bat
```

**Option B: Command line**
```bash
npm run scheduler
```

##  What Gets Sent

The daily email report includes:
- **Project Overview**: Total projects, active count, completion rate
- **4 Visual Charts**:
  - Project Status Distribution (Doughnut Chart)
  - Project Progress Distribution (Bar Chart)  
  - Team Progress (Bar Chart)
  - Upcoming Deadlines (Horizontal Bar Chart)
- **Team Statistics Table**: Per-team breakdown
- **Active Projects List**: All ongoing projects with progress
- **Recently Completed Projects**: Last 5 completed

##  Schedule Details

- **Time**: 5:00 PM (17:00) daily
- **Timezone**: Asia/Jerusalem (GMT+3)
- **Recipient**: ivy@purpleelephant.ventures
- **Format**: HTML email with embedded PNG charts

##  Verify It's Running

### Check Task Scheduler:
1. Open Task Scheduler (`taskschd.msc`)
2. Look for "Linear Report Scheduler"
3. Check "Status" column - should say "Running" or "Ready"
4. Check "Last Run Time" and "Last Run Result"

### Check Running Processes:
```powershell
Get-Process -Name node
```

##  Troubleshooting

### Email Not Received?

1. **Check if scheduler is running:**
   ```powershell
   Get-Process -Name node
   ```

2. **Test email manually:**
   ```bash
   node send-report.js ivy@purpleelephant.ventures
   ```
   Check console for errors

3. **Check spam folder** in Gmail

4. **Verify Linear API key** in `.env` file:
   ```
   LINEAR_API_KEY=lin_api_...
   ```

5. **Check email credentials** in `send-report.js` (already configured)

### Scheduler Not Starting?

1. **Verify Node.js is installed:**
   ```bash
   node --version
   ```

2. **Verify dependencies are installed:**
   ```bash
   npm install
   ```

3. **Run manually to see errors:**
   ```bash
   npm run scheduler
   ```

4. **Check console output** for error messages

### Task Scheduler Issues?

1. **Run PowerShell as Administrator** when setting up
2. **Check Task Scheduler History** tab for errors
3. **Verify file paths** are correct in the action
4. **Try running the batch file manually** first

##  Files Created

- `start-scheduler.bat` - Batch file to start scheduler
- `start-scheduler.ps1` - PowerShell script to start scheduler  
- `setup-task-scheduler.ps1` - Automated Task Scheduler setup
- `scheduler.js` - Main scheduler with cron job
- `send-report.js` - Email report generator

##  Changing the Schedule Time

To change the email time, edit `scheduler.js`:

```javascript
// Current: 5:00 PM (17:00)
cron.schedule('0 17 * * *', () => {
  // ...
});

// Examples:
// 9:00 AM: '0 9 * * *'
// 12:00 PM: '0 12 * * *'
// 6:00 PM: '0 18 * * *'
// Every hour: '0 * * * *'
```

Then restart the scheduler.

##  Success Indicators

You'll know it's working when:
-  Task shows "Running" in Task Scheduler
-  Node process is visible in Task Manager
-  Email arrives daily at 5:00 PM
-  Console shows: "Scheduler is running. Press Ctrl+C to stop."
-  Test email sent successfully

##  All Set!

The scheduler is now configured to run automatically and send daily reports at 5 PM!(GMT+3)
