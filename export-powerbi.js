const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Linear API client
const linearClient = axios.create({
  baseURL: 'https://api.linear.app/graphql',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': process.env.LINEAR_API_KEY
  }
});

// Get current date in YYYY-MM-DD format
const getCurrentDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// Fetch all data for Power BI
async function fetchLinearData() {
  try {
    console.log('Fetching data from Linear API for Power BI export...');
    
    // Fetch teams
    const teamsQuery = `
      query Teams {
        teams {
          nodes {
            id
            name
            key
            description
            color
          }
        }
      }
    `;
    
    const teamsResponse = await linearClient.post('', { query: teamsQuery });
    const teams = teamsResponse.data.data.teams.nodes;
    
    // Fetch projects with detailed information
    const projectsQuery = `
      query Projects {
        projects {
          nodes {
            id
            name
            description
            state
            progress
            startDate
            targetDate
            createdAt
            updatedAt
            completedAt
            canceledAt
            teams {
              nodes {
                id
                name
                key
              }
            }
            lead {
              id
              name
              email
            }
            members {
              nodes {
                id
                name
                email
              }
            }
          }
        }
      }
    `;
    
    const projectsResponse = await linearClient.post('', { query: projectsQuery });
    const projects = projectsResponse.data.data.projects.nodes;
    
    // Fetch issues for detailed analytics
    const issuesQuery = `
      query Issues {
        issues(first: 250) {
          nodes {
            id
            title
            state {
              name
              type
            }
            priority
            estimate
            createdAt
            updatedAt
            completedAt
            canceledAt
            assignee {
              id
              name
            }
            creator {
              id
              name
            }
            team {
              id
              name
              key
            }
            project {
              id
              name
            }
            labels {
              nodes {
                id
                name
                color
              }
            }
          }
        }
      }
    `;
    
    const issuesResponse = await linearClient.post('', { query: issuesQuery });
    const issues = issuesResponse.data?.data?.issues?.nodes || [];
    
    console.log(`Fetched ${teams.length} teams, ${projects.length} projects, and ${issues.length} issues.`);
    
    return { teams, projects, issues };
  } catch (error) {
    console.error('Error fetching Linear data:', error.message);
    if (error.response) {
      console.error('API Error Details:', error.response.data);
    }
    throw error;
  }
}

// Transform data for Power BI (flatten nested structures)
function transformForPowerBI(data) {
  const { teams, projects, issues } = data;
  
  // Transform Projects
  const projectsFlat = projects.map(project => {
    const progressPercent = Math.round((project.progress || 0) * 100);
    const teamNames = project.teams.nodes.map(t => t.name).join(', ');
    const teamIds = project.teams.nodes.map(t => t.id).join(', ');
    
    // Calculate days to deadline
    let daysToDeadline = null;
    let deadlineStatus = 'No Deadline';
    if (project.targetDate) {
      const today = new Date();
      const deadline = new Date(project.targetDate);
      const diffTime = deadline - today;
      daysToDeadline = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (project.state === 'completed' || project.state === 'canceled') {
        deadlineStatus = 'Completed/Canceled';
      } else if (daysToDeadline < 0) {
        deadlineStatus = 'Overdue';
      } else if (daysToDeadline <= 7) {
        deadlineStatus = 'Due Soon';
      } else {
        deadlineStatus = 'On Track';
      }
    }
    
    // Calculate duration
    let durationDays = null;
    if (project.startDate && project.targetDate) {
      const start = new Date(project.startDate);
      const end = new Date(project.targetDate);
      durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }
    
    return {
      ProjectId: project.id,
      ProjectName: project.name,
      ProjectDescription: project.description || '',
      State: project.state,
      ProgressPercent: progressPercent,
      StartDate: project.startDate || null,
      TargetDate: project.targetDate || null,
      CreatedAt: project.createdAt,
      UpdatedAt: project.updatedAt,
      CompletedAt: project.completedAt || null,
      CanceledAt: project.canceledAt || null,
      TeamNames: teamNames,
      TeamIds: teamIds,
      LeadName: project.lead?.name || null,
      LeadEmail: project.lead?.email || null,
      MemberCount: project.members.nodes.length,
      DaysToDeadline: daysToDeadline,
      DeadlineStatus: deadlineStatus,
      DurationDays: durationDays
    };
  });
  
  // Transform Issues
  const issuesFlat = issues.map(issue => {
    // Calculate days to complete
    let daysToComplete = null;
    if (issue.createdAt && issue.completedAt) {
      const created = new Date(issue.createdAt);
      const completed = new Date(issue.completedAt);
      daysToComplete = Math.ceil((completed - created) / (1000 * 60 * 60 * 24));
    }
    
    // Calculate age (days since creation)
    const created = new Date(issue.createdAt);
    const today = new Date();
    const ageDays = Math.ceil((today - created) / (1000 * 60 * 60 * 24));
    
    const labelNames = issue.labels.nodes.map(l => l.name).join(', ');
    
    return {
      IssueId: issue.id,
      IssueTitle: issue.title,
      StateName: issue.state.name,
      StateType: issue.state.type,
      Priority: issue.priority || 0,
      Estimate: issue.estimate || 0,
      CreatedAt: issue.createdAt,
      UpdatedAt: issue.updatedAt,
      CompletedAt: issue.completedAt || null,
      CanceledAt: issue.canceledAt || null,
      AssigneeName: issue.assignee?.name || null,
      CreatorName: issue.creator?.name || null,
      TeamId: issue.team?.id || null,
      TeamName: issue.team?.name || null,
      TeamKey: issue.team?.key || null,
      ProjectId: issue.project?.id || null,
      ProjectName: issue.project?.name || null,
      Labels: labelNames,
      DaysToComplete: daysToComplete,
      AgeDays: ageDays
    };
  });
  
  // Transform Teams
  const teamsFlat = teams.map(team => ({
    TeamId: team.id,
    TeamName: team.name,
    TeamKey: team.key,
    TeamDescription: team.description || '',
    TeamColor: team.color || ''
  }));
  
  // Calculate aggregate metrics
  const metrics = {
    ExportDate: getCurrentDate(),
    ExportTimestamp: new Date().toISOString(),
    TotalProjects: projects.length,
    ActiveProjects: projects.filter(p => p.state !== 'completed' && p.state !== 'canceled').length,
    CompletedProjects: projects.filter(p => p.state === 'completed').length,
    CanceledProjects: projects.filter(p => p.state === 'canceled').length,
    TotalIssues: issues.length,
    CompletedIssues: issues.filter(i => i.state.type === 'completed').length,
    InProgressIssues: issues.filter(i => i.state.type === 'started').length,
    TodoIssues: issues.filter(i => i.state.type === 'unstarted').length,
    CanceledIssues: issues.filter(i => i.state.type === 'canceled').length,
    TotalTeams: teams.length,
    AverageProjectProgress: Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length * 100),
    TotalEstimatePoints: issues.reduce((sum, i) => sum + (i.estimate || 0), 0),
    CompletedEstimatePoints: issues.filter(i => i.state.type === 'completed').reduce((sum, i) => sum + (i.estimate || 0), 0)
  };
  
  return {
    Projects: projectsFlat,
    Issues: issuesFlat,
    Teams: teamsFlat,
    Metrics: [metrics]
  };
}

// Export to JSON files
function exportToJSON(data, outputDir = './powerbi-export') {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const timestamp = getCurrentDate();
  
  // Export each table to separate JSON file
  const files = {
    projects: path.join(outputDir, `projects_${timestamp}.json`),
    issues: path.join(outputDir, `issues_${timestamp}.json`),
    teams: path.join(outputDir, `teams_${timestamp}.json`),
    metrics: path.join(outputDir, `metrics_${timestamp}.json`),
    combined: path.join(outputDir, `linear_data_${timestamp}.json`)
  };
  
  fs.writeFileSync(files.projects, JSON.stringify(data.Projects, null, 2));
  fs.writeFileSync(files.issues, JSON.stringify(data.Issues, null, 2));
  fs.writeFileSync(files.teams, JSON.stringify(data.Teams, null, 2));
  fs.writeFileSync(files.metrics, JSON.stringify(data.Metrics, null, 2));
  fs.writeFileSync(files.combined, JSON.stringify(data, null, 2));
  
  console.log('\n✅ Data exported successfully!');
  console.log(`\nFiles created in ${outputDir}:`);
  console.log(`  - projects_${timestamp}.json (${data.Projects.length} records)`);
  console.log(`  - issues_${timestamp}.json (${data.Issues.length} records)`);
  console.log(`  - teams_${timestamp}.json (${data.Teams.length} records)`);
  console.log(`  - metrics_${timestamp}.json (summary metrics)`);
  console.log(`  - linear_data_${timestamp}.json (combined data)`);
  
  return files;
}

// Export to CSV format
function exportToCSV(data, outputDir = './powerbi-export') {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const timestamp = getCurrentDate();
  
  // Helper function to convert array of objects to CSV
  const arrayToCSV = (arr) => {
    if (arr.length === 0) return '';
    
    const headers = Object.keys(arr[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of arr) {
      const values = headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma or newline
        if (value === null || value === undefined) return '';
        const escaped = String(value).replace(/"/g, '""');
        return escaped.includes(',') || escaped.includes('\n') || escaped.includes('"') 
          ? `"${escaped}"` 
          : escaped;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  };
  
  const files = {
    projects: path.join(outputDir, `projects_${timestamp}.csv`),
    issues: path.join(outputDir, `issues_${timestamp}.csv`),
    teams: path.join(outputDir, `teams_${timestamp}.csv`),
    metrics: path.join(outputDir, `metrics_${timestamp}.csv`)
  };
  
  fs.writeFileSync(files.projects, arrayToCSV(data.Projects));
  fs.writeFileSync(files.issues, arrayToCSV(data.Issues));
  fs.writeFileSync(files.teams, arrayToCSV(data.Teams));
  fs.writeFileSync(files.metrics, arrayToCSV(data.Metrics));
  
  console.log('\n✅ CSV files exported successfully!');
  console.log(`\nFiles created in ${outputDir}:`);
  console.log(`  - projects_${timestamp}.csv`);
  console.log(`  - issues_${timestamp}.csv`);
  console.log(`  - teams_${timestamp}.csv`);
  console.log(`  - metrics_${timestamp}.csv`);
  
  return files;
}

// Main export function
async function exportForPowerBI() {
  try {
    // Fetch data
    const rawData = await fetchLinearData();
    
    // Transform for Power BI
    console.log('\nTransforming data for Power BI...');
    const transformedData = transformForPowerBI(rawData);
    
    // Export to JSON
    console.log('\nExporting to JSON format...');
    exportToJSON(transformedData);
    
    // Export to CSV
    console.log('\nExporting to CSV format...');
    exportToCSV(transformedData);
    
    console.log('\n✅ Power BI export complete!');
    console.log('\nNext steps:');
    console.log('1. Open Power BI Desktop');
    console.log('2. Get Data → JSON or CSV');
    console.log('3. Navigate to ./powerbi-export/ folder');
    console.log('4. Load the exported files');
    console.log('5. Create relationships between tables using IDs');
    
  } catch (error) {
    console.error('Error exporting data for Power BI:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  exportForPowerBI();
}

module.exports = { fetchLinearData, transformForPowerBI, exportToJSON, exportToCSV };
