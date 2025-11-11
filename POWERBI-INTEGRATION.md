# Power BI Integration Guide

## 📊 Overview

This integration allows you to export Linear project data to Power BI for advanced analytics, custom dashboards, and reporting.

## 🚀 Quick Start

### Method 1: Export to Files (Recommended for Beginners)

Export data to JSON/CSV files that can be imported into Power BI:

```bash
npm run export-powerbi
```

This creates files in `./powerbi-export/`:
- `projects_YYYY-MM-DD.json` / `.csv`
- `issues_YYYY-MM-DD.json` / `.csv`
- `teams_YYYY-MM-DD.json` / `.csv`
- `metrics_YYYY-MM-DD.json` / `.csv`
- `linear_data_YYYY-MM-DD.json` (combined)

### Method 2: Live API Connection (Advanced)

Connect Power BI directly to the API endpoints for real-time data:

**API Endpoints:**
- `http://localhost:5001/api/powerbi/data` - All data combined
- `http://localhost:5001/api/powerbi/projects` - Projects only
- `http://localhost:5001/api/powerbi/issues` - Issues only
- `http://localhost:5001/api/powerbi/teams` - Teams only
- `http://localhost:5001/api/powerbi/metrics` - Summary metrics

## 📋 Data Tables

### 1. Projects Table

| Column | Type | Description |
|--------|------|-------------|
| ProjectId | String | Unique project identifier |
| ProjectName | String | Project name |
| ProjectDescription | String | Project description |
| State | String | Current state (started, planned, completed, canceled, paused) |
| ProgressPercent | Number | Progress percentage (0-100) |
| StartDate | Date | Project start date |
| TargetDate | Date | Project target/deadline date |
| CreatedAt | DateTime | When project was created |
| UpdatedAt | DateTime | Last update timestamp |
| CompletedAt | DateTime | When project was completed (if applicable) |
| CanceledAt | DateTime | When project was canceled (if applicable) |
| TeamNames | String | Comma-separated team names |
| TeamIds | String | Comma-separated team IDs |
| LeadName | String | Project lead name |
| LeadEmail | String | Project lead email |
| MemberCount | Number | Number of project members |
| DaysToDeadline | Number | Days until deadline (negative if overdue) |
| DeadlineStatus | String | No Deadline, On Track, Due Soon, Overdue, Completed/Canceled |
| DurationDays | Number | Planned project duration in days |

### 2. Issues Table

| Column | Type | Description |
|--------|------|-------------|
| IssueId | String | Unique issue identifier |
| IssueTitle | String | Issue title |
| IssueDescription | String | Issue description |
| StateName | String | State name (e.g., "In Progress", "Done") |
| StateType | String | State type (unstarted, started, completed, canceled) |
| Priority | Number | Priority level (0-4) |
| Estimate | Number | Story points estimate |
| CreatedAt | DateTime | When issue was created |
| UpdatedAt | DateTime | Last update timestamp |
| CompletedAt | DateTime | When issue was completed |
| CanceledAt | DateTime | When issue was canceled |
| AssigneeName | String | Assigned person name |
| AssigneeEmail | String | Assigned person email |
| CreatorName | String | Issue creator name |
| CreatorEmail | String | Issue creator email |
| TeamId | String | Team identifier |
| TeamName | String | Team name |
| TeamKey | String | Team key/abbreviation |
| ProjectId | String | Associated project ID |
| ProjectName | String | Associated project name |
| Labels | String | Comma-separated label names |
| DaysToComplete | Number | Days taken to complete (if completed) |
| AgeDays | Number | Days since issue creation |

### 3. Teams Table

| Column | Type | Description |
|--------|------|-------------|
| TeamId | String | Unique team identifier |
| TeamName | String | Team name |
| TeamKey | String | Team key/abbreviation |
| TeamDescription | String | Team description |
| TeamColor | String | Team color code |

### 4. Metrics Table

| Column | Type | Description |
|--------|------|-------------|
| ExportDate | Date | Date of export |
| ExportTimestamp | DateTime | Exact timestamp of export |
| TotalProjects | Number | Total number of projects |
| ActiveProjects | Number | Currently active projects |
| CompletedProjects | Number | Completed projects |
| CanceledProjects | Number | Canceled projects |
| TotalIssues | Number | Total number of issues |
| CompletedIssues | Number | Completed issues |
| InProgressIssues | Number | In-progress issues |
| TodoIssues | Number | Todo/unstarted issues |
| CanceledIssues | Number | Canceled issues |
| TotalTeams | Number | Total number of teams |
| AverageProjectProgress | Number | Average progress across all projects (%) |
| TotalEstimatePoints | Number | Total story points across all issues |
| CompletedEstimatePoints | Number | Completed story points |

## 🔗 Setting Up in Power BI Desktop

### Option A: Import from Files

1. **Export the data:**
   ```bash
   npm run export-powerbi
   ```

2. **Open Power BI Desktop**

3. **Get Data:**
   - Click "Get Data" → "JSON" (or "Text/CSV" for CSV files)
   - Navigate to `./powerbi-export/` folder
   - Select the file(s) you want to import

4. **Load Data:**
   - For JSON: Power BI will parse the structure automatically
   - For CSV: Verify column types and adjust if needed

5. **Repeat for each table:**
   - Import `projects_*.json`
   - Import `issues_*.json`
   - Import `teams_*.json`
   - Import `metrics_*.json`

6. **Create Relationships:**
   - Go to "Model" view
   - Create relationships:
     - `Issues[ProjectId]` → `Projects[ProjectId]`
     - `Issues[TeamId]` → `Teams[TeamId]`
     - `Projects[TeamIds]` → `Teams[TeamId]` (many-to-many)

### Option B: Connect to Live API

1. **Ensure the server is running:**
   ```bash
   npm run dev
   ```

2. **Open Power BI Desktop**

3. **Get Data:**
   - Click "Get Data" → "Web"
   - Enter URL: `http://localhost:5001/api/powerbi/projects`
   - Click "OK"

4. **Authenticate:**
   - Select "Anonymous" authentication
   - Click "Connect"

5. **Load Data:**
   - Power BI will parse the JSON response
   - Click "Load"

6. **Repeat for other endpoints:**
   - Issues: `http://localhost:5001/api/powerbi/issues`
   - Teams: `http://localhost:5001/api/powerbi/teams`
   - Metrics: `http://localhost:5001/api/powerbi/metrics`

7. **Set up Auto-Refresh:**
   - Go to "Transform Data" → "Data Source Settings"
   - Configure refresh schedule

## 📊 Sample Power BI Visualizations

### 1. Project Health Dashboard

**KPI Cards:**
- Total Projects
- Active Projects
- Average Progress
- Projects Overdue

**Charts:**
- **Donut Chart**: Projects by State
- **Bar Chart**: Projects by Team
- **Gauge**: Overall Completion Rate
- **Timeline**: Projects by Target Date

### 2. Team Performance Dashboard

**Charts:**
- **Stacked Bar**: Active vs Completed Projects per Team
- **Line Chart**: Project Completion Trend over Time
- **Table**: Team Statistics with Completion Rates
- **Funnel**: Issues by State per Team

### 3. Issue Tracking Dashboard

**Charts:**
- **Column Chart**: Issues by Priority
- **Area Chart**: Issue Creation vs Completion Trend
- **Scatter Plot**: Estimate vs Days to Complete
- **Matrix**: Issues by Team and State

### 4. Deadline Monitoring Dashboard

**Charts:**
- **Waterfall**: Projects by Deadline Status
- **Gantt Chart**: Project Timeline
- **Card**: Days to Nearest Deadline
- **Table**: Overdue Projects with Details

## 🎨 Sample DAX Measures

### Completion Rate
```dax
Completion Rate = 
DIVIDE(
    CALCULATE(COUNT(Projects[ProjectId]), Projects[State] = "completed"),
    COUNT(Projects[ProjectId]),
    0
) * 100
```

### Average Days to Complete
```dax
Avg Days to Complete = 
AVERAGE(Issues[DaysToComplete])
```

### Overdue Projects Count
```dax
Overdue Projects = 
CALCULATE(
    COUNT(Projects[ProjectId]),
    Projects[DeadlineStatus] = "Overdue"
)
```

### Velocity (Story Points per Day)
```dax
Velocity = 
DIVIDE(
    SUM(Issues[Estimate]),
    SUM(Issues[DaysToComplete]),
    0
)
```

### On-Time Delivery Rate
```dax
On-Time Rate = 
VAR CompletedOnTime = 
    CALCULATE(
        COUNT(Projects[ProjectId]),
        Projects[State] = "completed",
        Projects[DaysToDeadline] >= 0
    )
VAR TotalCompleted = 
    CALCULATE(
        COUNT(Projects[ProjectId]),
        Projects[State] = "completed"
    )
RETURN
    DIVIDE(CompletedOnTime, TotalCompleted, 0) * 100
```

## 🔄 Automated Refresh

### Schedule Daily Exports

Add to your scheduler or create a new cron job:

```javascript
// In scheduler.js or create new file
cron.schedule('0 6 * * *', () => {
  console.log('Running Power BI export...');
  exec('node export-powerbi.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    console.log('Power BI export completed');
  });
});
```

### Power BI Service Auto-Refresh

1. Publish your report to Power BI Service
2. Go to Dataset Settings
3. Configure "Scheduled refresh"
4. Set frequency (e.g., daily at 7 AM)
5. Power BI will automatically fetch latest data from API

## 📈 Advanced Analytics Ideas

### Predictive Analytics
- **Forecast Completion Dates**: Use historical velocity to predict project completion
- **Risk Assessment**: Identify projects likely to miss deadlines
- **Resource Allocation**: Analyze team capacity and workload

### Trend Analysis
- **Velocity Trends**: Track story points completed over time
- **Cycle Time**: Average time from issue creation to completion
- **Throughput**: Number of issues completed per sprint/week

### Custom Metrics
- **Burndown Charts**: Track remaining work vs time
- **Cumulative Flow**: Visualize work in different states over time
- **Lead Time Distribution**: Analyze time to complete by priority/team

## 🔧 Troubleshooting

### Export Script Fails

**Issue**: "Error fetching Linear data"
**Solution**: 
- Check `.env` file has valid `LINEAR_API_KEY`
- Verify internet connection
- Check Linear API status

### Power BI Can't Connect to API

**Issue**: "Unable to connect to data source"
**Solution**:
- Ensure server is running (`npm run dev`)
- Check server is on port 5001
- Try `http://localhost:5001/api/health` in browser
- Disable firewall temporarily to test

### Data Not Refreshing

**Issue**: Old data showing in Power BI
**Solution**:
- Click "Refresh" in Power BI Desktop
- For API: Check server is returning latest data
- For files: Re-run `npm run export-powerbi`

### Relationships Not Working

**Issue**: Visuals showing incorrect data
**Solution**:
- Check relationship cardinality (one-to-many vs many-to-many)
- Verify ID columns match between tables
- Use "Manage Relationships" to review connections

## 📚 Best Practices

1. **Regular Exports**: Schedule daily exports for historical tracking
2. **Data Validation**: Always verify row counts after import
3. **Incremental Refresh**: For large datasets, use Power BI's incremental refresh
4. **Performance**: Use DirectQuery for real-time data, Import for better performance
5. **Security**: Don't expose API endpoints publicly without authentication
6. **Backup**: Keep historical export files for trend analysis

## 🎯 Next Steps

1. **Export your data**: Run `npm run export-powerbi`
2. **Import into Power BI**: Follow the setup guide above
3. **Create visualizations**: Start with the sample dashboards
4. **Schedule refresh**: Set up automated daily exports
5. **Share insights**: Publish to Power BI Service for team access

## 📞 Support

For issues or questions:
- Check server logs for API errors
- Verify Linear API key is valid
- Review Power BI query diagnostics
- Check `./powerbi-export/` folder permissions

## 🔗 Related Files

- `export-powerbi.js` - Export script
- `server.js` - API endpoints (lines 317-379)
- `package.json` - npm scripts
