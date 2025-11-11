# Team-Based Email Reports

## Overview

The system now sends **separate email reports for each team** plus one **overall report**, giving you granular insights into each team's performance.

## What You'll Receive Daily at 5:00 PM (Kenya Time)

### 1. Overall Report
- **Subject**: `📊 Overall Project Report - YYYY-MM-DD`
- **Contains**: All projects across all teams
- **Statistics**: Total projects, active, completed, completion rate
- **Charts**: Status distribution, progress distribution
- **Table**: Top 10 active projects with progress and deadlines

### 2. Individual Team Reports (One per team)
- **Subject**: `📊 [Team Name] Team Report - YYYY-MM-DD`
- **Contains**: Only projects assigned to that specific team
- **Statistics**: Team-specific metrics
- **Charts**: Team-specific status and progress charts
- **Table**: Active projects for that team only

## Current Teams

Based on your Linear workspace, you'll receive reports for:
1. **Kijani Supplies PEV**
2. **Swoop Africa**
3. **Join Africa**
4. **Zafari**

**Total emails per day: 5** (1 overall + 4 team reports)

## Features

### Each Report Includes:
- ✅ **Summary Statistics**
  - Total projects
  - Active projects
  - Completed projects
  - Completion rate percentage

- ✅ **Visual Charts**
  - Project status distribution (doughnut chart)
  - Progress distribution (bar chart)

- ✅ **Active Projects Table**
  - Project name with status emoji
  - Progress bar with percentage
  - Target date
  - Days remaining/overdue with color coding:
    - 🚨 Red: Overdue
    - ⚠️ Orange: Due within 7 days
    - 🔄 Blue: On track

### Smart Features:
- **Automatic team filtering**: Only projects assigned to each team
- **Empty team handling**: Teams with no projects are skipped
- **Rate limiting**: 2-second delay between emails to avoid spam filters
- **Professional formatting**: Clean, modern HTML design

## Testing

To test the reports immediately (without waiting for 5 PM):

```bash
node send-team-reports.js ivy@purpleelephant.ventures
```

This will send all reports (overall + team reports) right away.

## Scheduling

The reports are automatically sent daily at **5:00 PM Kenya Time (EAT)** via:
- Windows Task Scheduler (auto-starts on boot)
- Cron job running in the background

## Files

- **`send-team-reports.js`**: Main script that generates and sends all reports
- **`scheduler.js`**: Cron scheduler that runs daily at 5 PM
- **`send-report.js`**: Original single report script (still available)

## Customization

### Change Recipients
Edit the email address in `scheduler.js`:
```javascript
const recipient = 'your-email@example.com';
```

### Change Schedule Time
Edit the cron expression in `scheduler.js`:
```javascript
// Current: 5:00 PM
cron.schedule('0 17 * * *', () => {

// Examples:
// 9:00 AM: '0 9 * * *'
// 12:00 PM: '0 12 * * *'
// 6:00 PM: '0 18 * * *'
```

### Modify Report Content
Edit `send-team-reports.js`:
- `generateEmailHtml()`: Change HTML template
- `generateStatusChart()`: Modify status chart
- `generateProgressChart()`: Modify progress chart

## Benefits

### For Team Leaders:
- Focus on your team's projects only
- Track team-specific metrics
- Identify team bottlenecks quickly

### For Executives:
- Overall report shows company-wide status
- Compare team performance side-by-side
- Spot cross-team issues

### For Everyone:
- Less noise - see only what matters to you
- Better organization - separate emails per team
- Historical tracking - save emails by team

## Troubleshooting

### Not receiving emails?
1. Check spam folder
2. Verify scheduler is running: `Get-Process -Name node`
3. Test manually: `node send-team-reports.js your-email@example.com`

### Missing team reports?
- Teams with no projects are automatically skipped
- Check if projects are assigned to teams in Linear

### Want to go back to single report?
Edit `scheduler.js` and change:
```javascript
const scriptPath = path.join(__dirname, 'send-report.js');
```

## Success!

You should now receive **5 emails daily at 5 PM**:
1. Overall company report
2. Kijani Supplies PEV team report
3. Swoop Africa team report
4. Join Africa team report
5. Zafari team report

Each email is tailored to show only relevant projects and metrics! 📊✨
