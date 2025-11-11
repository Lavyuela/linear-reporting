# Periodic Reports System

## Overview

Comprehensive reporting system that sends **Weekly, Monthly, Quarterly, and Yearly** reports in addition to daily team reports.

## Report Types

### 1. Daily Team Reports (5:00 PM Kenya Time)
- **Overall Report** - All 35 projects with 4 charts
- **Team Reports** - Individual reports for each team (4 teams)
- **Total**: 5 emails daily

### 2. Weekly Report (Every Friday, 5:00 PM Kenya Time)
- **Period**: Monday to Friday (current work week)
- **Frequency**: Every Friday at end of work week
- **Charts**: 3 advanced analytics charts with daily breakdown (Mon-Fri)

### 3. Monthly Report (Last Day of Month, 5:00 PM Kenya Time)
- **Period**: Full current month (1st to last day)
- **Frequency**: Last day of each month (28th, 29th, 30th, or 31st)
- **Charts**: 3 advanced analytics charts
- **Example**: November report covers Nov 1-30

### 4. Quarterly Report (Last Day of Quarter, 5:00 PM Kenya Time)
- **Period**: Full current quarter (3 months)
- **Frequency**: March 31, June 30, September 30, December 31
- **Charts**: 3 advanced analytics charts
- **Example**: Q4 report covers Oct 1 - Dec 31

### 5. Yearly Report (December 31st, 5:00 PM Kenya Time)
- **Period**: Full calendar year (Jan 1 - Dec 31)
- **Frequency**: December 31st annually
- **Charts**: 3 advanced analytics charts
- **Example**: 2025 report covers Jan 1 - Dec 31, 2025

## What Each Periodic Report Includes

### 📊 Key Metrics
- **Total Projects**: Overall project count
- **Created This Period**: New projects started
- **Completed This Period**: Projects finished
- **Currently Active**: Projects in progress
- **Overall Completion Rate**: Percentage of all completed projects

### 📈 Charts

#### 1. Activity Trend Chart (Line Chart)
Shows project creation vs completion over time:
- **Weekly**: Day-by-day breakdown (Mon, Tue, Wed, Thu, Fri)
- **Monthly**: Week-by-week breakdown (4 weeks)
- **Quarterly**: Month-by-month breakdown (3 months)
- **Yearly**: Month-by-month breakdown (12 months)

**Insights:**
- Green line = Projects completed
- Blue line = Projects created
- Helps identify productivity trends and patterns

#### 2. Team Performance Comparison (Bar Chart)
Shows how each team performed during the period:
- **Green bars**: Projects completed by team
- **Blue bars**: Projects created by team

**Insights:**
- Which teams are most productive
- Which teams are starting vs finishing projects
- Team workload distribution

#### 3. Current Progress Distribution (Bar Chart)
Shows where all projects currently stand:
- 0-20% (Red): Just started
- 21-40% (Orange): Early stage
- 41-60% (Orange): Mid-stage
- 61-80% (Blue): Near completion
- 81-100% (Green): Almost done

### 📋 Completed Projects Table
Lists all projects completed during the period with:
- Project name
- Completion date
- Team assignment

## Testing Reports Manually

You can test any report type immediately:

```bash
# Weekly report
npm run report:weekly

# Monthly report
npm run report:monthly

# Quarterly report
npm run report:quarterly

# Yearly report
npm run report:yearly

# Daily team reports
npm run report:daily
```

Or use the full command:
```bash
node send-periodic-reports.js your-email@example.com weekly
node send-periodic-reports.js your-email@example.com monthly
node send-periodic-reports.js your-email@example.com quarterly
node send-periodic-reports.js your-email@example.com yearly
```

## Automated Scheduling

### Option 1: Use the Combined Scheduler (Recommended)

Run the periodic scheduler that handles ALL reports:

```bash
npm run scheduler-periodic
```

This will automatically send:
- ✅ Daily team reports at 5:00 PM
- ✅ Weekly reports every Friday at 5:00 PM
- ✅ Monthly reports on last day of month at 5:00 PM
- ✅ Quarterly reports on Mar 31, Jun 30, Sep 30, Dec 31 at 5:00 PM
- ✅ Yearly report on December 31st at 5:00 PM

### Option 2: Set Up Windows Task Scheduler

Create a task to run `scheduler-periodic.js` on Windows startup:

1. Open Task Scheduler (`taskschd.msc`)
2. Create Task → Name: "Linear Periodic Reports"
3. Trigger: At startup
4. Action: Start program
   - Program: `cmd.exe`
   - Arguments: `/c "c:\Users\Admin\Downloads\linear-reporting\linear-reporting\start-scheduler-periodic.bat"`
5. Settings: Allow task to run on demand, restart on failure

## Report Schedule Summary

| Report Type | Frequency | Day/Date | Time | Timezone |
|------------|-----------|----------|------|----------|
| Daily Team | Every day | All days | 5:00 PM | Kenya (EAT) |
| Weekly | Weekly | Friday | 5:00 PM | Kenya (EAT) |
| Monthly | Monthly | Last day of month | 5:00 PM | Kenya (EAT) |
| Quarterly | Quarterly | Mar 31, Jun 30, Sep 30, Dec 31 | 5:00 PM | Kenya (EAT) |
| Yearly | Annually | December 31 | 5:00 PM | Kenya (EAT) |

## Sample Insights from Reports

### Weekly Report Example:
> "This week (Nov 11-15): 2 projects completed, 0 new projects started, 3 currently active"
> - Wednesday had highest completion rate
> - Zafari team completed 2 projects
> - Most projects are in 61-80% progress range

### Monthly Report Example:
> "November 2025: 8 projects completed, 3 new projects started, 22 currently active"
> - Week 3 had highest completion rate
> - Join Africa team most productive
> - 5 projects moved from 41-60% to 81-100%

### Quarterly Report Example:
> "Q4 2025 (Oct-Dec): 25 projects completed, 10 new projects started, 22 currently active"
> - November was most productive month
> - All teams showed consistent delivery
> - Completion rate improved from 28% to 31%

### Yearly Report Example:
> "2025 Annual Report: 95 projects completed, 40 new projects started, 22 currently active"
> - Q3 was most productive quarter
> - Zafari team delivered 60% of all projects
> - Average project completion time: 45 days

## Benefits by Role

### For Team Leaders:
- **Weekly**: Track team's week-over-week progress
- **Monthly**: Review team performance and plan next month
- **Quarterly**: Assess team goals and OKRs
- **Yearly**: Annual performance review data

### For Executives:
- **Weekly**: Quick pulse check on company progress
- **Monthly**: Board meeting preparation
- **Quarterly**: Strategic planning insights
- **Yearly**: Annual report data and trends

### For Project Managers:
- **Weekly**: Sprint retrospective data
- **Monthly**: Project portfolio health check
- **Quarterly**: Long-term project tracking
- **Yearly**: Historical trends and patterns

## Customization

### Change Report Schedule

Edit `scheduler-periodic.js`:

```javascript
// Weekly - Change from Monday 9 AM to Friday 5 PM
cron.schedule('0 17 * * 5', () => {
  runReport('weekly', 'Weekly Report');
}, { timezone: "Africa/Nairobi" });

// Monthly - Change from 1st to 15th
cron.schedule('0 9 15 * *', () => {
  runReport('monthly', 'Monthly Report');
}, { timezone: "Africa/Nairobi" });
```

### Change Recipients

Edit the scripts or pass different email:
```bash
node send-periodic-reports.js manager@company.com weekly
```

### Modify Report Content

Edit `send-periodic-reports.js`:
- `generateCompletionTrendChart()` - Trend chart
- `generateTeamComparisonChart()` - Team performance
- `generateProgressOverviewChart()` - Progress distribution
- `generatePeriodicReportHtml()` - Email template

## Files

- **`send-periodic-reports.js`** - Main periodic report generator
- **`scheduler-periodic.js`** - Combined scheduler for all reports
- **`send-team-reports.js`** - Daily team reports (existing)
- **`package.json`** - Updated with report scripts

## Troubleshooting

### Reports not sending?
1. Check if scheduler is running: `Get-Process -Name node`
2. Test manually: `npm run report:weekly`
3. Check console for errors

### Wrong data in reports?
- Verify Linear API key in `.env`
- Check date range calculations
- Test with: `node test-teams.js`

### Email not received?
1. Check spam folder
2. Verify email credentials in script
3. Test with manual send

## Success Indicators

You'll know it's working when:
- ✅ Daily reports arrive at 5:00 PM
- ✅ Weekly reports arrive every Monday at 9:00 AM
- ✅ Monthly reports arrive on the 1st at 9:00 AM
- ✅ Console shows successful send messages
- ✅ Charts render correctly in emails

## Next Steps

1. **Test each report type** manually to see what they look like
2. **Start the scheduler**: `npm run scheduler-periodic`
3. **Set up Task Scheduler** for auto-start on boot
4. **Mark your calendar** for the first automated sends

## Summary

You now have a **complete reporting system**:
- 📧 **5 emails daily** (1 overall + 4 team reports)
- 📧 **1 email weekly** (every Monday)
- 📧 **1 email monthly** (1st of month)
- 📧 **1 email quarterly** (Jan/Apr/Jul/Oct 1st)
- 📧 **1 email yearly** (January 1st)

**Total: Up to 10 different report types covering all time periods!** 🎉
