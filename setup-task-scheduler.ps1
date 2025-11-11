# Setup Windows Task Scheduler for Linear Report Scheduler
# Run this script as Administrator

$taskName = "Linear Report Scheduler"
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$batchFile = Join-Path $scriptPath "start-scheduler.bat"

Write-Host "Setting up Windows Task Scheduler..." -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator', then run this script again." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Remove existing task if it exists
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existingTask) {
    Write-Host "Removing existing task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# Create the scheduled task
Write-Host "Creating scheduled task: $taskName" -ForegroundColor Green

# Task action - run the batch file
$action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$batchFile`"" -WorkingDirectory $scriptPath

# Task trigger - at system startup
$trigger = New-ScheduledTaskTrigger -AtStartup

# Task settings
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1) `
    -ExecutionTimeLimit (New-TimeSpan -Days 365)

# Get current user
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited

# Register the task
Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Description "Automatically starts the Linear Report Scheduler which sends daily email reports at 5:00 PM"

Write-Host ""
Write-Host "✓ Task Scheduler setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "The scheduler will now:" -ForegroundColor Cyan
Write-Host "  • Start automatically when Windows starts"
Write-Host "  • Send daily email reports at 5:00 PM (17:00) Israel time"
Write-Host "  • Send reports to: ivy@purpleelephant.ventures"
Write-Host ""
Write-Host "To start the scheduler now without restarting, run:" -ForegroundColor Yellow
Write-Host "  start-scheduler.bat"
Write-Host ""
Write-Host "To view/manage the task:" -ForegroundColor Yellow
Write-Host "  1. Open Task Scheduler (taskschd.msc)"
Write-Host "  2. Look for 'Linear Report Scheduler'"
Write-Host ""
Write-Host "Setup complete!"
