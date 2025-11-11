const axios = require('axios');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

// Load environment variables
dotenv.config();

// Email configuration
const EMAIL_USER = 'ivy@purpleelephant.ventures';
const EMAIL_PASS = 'hjpp ylto whdl msjs';
const EMAIL_TO = process.argv[2] || EMAIL_USER;
const REPORT_TYPE = process.argv[3] || 'weekly'; // weekly, monthly, quarterly, yearly

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

// Date helpers
const getDateRange = (type) => {
  const now = new Date();
  const startDate = new Date();
  
  switch(type) {
    case 'weekly':
      // Get Monday of the current week
      const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      let daysToMonday;
      if (dayOfWeek === 0) {
        // If Sunday, go back to previous Monday (6 days back)
        daysToMonday = 6;
      } else if (dayOfWeek === 6) {
        // If Saturday, go back to Monday of this week (5 days back)
        daysToMonday = 5;
      } else {
        // Monday-Friday: go back to Monday of this week
        daysToMonday = dayOfWeek - 1;
      }
      startDate.setDate(now.getDate() - daysToMonday);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'monthly':
      // First day of current month
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'quarterly':
      // First day of current quarter
      const currentMonth = now.getMonth();
      const quarterStartMonth = Math.floor(currentMonth / 3) * 3; // 0, 3, 6, or 9
      startDate.setMonth(quarterStartMonth);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'yearly':
      // January 1st of current year
      startDate.setMonth(0);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      break;
  }
  
  return { startDate, endDate: now };
};

const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getReportTitle = (type) => {
  const now = new Date();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  
  switch(type) {
    case 'weekly':
      return 'Weekly Report';
    case 'monthly':
      return `${monthNames[now.getMonth()]} ${now.getFullYear()} Report`;
    case 'quarterly':
      const quarter = Math.floor(now.getMonth() / 3) + 1;
      return `Q${quarter} ${now.getFullYear()} Report`;
    case 'yearly':
      return `${now.getFullYear()} Annual Report`;
    default:
      return 'Report';
  }
};

const getDateRangeText = (type) => {
  const { startDate, endDate } = getDateRange(type);
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
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
          completedAt
          createdAt
          updatedAt
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

// Filter projects by date range
function filterProjectsByDateRange(projects, type) {
  const { startDate, endDate } = getDateRange(type);
  
  return projects.filter(p => {
    const createdAt = p.createdAt ? new Date(p.createdAt) : null;
    const updatedAt = p.updatedAt ? new Date(p.updatedAt) : null;
    const completedAt = p.completedAt ? new Date(p.completedAt) : null;
    
    // Include if created, updated, or completed in date range
    return (createdAt && createdAt >= startDate && createdAt <= endDate) ||
           (updatedAt && updatedAt >= startDate && updatedAt <= endDate) ||
           (completedAt && completedAt >= startDate && completedAt <= endDate);
  });
}

// Calculate period metrics
function calculatePeriodMetrics(allProjects, periodProjects, type) {
  const { startDate, endDate } = getDateRange(type);
  
  // Projects completed in period
  const completedInPeriod = allProjects.filter(p => {
    const completedAt = p.completedAt ? new Date(p.completedAt) : null;
    return completedAt && completedAt >= startDate && completedAt <= endDate;
  });
  
  // Projects created in period
  const createdInPeriod = allProjects.filter(p => {
    const createdAt = p.createdAt ? new Date(p.createdAt) : null;
    return createdAt && createdAt >= startDate && createdAt <= endDate;
  });
  
  // Projects with activity in period
  const activeInPeriod = periodProjects.filter(p => 
    p.state !== 'completed' && p.state !== 'canceled'
  );
  
  return {
    totalProjects: allProjects.length,
    completedInPeriod: completedInPeriod.length,
    createdInPeriod: createdInPeriod.length,
    activeInPeriod: activeInPeriod.length,
    completionRate: allProjects.length > 0 
      ? Math.round((allProjects.filter(p => p.state === 'completed').length / allProjects.length) * 100)
      : 0
  };
}

// Generate completion trend chart
async function generateCompletionTrendChart(projects, type) {
  const { startDate, endDate } = getDateRange(type);
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  
  let intervals, intervalLabel;
  if (type === 'weekly') {
    intervals = 5; // Mon-Fri
    intervalLabel = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  } else if (type === 'monthly') {
    intervals = 4;
    intervalLabel = 'Week';
  } else if (type === 'quarterly') {
    intervals = 3;
    intervalLabel = 'Month';
  } else {
    intervals = 12;
    intervalLabel = 'Month';
  }
  
  const labels = [];
  const completedData = [];
  const createdData = [];
  
  for (let i = 0; i < intervals; i++) {
    if (type === 'weekly') {
      labels.push(intervalLabel[i]);
    } else {
      labels.push(`${intervalLabel} ${i + 1}`);
    }
    
    const intervalStart = new Date(startDate);
    const intervalEnd = new Date(startDate);
    
    if (type === 'weekly') {
      intervalStart.setDate(startDate.getDate() + i);
      intervalEnd.setDate(startDate.getDate() + i + 1);
    } else if (type === 'monthly') {
      intervalStart.setDate(startDate.getDate() + (i * 7));
      intervalEnd.setDate(startDate.getDate() + ((i + 1) * 7));
    } else if (type === 'quarterly') {
      intervalStart.setMonth(startDate.getMonth() + i);
      intervalEnd.setMonth(startDate.getMonth() + i + 1);
    } else {
      intervalStart.setMonth(startDate.getMonth() + i);
      intervalEnd.setMonth(startDate.getMonth() + i + 1);
    }
    
    const completed = projects.filter(p => {
      const completedAt = p.completedAt ? new Date(p.completedAt) : null;
      return completedAt && completedAt >= intervalStart && completedAt < intervalEnd;
    }).length;
    
    const created = projects.filter(p => {
      const createdAt = p.createdAt ? new Date(p.createdAt) : null;
      return createdAt && createdAt >= intervalStart && createdAt < intervalEnd;
    }).length;
    
    completedData.push(completed);
    createdData.push(created);
  }
  
  const configuration = {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Projects Completed',
          data: completedData,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Projects Created',
          data: createdData,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
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
          text: `${getReportTitle(type)} - Project Activity Trend`,
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

// Generate team performance comparison chart
async function generateTeamComparisonChart(projects, teams, type) {
  const { startDate, endDate } = getDateRange(type);
  
  const teamData = {};
  teams.forEach(team => {
    const teamProjects = projects.filter(p => p.teams.nodes.some(t => t.id === team.id));
    
    const completed = teamProjects.filter(p => {
      const completedAt = p.completedAt ? new Date(p.completedAt) : null;
      return completedAt && completedAt >= startDate && completedAt <= endDate;
    }).length;
    
    const created = teamProjects.filter(p => {
      const createdAt = p.createdAt ? new Date(p.createdAt) : null;
      return createdAt && createdAt >= startDate && createdAt <= endDate;
    }).length;
    
    teamData[team.name] = { completed, created };
  });
  
  const configuration = {
    type: 'bar',
    data: {
      labels: Object.keys(teamData),
      datasets: [
        {
          label: 'Completed',
          data: Object.values(teamData).map(t => t.completed),
          backgroundColor: '#10B981',
          borderRadius: 5
        },
        {
          label: 'Created',
          data: Object.values(teamData).map(t => t.created),
          backgroundColor: '#3B82F6',
          borderRadius: 5
        }
      ]
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
          text: `Team Performance - ${getReportTitle(type)}`,
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

// Generate progress overview chart
async function generateProgressOverviewChart(projects) {
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
          text: 'Current Progress Distribution',
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

// Generate HTML email
function generatePeriodicReportHtml(allProjects, periodProjects, metrics, type) {
  const reportTitle = getReportTitle(type);
  const dateRange = getDateRangeText(type);
  
  const topProjects = periodProjects
    .filter(p => p.state === 'completed')
    .slice(0, 10)
    .map(p => `
      <tr style="border-bottom: 1px solid #E5E7EB;">
        <td style="padding: 12px; font-weight: 500;">✅ ${p.name}</td>
        <td style="padding: 12px; text-align: center;">${formatDate(p.completedAt)}</td>
        <td style="padding: 12px; text-align: center;">
          ${p.teams.nodes.map(t => `<span style="background: #DBEAFE; color: #1E40AF; padding: 2px 8px; border-radius: 8px; font-size: 11px;">${t.name}</span>`).join(' ')}
        </td>
      </tr>
    `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1F2937; background: #F9FAFB; margin: 0; padding: 0; }
        .container { max-width: 900px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 32px; font-weight: 700; }
        .header p { margin: 10px 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 30px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 30px; }
        .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; text-align: center; color: white; }
        .stat-card h3 { margin: 0; font-size: 36px; font-weight: 700; }
        .stat-card p { margin: 8px 0 0; font-size: 13px; opacity: 0.9; }
        .chart-container { margin: 30px 0; text-align: center; }
        .chart-container img { max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #F3F4F6; padding: 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #E5E7EB; }
        .footer { background: #F3F4F6; padding: 20px 30px; text-align: center; color: #6B7280; font-size: 12px; }
        .highlight { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 8px; }
        .highlight h3 { margin: 0 0 10px 0; color: #92400E; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 ${reportTitle}</h1>
          <p>${dateRange}</p>
        </div>
        
        <div class="content">
          <div class="stats">
            <div class="stat-card">
              <h3>${metrics.totalProjects}</h3>
              <p>Total Projects</p>
            </div>
            <div class="stat-card">
              <h3>${metrics.createdInPeriod}</h3>
              <p>Created This Period</p>
            </div>
            <div class="stat-card">
              <h3>${metrics.completedInPeriod}</h3>
              <p>Completed This Period</p>
            </div>
            <div class="stat-card">
              <h3>${metrics.activeInPeriod}</h3>
              <p>Currently Active</p>
            </div>
            <div class="stat-card">
              <h3>${metrics.completionRate}%</h3>
              <p>Overall Completion Rate</p>
            </div>
          </div>

          <div class="highlight">
            <h3>📈 Period Highlights</h3>
            <p><strong>${metrics.completedInPeriod}</strong> projects completed | <strong>${metrics.createdInPeriod}</strong> new projects started | <strong>${metrics.activeInPeriod}</strong> projects in progress</p>
          </div>

          <div class="chart-container">
            <img src="cid:trendChart" alt="Activity Trend" />
          </div>

          <div class="chart-container">
            <img src="cid:teamChart" alt="Team Performance" />
          </div>

          <div class="chart-container">
            <img src="cid:progressChart" alt="Progress Overview" />
          </div>

          <h2 style="margin-top: 40px; color: #1F2937;">Projects Completed This Period</h2>
          <table>
            <thead>
              <tr>
                <th>Project Name</th>
                <th style="text-align: center;">Completed Date</th>
                <th style="text-align: center;">Team</th>
              </tr>
            </thead>
            <tbody>
              ${topProjects || '<tr><td colspan="3" style="text-align: center; padding: 20px; color: #6B7280;">No projects completed in this period</td></tr>'}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>This is an automated ${reportTitle.toLowerCase()} from Linear Project Tracking System</p>
          <p>Generated on ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi' })} (Kenya Time)</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Main function
async function sendPeriodicReport() {
  try {
    console.log(`\n📊 Generating ${getReportTitle(REPORT_TYPE)}...`);
    console.log(`Period: ${getDateRangeText(REPORT_TYPE)}\n`);
    
    console.log('Fetching data from Linear API...');
    const data = await fetchLinearData();
    const allProjects = data.projects.nodes;
    const teams = data.teams.nodes;
    
    console.log(`Found ${allProjects.length} total projects`);
    
    const periodProjects = filterProjectsByDateRange(allProjects, REPORT_TYPE);
    console.log(`${periodProjects.length} projects with activity in this period`);
    
    const metrics = calculatePeriodMetrics(allProjects, periodProjects, REPORT_TYPE);
    
    console.log('\nGenerating charts...');
    const trendChartBuffer = await generateCompletionTrendChart(allProjects, REPORT_TYPE);
    const teamChartBuffer = await generateTeamComparisonChart(allProjects, teams, REPORT_TYPE);
    const progressChartBuffer = await generateProgressOverviewChart(allProjects);
    
    const emailHtml = generatePeriodicReportHtml(allProjects, periodProjects, metrics, REPORT_TYPE);
    
    const mailOptions = {
      from: EMAIL_USER,
      to: EMAIL_TO,
      subject: `📊 ${getReportTitle(REPORT_TYPE)} - Linear Projects (${getDateRangeText(REPORT_TYPE)})`,
      html: emailHtml,
      attachments: [
        {
          filename: 'trend-chart.png',
          content: trendChartBuffer,
          cid: 'trendChart'
        },
        {
          filename: 'team-chart.png',
          content: teamChartBuffer,
          cid: 'teamChart'
        },
        {
          filename: 'progress-chart.png',
          content: progressChartBuffer,
          cid: 'progressChart'
        }
      ]
    };
    
    console.log('\nSending email...');
    await transporter.sendMail(mailOptions);
    
    console.log(`\n✅ ${getReportTitle(REPORT_TYPE)} sent successfully to ${EMAIL_TO}!`);
    console.log('\nReport Summary:');
    console.log(`  • Total Projects: ${metrics.totalProjects}`);
    console.log(`  • Created This Period: ${metrics.createdInPeriod}`);
    console.log(`  • Completed This Period: ${metrics.completedInPeriod}`);
    console.log(`  • Currently Active: ${metrics.activeInPeriod}`);
    console.log(`  • Completion Rate: ${metrics.completionRate}%`);
    
  } catch (error) {
    console.error('Error generating periodic report:', error.message);
    if (error.response) {
      console.error('API Error Details:', error.response.data);
    }
  }
}

// Execute
sendPeriodicReport();
