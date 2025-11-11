# Power BI Quick Start Guide

## ✅ What Was Added

Power BI integration is now live! You can export Linear data for advanced analytics.

## 🚀 Quick Start (5 Minutes)

### Step 1: Export Data
```bash
npm run export-powerbi
```

**Result**: Creates files in `./powerbi-export/` folder
- ✅ 34 projects exported
- ✅ 250 issues exported  
- ✅ 4 teams exported
- ✅ Summary metrics generated

### Step 2: Open Power BI Desktop

Download from: https://powerbi.microsoft.com/desktop/

### Step 3: Import Data

1. Click **"Get Data"** → **"JSON"**
2. Navigate to `./powerbi-export/` folder
3. Select `linear_data_2025-10-07.json`
4. Click **"Open"**
5. Power BI will show the data structure
6. Click **"Load"**

### Step 4: Create Your First Visual

1. Click on **"Projects"** table in Fields pane
2. Drag **"State"** to a blank canvas
3. Power BI creates a table
4. Change visualization to **"Donut Chart"**
5. Drag **"ProjectName"** to Values

**You now have a Project Status Distribution chart!**

## 📊 Sample Dashboards (Copy & Paste)

### Dashboard 1: Executive Summary

**Visuals to create:**
1. **Card**: Total Projects (from Metrics table)
2. **Card**: Active Projects (from Metrics table)
3. **Card**: Average Progress (from Metrics table)
4. **Donut Chart**: Projects by State
5. **Bar Chart**: Projects by Team
6. **Line Chart**: Project Progress Distribution

### Dashboard 2: Team Performance

**Visuals to create:**
1. **Stacked Bar**: Count of Projects by Team and State
2. **Table**: Team statistics with filters
3. **Gauge**: Team completion rate
4. **Matrix**: Issues by Team and State

### Dashboard 3: Deadline Tracking

**Visuals to create:**
1. **Card**: Projects Overdue (filter DeadlineStatus = "Overdue")
2. **Card**: Projects Due Soon (filter DeadlineStatus = "Due Soon")
3. **Table**: Projects sorted by DaysToDeadline
4. **Waterfall**: Projects by Deadline Status

## 🔗 Table Relationships

After importing, create these relationships:

1. **Issues → Projects**
   - From: `Issues[ProjectId]`
   - To: `Projects[ProjectId]`
   - Cardinality: Many to One

2. **Issues → Teams**
   - From: `Issues[TeamId]`
   - To: `Teams[TeamId]`
   - Cardinality: Many to One

**How to create:**
1. Click "Model" view (left sidebar)
2. Drag from one field to another
3. Power BI auto-detects the relationship

## 📈 5 Essential DAX Measures

Copy these into Power BI (Home → New Measure):

### 1. Completion Rate
```dax
Completion Rate = 
DIVIDE(
    CALCULATE(COUNT(Projects[ProjectId]), Projects[State] = "completed"),
    COUNT(Projects[ProjectId]),
    0
) * 100
```

### 2. Overdue Count
```dax
Overdue Projects = 
CALCULATE(
    COUNT(Projects[ProjectId]),
    Projects[DeadlineStatus] = "Overdue"
)
```

### 3. Average Cycle Time
```dax
Avg Cycle Time = 
AVERAGE(Issues[DaysToComplete])
```

### 4. Velocity (Points per Day)
```dax
Velocity = 
DIVIDE(
    SUM(Issues[Estimate]),
    SUM(Issues[DaysToComplete]),
    0
)
```

### 5. At Risk Projects
```dax
At Risk Projects = 
CALCULATE(
    COUNT(Projects[ProjectId]),
    OR(
        Projects[DeadlineStatus] = "Overdue",
        AND(
            Projects[ProgressPercent] < 50,
            Projects[DaysToDeadline] < 14
        )
    )
)
```

## 🎨 Color Scheme (Match Your Dashboard)

Use these colors for consistency:

- **Active/Blue**: #3B82F6
- **Completed/Green**: #10B981
- **Overdue/Red**: #EF4444
- **Warning/Orange**: #F59E0B
- **Paused/Gray**: #6B7280

**How to apply:**
1. Select visual
2. Format → Data colors
3. Enter hex code

## 🔄 Auto-Refresh Setup

### Option 1: Manual Refresh
- Click "Refresh" button in Power BI Desktop
- Re-run `npm run export-powerbi` for latest data

### Option 2: Live API (Advanced)
1. Get Data → Web
2. URL: `http://localhost:5001/api/powerbi/data`
3. Click Refresh anytime for live data

### Option 3: Scheduled (Power BI Service)
1. Publish report to Power BI Service
2. Dataset Settings → Scheduled Refresh
3. Set frequency (e.g., daily at 8 AM)

## 📊 Data Dictionary

### Projects Table (34 records)
- **ProjectId**: Unique identifier
- **ProjectName**: Project name
- **State**: started, planned, completed, canceled, paused
- **ProgressPercent**: 0-100
- **DaysToDeadline**: Negative if overdue
- **DeadlineStatus**: No Deadline, On Track, Due Soon, Overdue

### Issues Table (250 records)
- **IssueId**: Unique identifier
- **IssueTitle**: Issue name
- **StateType**: unstarted, started, completed, canceled
- **Priority**: 0-4 (0=none, 4=urgent)
- **Estimate**: Story points
- **AgeDays**: Days since creation
- **DaysToComplete**: Days taken to complete (if done)

### Teams Table (4 records)
- **TeamId**: Unique identifier
- **TeamName**: Team name
- **TeamKey**: Abbreviation

### Metrics Table (1 record)
- **TotalProjects**: Count of all projects
- **ActiveProjects**: Currently active
- **AverageProjectProgress**: Mean progress %
- **TotalEstimatePoints**: Sum of all story points

## ⚡ Quick Tips

1. **Filter by Date**: Use CreatedAt, UpdatedAt for time-based analysis
2. **Drill Down**: Enable drill-down on charts for deeper insights
3. **Slicers**: Add slicers for TeamName, State, Priority
4. **Bookmarks**: Save different views for quick access
5. **Mobile Layout**: Create mobile-friendly version in Power BI

## 🎯 Common Use Cases

### 1. Weekly Status Report
**Visuals**: Total projects, Active count, Completion rate, Overdue list

### 2. Team Capacity Planning
**Visuals**: Issues by team, Estimate points by team, Avg cycle time

### 3. Sprint Review
**Visuals**: Completed issues this week, Velocity trend, Burndown

### 4. Executive Dashboard
**Visuals**: KPI cards, Status distribution, Team comparison, Timeline

## 🔧 Troubleshooting

### "Can't find file"
- Check `./powerbi-export/` folder exists
- Re-run `npm run export-powerbi`

### "No data showing"
- Verify relationships are created
- Check filters aren't hiding data
- Click "Refresh" in Power BI

### "API connection fails"
- Ensure server is running: `npm run dev`
- Check URL: `http://localhost:5001/api/powerbi/data`
- Test in browser first

## 📚 Next Steps

1. ✅ Export data: `npm run export-powerbi`
2. ✅ Import into Power BI Desktop
3. ✅ Create relationships
4. ✅ Build first dashboard
5. ⏭️ Add DAX measures
6. ⏭️ Publish to Power BI Service
7. ⏭️ Share with team

## 📖 Full Documentation

For advanced features, see:
- **[POWERBI-INTEGRATION.md](POWERBI-INTEGRATION.md)** - Complete guide
- **[README.md](README.md)** - Project overview
- **API Docs**: http://localhost:5001/api/powerbi/data

## ✨ Summary

You now have:
- ✅ Export script (`npm run export-powerbi`)
- ✅ 5 API endpoints for live data
- ✅ 4 data tables (Projects, Issues, Teams, Metrics)
- ✅ JSON and CSV formats
- ✅ Sample dashboards and DAX measures
- ✅ Complete documentation

**Time to build amazing dashboards!** 📊🚀
