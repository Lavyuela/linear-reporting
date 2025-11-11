const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');

console.log('Linear Report Scheduler started...');
console.log('Reports will be sent daily at 5:00 PM to ivy@purpleelephant.ventures');
console.log('Sending: 1 overall report + individual team reports');

// Schedule task to run every day at 5:00 PM (17:00)
// Cron format: minute hour day month weekday
// '0 17 * * *' means: at minute 0 of hour 17 (5 PM), every day
cron.schedule('0 17 * * *', () => {
  console.log(`[${new Date().toISOString()}] Running scheduled reports...`);
  
  const scriptPath = path.join(__dirname, 'send-team-reports.js');
  const recipient = 'ivy@purpleelephant.ventures';
  
  exec(`node "${scriptPath}" ${recipient}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing reports: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Report stderr: ${stderr}`);
    }
    console.log(`Report output: ${stdout}`);
    console.log(`[${new Date().toISOString()}] All reports sent successfully!`);
  });
}, {
  timezone: "Africa/Nairobi" // Kenya timezone (EAT, GMT+3)
});

console.log('Scheduler is running. Press Ctrl+C to stop.');

// Keep the process running
process.on('SIGINT', () => {
  console.log('\nScheduler stopped.');
  process.exit(0);
});
