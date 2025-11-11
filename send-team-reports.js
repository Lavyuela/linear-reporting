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
const EMAIL_TO = process.argv[2] || EMAIL_USER;

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

const getCurrentDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Fetch all projects and teams from Linear
async function fetchLinearData() {
  const query = `
    query {
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
      teams {
        nodes {
          id
          name
          key
        }
      }
    }
  `;

  const response = await linearClient.post('', { query });
  return response.data.data;
}

// Generate status chart
async function generateStatusChart(projects) {
  const statusCounts = {
    'Active': projects.filter(p => p.state === 'started' || p.state === 'planned').length,
    'Completed': projects.filter(p => p.state === 'completed').length,
    'Canceled': projects.filter(p => p.state === 'canceled').length,
    'Paused': projects.filter(p => p.state === 'paused').length,
  };

  const configuration = {
    type: 'doughnut',
    data: {
      labels: Object.keys(statusCounts),
      datasets: [{
        data: Object.values(statusCounts),
        backgroundColor: ['#3B82F6', '#10B981', '#EF4444', '#F59E0B'],
        borderWidth: 2,
        borderColor: '#FFFFFF'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 14 }, padding: 15 }
        },
        title: {
          display: true,
          text: 'Project Status Distribution',
          font: { size: 18, weight: 'bold' }
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

// Generate progress chart
async function generateProgressChart(projects) {
  const progressRanges = {
    '0-20%': projects.filter(p => (p.progress * 100) <= 20).length,
    '21-40%': projects.filter(p => (p.progress * 100) > 20 && (p.progress * 100) <= 40).length,
    '41-60%': projects.filter(p => (p.progress * 100) > 40 && (p.progress * 100) <= 60).length,
    '61-80%': projects.filter(p => (p.progress * 100) > 60 && (p.progress * 100) <= 80).length,
    '81-100%': projects.filter(p => (p.progress * 100) > 80).length,
  };

  const configuration = {
    type: 'bar',
    data: {
      labels: Object.keys(progressRanges),
      datasets: [{
        label: 'Number of Projects',
        data: Object.values(progressRanges),
        backgroundColor: ['#EF4444', '#F59E0B', '#F59E0B', '#3B82F6', '#10B981'],
        borderRadius: 5,
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Project Progress Distribution',
          font: { size: 18, weight: 'bold' }
        }
      },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

// Generate team performance chart
async function generateTeamPerformanceChart(projects, teams) {
  const teamData = {};
  teams.forEach(team => {
    const teamProjects = projects.filter(p => p.teams.nodes.some(t => t.id === team.id));
    teamData[team.name] = {
      active: teamProjects.filter(p => p.state !== 'completed' && p.state !== 'canceled').length,
      completed: teamProjects.filter(p => p.state === 'completed').length,
    };
  });

  const configuration = {
    type: 'bar',
    data: {
      labels: Object.keys(teamData),
      datasets: [
        {
          label: 'Active Projects',
          data: Object.values(teamData).map(t => t.active),
          backgroundColor: '#3B82F6',
          borderRadius: 5,
        },
        {
          label: 'Completed Projects',
          data: Object.values(teamData).map(t => t.completed),
          backgroundColor: '#10B981',
          borderRadius: 5,
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 12 }, padding: 15 }
        },
        title: {
          display: true,
          text: 'Team Performance Overview',
          font: { size: 18, weight: 'bold' }
        }
      },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } },
        x: { ticks: { font: { size: 10 } } }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

// Generate deadline status chart
async function generateDeadlineChart(projects) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const activeProjects = projects.filter(p => p.state !== 'completed' && p.state !== 'canceled');
  
  let overdue = 0;
  let dueSoon = 0;
  let onTrack = 0;
  let noDeadline = 0;
  
  activeProjects.forEach(p => {
    if (!p.targetDate) {
      noDeadline++;
    } else {
      const deadline = new Date(p.targetDate);
      deadline.setHours(0, 0, 0, 0);
      const daysRemaining = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
      
      if (daysRemaining < 0) overdue++;
      else if (daysRemaining <= 7) dueSoon++;
      else onTrack++;
    }
  });

  const configuration = {
    type: 'doughnut',
    data: {
      labels: ['Overdue', 'Due Soon (7 days)', 'On Track', 'No Deadline'],
      datasets: [{
        data: [overdue, dueSoon, onTrack, noDeadline],
        backgroundColor: ['#EF4444', '#F59E0B', '#10B981', '#9CA3AF'],
        borderWidth: 2,
        borderColor: '#FFFFFF'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 14 }, padding: 15 }
        },
        title: {
          display: true,
          text: 'Deadline Status',
          font: { size: 18, weight: 'bold' }
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

// Generate HTML email
function generateEmailHtml(projects, teamName = null) {
  const isOverallReport = !teamName;
  const reportTitle = isOverallReport ? 'Overall Project Report' : `${teamName} Team Report`;
  
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.state !== 'completed' && p.state !== 'canceled').length;
  const completedProjects = projects.filter(p => p.state === 'completed').length;
  const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

  const activeProjectsList = projects
    .filter(p => p.state !== 'completed' && p.state !== 'canceled')
    .slice(0, 10)
    .map(p => {
      const progress = Math.round((p.progress || 0) * 100);
      const daysRemaining = p.targetDate ? Math.ceil((new Date(p.targetDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
      
      let statusEmoji = '🔄';
      let statusColor = '#3B82F6';
      if (daysRemaining !== null) {
        if (daysRemaining < 0) {
          statusEmoji = '🚨';
          statusColor = '#EF4444';
        } else if (daysRemaining <= 7) {
          statusEmoji = '⚠️';
          statusColor = '#F59E0B';
        }
      }

      return `
        <tr style="border-bottom: 1px solid #E5E7EB;">
          <td style="padding: 12px; font-weight: 500;">${statusEmoji} ${p.name}</td>
          <td style="padding: 12px; text-align: center;">
            <div style="background: #E5E7EB; border-radius: 10px; height: 20px; overflow: hidden;">
              <div style="background: ${progress > 80 ? '#10B981' : progress > 50 ? '#3B82F6' : '#F59E0B'}; height: 100%; width: ${progress}%; transition: width 0.3s;"></div>
            </div>
            <span style="font-size: 12px; color: #6B7280;">${progress}%</span>
          </td>
          <td style="padding: 12px; text-align: center;">${formatDate(p.targetDate)}</td>
          <td style="padding: 12px; text-align: center; color: ${statusColor}; font-weight: 500;">
            ${daysRemaining !== null ? (daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`) : 'No deadline'}
          </td>
        </tr>
      `;
    }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1F2937; background: #F9FAFB; margin: 0; padding: 0; }
        .container { max-width: 800px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0; font-size: 14px; opacity: 0.9; }
        .content { padding: 30px; }
        .stats { display: flex; gap: 15px; margin-bottom: 30px; flex-wrap: wrap; }
        .stat-card { flex: 1; min-width: 150px; background: #F3F4F6; padding: 20px; border-radius: 12px; text-align: center; }
        .stat-card h3 { margin: 0; font-size: 32px; font-weight: 700; color: #667eea; }
        .stat-card p { margin: 8px 0 0; font-size: 14px; color: #6B7280; }
        .chart-container { margin: 30px 0; text-align: center; }
        .chart-container img { max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #F3F4F6; padding: 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #E5E7EB; }
        .footer { background: #F3F4F6; padding: 20px 30px; text-align: center; color: #6B7280; font-size: 12px; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; }
        .badge-team { background: #DBEAFE; color: #1E40AF; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 ${reportTitle}</h1>
          <p>${getCurrentDate()} ${isOverallReport ? '' : `<span class="badge badge-team">${teamName}</span>`}</p>
        </div>
        
        <div class="content">
          <div class="stats">
            <div class="stat-card">
              <h3>${totalProjects}</h3>
              <p>Total Projects</p>
            </div>
            <div class="stat-card">
              <h3>${activeProjects}</h3>
              <p>Active Projects</p>
            </div>
            <div class="stat-card">
              <h3>${completedProjects}</h3>
              <p>Completed</p>
            </div>
            <div class="stat-card">
              <h3>${completionRate}%</h3>
              <p>Completion Rate</p>
            </div>
          </div>

          <div class="chart-container">
            <img src="cid:statusChart" alt="Status Chart" />
          </div>

          <div class="chart-container">
            <img src="cid:progressChart" alt="Progress Chart" />
          </div>

          <div class="chart-container">
            <img src="cid:deadlineChart" alt="Deadline Status Chart" />
          </div>

          ${isOverallReport ? `
          <div class="chart-container">
            <img src="cid:teamChart" alt="Team Performance Chart" />
          </div>
          ` : ''}

          <h2 style="margin-top: 40px; color: #1F2937;">Active Projects</h2>
          <table>
            <thead>
              <tr>
                <th>Project Name</th>
                <th style="text-align: center;">Progress</th>
                <th style="text-align: center;">Target Date</th>
                <th style="text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${activeProjectsList || '<tr><td colspan="4" style="text-align: center; padding: 20px; color: #6B7280;">No active projects</td></tr>'}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>This is an automated report from Linear Project Tracking System</p>
          <p>Generated on ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi' })} (Kenya Time)</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Send individual report
async function sendReport(projects, teamName, recipient, teams = null) {
  try {
    const isOverallReport = !teamName;
    console.log(`\nGenerating ${teamName ? teamName + ' team' : 'overall'} report...`);
    
    const statusChartBuffer = await generateStatusChart(projects);
    const progressChartBuffer = await generateProgressChart(projects);
    const emailHtml = generateEmailHtml(projects, teamName);

    const subject = teamName 
      ? `📊 ${teamName} Team Report (Advanced Analytics) - ${getCurrentDate()}`
      : `📊 Overall Project Report (Advanced Analytics) - ${getCurrentDate()}`;

    // Generate deadline chart for all reports
    const deadlineChartBuffer = await generateDeadlineChart(projects);
    
    const attachments = [
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
        filename: 'deadline-chart.png',
        content: deadlineChartBuffer,
        cid: 'deadlineChart'
      }
    ];

    // Add team performance chart for overall report only
    if (isOverallReport && teams) {
      const teamChartBuffer = await generateTeamPerformanceChart(projects, teams);
      
      attachments.push({
        filename: 'team-chart.png',
        content: teamChartBuffer,
        cid: 'teamChart'
      });
    }

    const mailOptions = {
      from: EMAIL_USER,
      to: recipient,
      subject: subject,
      html: emailHtml,
      attachments: attachments
    };

    await transporter.sendMail(mailOptions);
    console.log(`✓ ${teamName ? teamName + ' team' : 'Overall'} report sent successfully!`);
    
  } catch (error) {
    console.error(`✗ Error sending ${teamName ? teamName + ' team' : 'overall'} report:`, error.message);
  }
}

// Main function to send all reports
async function sendAllReports() {
  try {
    console.log('Fetching projects and teams from Linear API...');
    const data = await fetchLinearData();
    const allProjects = data.projects.nodes;
    const teams = data.teams.nodes;

    console.log(`Found ${allProjects.length} projects and ${teams.length} teams.`);
    console.log('Sending reports...\n');

    // Send overall report with advanced analytics
    await sendReport(allProjects, null, EMAIL_TO, teams);

    // Wait a bit between emails to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Send individual team reports
    for (const team of teams) {
      const teamProjects = allProjects.filter(p => 
        p.teams.nodes.some(t => t.id === team.id)
      );

      if (teamProjects.length > 0) {
        await sendReport(teamProjects, team.name, EMAIL_TO, null);
        // Wait between emails
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        console.log(`⊘ Skipping ${team.name} - no projects found`);
      }
    }

    console.log('\n✓ All reports sent successfully!');
    console.log(`Total emails sent: ${teams.filter(t => allProjects.some(p => p.teams.nodes.some(pt => pt.id === t.id))).length + 1}`);
    
  } catch (error) {
    console.error('Error generating reports:', error.message);
    if (error.response) {
      console.error('API Error Details:', error.response.data);
    }
  }
}

// Execute
sendAllReports();
