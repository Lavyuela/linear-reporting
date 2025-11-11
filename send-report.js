const axios = require('axios');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

// Load environment variables
dotenv.config();

// Email configuration
const EMAIL_USER = 'ivy@purpleelephant.ventures';
const EMAIL_PASS = 'hjpp ylto whdl msjs'; // App password
const EMAIL_TO = process.argv[2] || EMAIL_USER; // Default to sender if no recipient provided

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// Linear API client
const linearClient = axios.create({
  baseURL: 'https://api.linear.app/graphql',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': process.env.LINEAR_API_KEY
  }
});

// Chart configuration
const chartJSNodeCanvas = new ChartJSNodeCanvas({ 
  width: 800, 
  height: 400,
  backgroundColour: 'white'
});

// Get current date in YYYY-MM-DD format
const getCurrentDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Calculate days remaining or overdue
const getDaysRemaining = (targetDate) => {
  if (!targetDate) return 'No deadline';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const deadline = new Date(targetDate);
  deadline.setHours(0, 0, 0, 0);
  
  const diffTime = deadline - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return `${Math.abs(diffDays)} days overdue`;
  } else if (diffDays === 0) {
    return 'Due today';
  } else if (diffDays === 1) {
    return '1 day remaining';
  } else {
    return `${diffDays} days remaining`;
  }
};

// Get project status emoji
const getStatusEmoji = (state, targetDate) => {
  if (state === 'completed') return '✅';
  if (state === 'canceled') return '❌';
  
  if (targetDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const deadline = new Date(targetDate);
    deadline.setHours(0, 0, 0, 0);
    
    if (deadline < today) return '🚨'; // Overdue
    
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return '⚠️'; // Due soon
  }
  
  return '🔄'; // In progress
};

// Generate chart: Project Status Distribution (Pie Chart)
async function generateProjectStatusChart(projects) {
  const activeCount = projects.filter(p => p.state === 'started' || p.state === 'planned').length;
  const completedCount = projects.filter(p => p.state === 'completed').length;
  const canceledCount = projects.filter(p => p.state === 'canceled').length;
  const pausedCount = projects.filter(p => p.state === 'paused').length;

  const configuration = {
    type: 'doughnut',
    data: {
      labels: ['Active', 'Completed', 'Canceled', 'Paused'],
      datasets: [{
        data: [activeCount, completedCount, canceledCount, pausedCount],
        backgroundColor: ['#3B82F6', '#10B981', '#EF4444', '#F59E0B'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { size: 14, family: 'Arial' },
            padding: 15
          }
        },
        title: {
          display: true,
          text: 'Project Status Distribution',
          font: { size: 18, weight: 'bold', family: 'Arial' },
          padding: 20
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

// Generate chart: Team Progress (Bar Chart)
async function generateTeamProgressChart(projects, teams) {
  const teamData = {};
  
  teams.forEach(team => {
    teamData[team.name] = { active: 0, completed: 0 };
  });

  projects.forEach(project => {
    project.teams.nodes.forEach(team => {
      if (teamData[team.name]) {
        if (project.state === 'completed') {
          teamData[team.name].completed++;
        } else if (project.state !== 'canceled') {
          teamData[team.name].active++;
        }
      }
    });
  });

  const teamNames = Object.keys(teamData);
  const activeData = teamNames.map(name => teamData[name].active);
  const completedData = teamNames.map(name => teamData[name].completed);

  const configuration = {
    type: 'bar',
    data: {
      labels: teamNames,
      datasets: [
        {
          label: 'Active Projects',
          data: activeData,
          backgroundColor: '#3B82F6',
          borderRadius: 5
        },
        {
          label: 'Completed Projects',
          data: completedData,
          backgroundColor: '#10B981',
          borderRadius: 5
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { size: 14, family: 'Arial' },
            padding: 15
          }
        },
        title: {
          display: true,
          text: 'Team Project Progress',
          font: { size: 18, weight: 'bold', family: 'Arial' },
          padding: 20
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            font: { size: 12 }
          }
        },
        x: {
          ticks: {
            font: { size: 12 }
          }
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

// Generate chart: Project Timeline (Horizontal Bar)
async function generateProjectTimelineChart(projects) {
  const activeProjects = projects
    .filter(p => p.state !== 'completed' && p.state !== 'canceled' && p.targetDate)
    .sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate))
    .slice(0, 10); // Top 10 upcoming deadlines

  const projectNames = activeProjects.map(p => p.name.length > 30 ? p.name.substring(0, 27) + '...' : p.name);
  const daysRemaining = activeProjects.map(p => {
    const today = new Date();
    const deadline = new Date(p.targetDate);
    const diffTime = deadline - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  });

  const colors = daysRemaining.map(days => {
    if (days < 0) return '#EF4444'; // Overdue - Red
    if (days <= 7) return '#F59E0B'; // Due soon - Orange
    return '#3B82F6'; // Normal - Blue
  });

  const configuration = {
    type: 'bar',
    data: {
      labels: projectNames,
      datasets: [{
        label: 'Days Until Deadline',
        data: daysRemaining,
        backgroundColor: colors,
        borderRadius: 5
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Upcoming Project Deadlines',
          font: { size: 18, weight: 'bold', family: 'Arial' },
          padding: 20
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Days Remaining',
            font: { size: 14 }
          },
          ticks: {
            font: { size: 12 }
          }
        },
        y: {
          ticks: {
            font: { size: 11 }
          }
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

// Generate chart: Progress Overview (Line Chart)
async function generateProgressOverviewChart(projects) {
  const progressRanges = {
    '0-20%': 0,
    '21-40%': 0,
    '41-60%': 0,
    '61-80%': 0,
    '81-100%': 0
  };

  projects.filter(p => p.state !== 'canceled').forEach(project => {
    const progress = Math.round((project.progress || 0) * 100);
    if (progress <= 20) progressRanges['0-20%']++;
    else if (progress <= 40) progressRanges['21-40%']++;
    else if (progress <= 60) progressRanges['41-60%']++;
    else if (progress <= 80) progressRanges['61-80%']++;
    else progressRanges['81-100%']++;
  });

  const configuration = {
    type: 'bar',
    data: {
      labels: Object.keys(progressRanges),
      datasets: [{
        label: 'Number of Projects',
        data: Object.values(progressRanges),
        backgroundColor: ['#EF4444', '#F59E0B', '#F59E0B', '#3B82F6', '#10B981'],
        borderRadius: 5
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Project Progress Distribution',
          font: { size: 18, weight: 'bold', family: 'Arial' },
          padding: 20
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            font: { size: 12 }
          },
          title: {
            display: true,
            text: 'Number of Projects',
            font: { size: 14 }
          }
        },
        x: {
          ticks: {
            font: { size: 12 }
          },
          title: {
            display: true,
            text: 'Progress Range',
            font: { size: 14 }
          }
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

// Generate HTML for project row
const generateProjectRow = (project) => {
  const progress = Math.round((project.progress || 0) * 100);
  const statusEmoji = getStatusEmoji(project.state, project.targetDate);
  const daysRemaining = project.targetDate ? getDaysRemaining(project.targetDate) : 'No deadline';
  
  return `
    <tr>
      <td>${statusEmoji} ${project.name}</td>
      <td>${project.state}</td>
      <td>
        <div style="background-color: #e2e8f0; border-radius: 9999px; height: 8px; width: 100%;">
          <div style="background-color: #3182ce; border-radius: 9999px; height: 8px; width: ${progress}%;"></div>
        </div>
        <div style="text-align: center; font-size: 12px; margin-top: 4px;">${progress}%</div>
      </td>
      <td>${formatDate(project.startDate)}</td>
      <td>${formatDate(project.targetDate)}</td>
      <td>${daysRemaining}</td>
    </tr>
  `;
};

// Generate HTML email content
const generateEmailContent = (projects, teams) => {
  // Group projects by state
  const activeProjects = projects.filter(p => p.state !== 'completed' && p.state !== 'canceled');
  const completedProjects = projects.filter(p => p.state === 'completed' || p.state === 'canceled');
  
  // Count projects by state
  const totalProjects = projects.length;
  const completedCount = completedProjects.length;
  const activeCount = activeProjects.length;
  const completionRate = totalProjects > 0 ? Math.round((completedCount / totalProjects) * 100) : 0;
  
  // Count projects by team
  const teamCounts = {};
  teams.forEach(team => {
    teamCounts[team.id] = {
      name: team.name,
      total: 0,
      active: 0,
      completed: 0
    };
  });
  
  projects.forEach(project => {
    project.teams.nodes.forEach(team => {
      if (teamCounts[team.id]) {
        teamCounts[team.id].total++;
        if (project.state === 'completed' || project.state === 'canceled') {
          teamCounts[team.id].completed++;
        } else {
          teamCounts[team.id].active++;
        }
      }
    });
  });
  
  // Generate team statistics HTML
  let teamStatsHtml = '';
  Object.values(teamCounts).forEach(team => {
    if (team.total > 0) {
      const completionRate = Math.round((team.completed / team.total) * 100);
      teamStatsHtml += `
        <tr>
          <td>${team.name}</td>
          <td>${team.total}</td>
          <td>${team.active}</td>
          <td>${team.completed}</td>
          <td>${completionRate}%</td>
        </tr>
      `;
    }
  });
  
  // Generate active projects table
  let activeProjectsHtml = '';
  activeProjects.forEach(project => {
    activeProjectsHtml += generateProjectRow(project);
  });
  
  // Generate recently completed projects table (last 5)
  let recentCompletedHtml = '';
  completedProjects.slice(0, 5).forEach(project => {
    recentCompletedHtml += generateProjectRow(project);
  });
  
  // Generate HTML email
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
        }
        h1, h2, h3 {
          color: #2c5282;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th {
          background-color: #edf2f7;
          text-align: left;
          padding: 8px;
          border-bottom: 2px solid #cbd5e0;
        }
        td {
          padding: 8px;
          border-bottom: 1px solid #e2e8f0;
        }
        .stats-container {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .stat-box {
          background-color: #edf2f7;
          border-radius: 8px;
          padding: 16px;
          width: 30%;
          text-align: center;
        }
        .stat-number {
          font-size: 24px;
          font-weight: bold;
          color: #2c5282;
        }
        .footer {
          margin-top: 30px;
          font-size: 12px;
          color: #718096;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <h1>Linear Project Report</h1>
      <p>Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      
      <h2>Project Overview</h2>
      <div class="stats-container">
        <div class="stat-box">
          <div>Total Projects</div>
          <div class="stat-number">${totalProjects}</div>
        </div>
        <div class="stat-box">
          <div>Active Projects</div>
          <div class="stat-number">${activeCount}</div>
        </div>
        <div class="stat-box">
          <div>Completion Rate</div>
          <div class="stat-number">${completionRate}%</div>
        </div>
      </div>

      <h2>📊 Visual Insights</h2>
      <div style="margin: 30px 0;">
        <img src="cid:statusChart" alt="Project Status Distribution" style="width: 100%; max-width: 800px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
      </div>
      
      <div style="margin: 30px 0;">
        <img src="cid:progressChart" alt="Project Progress Distribution" style="width: 100%; max-width: 800px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
      </div>

      <div style="margin: 30px 0;">
        <img src="cid:teamChart" alt="Team Progress" style="width: 100%; max-width: 800px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
      </div>

      <div style="margin: 30px 0;">
        <img src="cid:timelineChart" alt="Upcoming Deadlines" style="width: 100%; max-width: 800px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
      </div>
      
      <h2>Team Statistics</h2>
      <table>
        <thead>
          <tr>
            <th>Team</th>
            <th>Total Projects</th>
            <th>Active</th>
            <th>Completed</th>
            <th>Completion Rate</th>
          </tr>
        </thead>
        <tbody>
          ${teamStatsHtml}
        </tbody>
      </table>
      
      <h2>Active Projects (${activeCount})</h2>
      <table>
        <thead>
          <tr>
            <th>Project</th>
            <th>Status</th>
            <th>Progress</th>
            <th>Start Date</th>
            <th>Target Date</th>
            <th>Timeline</th>
          </tr>
        </thead>
        <tbody>
          ${activeProjectsHtml || '<tr><td colspan="6" style="text-align: center;">No active projects</td></tr>'}
        </tbody>
      </table>
      
      <h2>Recently Completed Projects</h2>
      <table>
        <thead>
          <tr>
            <th>Project</th>
            <th>Status</th>
            <th>Progress</th>
            <th>Start Date</th>
            <th>Target Date</th>
            <th>Timeline</th>
          </tr>
        </thead>
        <tbody>
          ${recentCompletedHtml || '<tr><td colspan="6" style="text-align: center;">No completed projects</td></tr>'}
        </tbody>
      </table>
      
      <div class="footer">
        <p>This is an automated report generated from Linear. Do not reply to this email.</p>
        <p>To view more details, visit the <a href="http://localhost:3001">Linear Project Reporting Dashboard</a>.</p>
      </div>
    </body>
    </html>
  `;
};

// Main function to fetch data and send email
async function sendProjectReport() {
  try {
    console.log('Fetching projects from Linear API...');
    
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
    
    // Fetch projects
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
            teams {
              nodes {
                id
                name
              }
            }
          }
        }
      }
    `;
    
    const projectsResponse = await linearClient.post('', { query: projectsQuery });
    const projects = projectsResponse.data.data.projects.nodes;
    
    // Sort projects: ongoing projects with target dates first, then completed projects
    const sortedProjects = projects.sort((a, b) => {
      const aIsCompleted = a.state === 'completed' || a.state === 'canceled';
      const bIsCompleted = b.state === 'completed' || b.state === 'canceled';
      
      // If one is completed and the other is not, the ongoing one comes first
      if (aIsCompleted && !bIsCompleted) return 1;
      if (!aIsCompleted && bIsCompleted) return -1;
      
      // If both are ongoing or both are completed, sort by target date
      if (a.targetDate && b.targetDate) {
        return new Date(a.targetDate) - new Date(b.targetDate);
      }
      
      // If only one has a target date, it comes first
      if (a.targetDate && !b.targetDate) return -1;
      if (!a.targetDate && b.targetDate) return 1;
      
      // If neither has a target date, sort by start date if available
      if (a.startDate && b.startDate) {
        return new Date(a.startDate) - new Date(b.startDate);
      }
      
      // Otherwise keep original order
      return 0;
    });
    
    console.log(`Found ${projects.length} projects and ${teams.length} teams.`);
    
    // Generate charts
    console.log('Generating charts...');
    const statusChartBuffer = await generateProjectStatusChart(sortedProjects);
    const progressChartBuffer = await generateProgressOverviewChart(sortedProjects);
    const teamChartBuffer = await generateTeamProgressChart(sortedProjects, teams);
    const timelineChartBuffer = await generateProjectTimelineChart(sortedProjects);
    console.log('Charts generated successfully!');
    
    // Generate email content
    const emailHtml = generateEmailContent(sortedProjects, teams);
    
    // Save HTML to file for debugging
    const reportFileName = `linear-report-${getCurrentDate()}.html`;
    fs.writeFileSync(path.join(__dirname, reportFileName), emailHtml);
    console.log(`Report saved to ${reportFileName}`);
    
    // Send email with embedded charts
    console.log(`Sending email to ${EMAIL_TO}...`);
    const mailOptions = {
      from: EMAIL_USER,
      to: EMAIL_TO,
      subject: `📊 Linear Project Report - ${getCurrentDate()}`,
      html: emailHtml,
      attachments: [
        {
          filename: 'status-chart.png',
          content: statusChartBuffer,
          cid: 'statusChart'
        },
        {
          filename: 'progress-chart.png',
          content: progressChartBuffer,
          cid: 'progressChart'
        },
        {
          filename: 'team-chart.png',
          content: teamChartBuffer,
          cid: 'teamChart'
        },
        {
          filename: 'timeline-chart.png',
          content: timelineChartBuffer,
          cid: 'timelineChart'
        }
      ]
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent successfully:', info.response);
      }
    });
    
  } catch (error) {
    console.error('Error generating report:', error.message);
    if (error.response) {
      console.error('API Error Details:', error.response.data);
    }
  }
}

// Execute the main function
sendProjectReport();
