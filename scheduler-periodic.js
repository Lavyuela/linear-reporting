const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');

console.log('Linear Periodic Reports Scheduler started...');
console.log('Reports will be sent to ivy@purpleelephant.ventures\n');
console.log('Schedule:');
console.log('  • Weekly Report: Every Friday at 5:00 PM');
console.log('  • Monthly Report: Last day of each month at 5:00 PM');
console.log('  • Quarterly Report: Last day of quarter (Mar 31, Jun 30, Sep 30, Dec 31) at 5:00 PM');
console.log('  • Yearly Report: December 31st at 5:00 PM');
console.log('  • Daily Team Reports: Every day at 5:00 PM\n');

const scriptPath = path.join(__dirname, 'send-periodic-reports.js');
const teamReportsPath = path.join(__dirname, 'send-team-reports.js');
const recipient = 'ivy@purpleelephant.ventures';

// Helper function to run report
function runReport(reportType, reportName) {
  console.log(`[${new Date().toISOString()}] Running ${reportName}...`);
  
  exec(`node "${scriptPath}" ${recipient} ${reportType}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing ${reportName}: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`${reportName} stderr: ${stderr}`);
    }
    console.log(`${reportName} output: ${stdout}`);
    console.log(`[${new Date().toISOString()}] ${reportName} sent successfully!\n`);
  });
}

// Daily team reports at 5:00 PM Kenya time
cron.schedule('0 17 * * *', () => {
  console.log(`[${new Date().toISOString()}] Running daily team reports...`);
  
  exec(`node "${teamReportsPath}" ${recipient}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing daily reports: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Daily reports stderr: ${stderr}`);
    }
    console.log(`Daily reports output: ${stdout}`);
    console.log(`[${new Date().toISOString()}] Daily reports sent successfully!\n`);
  });
}, {
  timezone: "Africa/Nairobi"
});

// Weekly report - Every Friday at 5:00 PM Kenya time
cron.schedule('0 17 * * 5', () => {
  runReport('weekly', 'Weekly Report');
}, {
  timezone: "Africa/Nairobi"
});

// Monthly report - Last day of each month at 5:00 PM Kenya time
// Runs on 28th, 29th, 30th, or 31st depending on the month
cron.schedule('0 17 28-31 * *', () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  // Only run if tomorrow is a different month (meaning today is last day of month)
  if (tomorrow.getMonth() !== today.getMonth()) {
    runReport('monthly', 'Monthly Report');
  }
}, {
  timezone: "Africa/Nairobi"
});

// Quarterly report - Last day of quarter at 5:00 PM Kenya time
// March 31, June 30, September 30, December 31
cron.schedule('0 17 31 3,12 *', () => {
  runReport('quarterly', 'Quarterly Report');
}, {
  timezone: "Africa/Nairobi"
});

cron.schedule('0 17 30 6,9 *', () => {
  runReport('quarterly', 'Quarterly Report');
}, {
  timezone: "Africa/Nairobi"
});

// Yearly report - December 31st at 5:00 PM Kenya time
cron.schedule('0 17 31 12 *', () => {
  runReport('yearly', 'Yearly Report');
}, {
  timezone: "Africa/Nairobi"
});

console.log('All schedulers are running. Press Ctrl+C to stop.');

// Keep the process running
process.on('SIGINT', () => {
  console.log('\nScheduler stopped.');
  process.exit(0);
});
