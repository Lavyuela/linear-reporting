# Linear Report Scheduler Startup Script
# This script starts the email scheduler in the background

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Start the scheduler
Write-Host "Starting Linear Report Scheduler..."
Write-Host "Reports will be sent daily at 5:00 PM to ivy@purpleelephant.ventures"

# Run the scheduler
node scheduler.js

# Keep the window open if there's an error
if ($LASTEXITCODE -ne 0) {
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
