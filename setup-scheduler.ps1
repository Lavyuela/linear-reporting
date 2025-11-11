# PowerShell script to set up Windows Task Scheduler for automated reports
# This will run the Node.js scheduler as a background service

$scriptPath = $PSScriptRoot
$schedulerScript = Join-Path $scriptPath "scheduler.js"
$nodePath = (Get-Command node).Source

Write-Host "Setting up automated daily reports..." -ForegroundColor Green
Write-Host "Script location: $scriptPath" -ForegroundColor Cyan
Write-Host "Node.js path: $nodePath" -ForegroundColor Cyan

# Create a scheduled task that runs at startup and keeps running
$taskName = "LinearReportScheduler"
$taskDescription = "Automated Linear project reports sent daily at 5 PM"

# Check if task already exists
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if ($existingTask) {
    Write-Host "Task already exists. Removing old task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

# Create the action (run node scheduler.js)
$action = New-ScheduledTaskAction -Execute $nodePath `
    -Argument "`"$schedulerScript`"" `
    -WorkingDirectory $scriptPath

# Create trigger (at system startup)
$trigger = New-ScheduledTaskTrigger -AtStartup

# Create settings
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1) `
    -ExecutionTimeLimit (New-TimeSpan -Days 365)

# Register the scheduled task
Register-ScheduledTask `
    -TaskName $taskName `
    -Description $taskDescription `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -User $env:USERNAME `
    -RunLevel Highest

Write-Host "`nScheduled task created successfully!" -ForegroundColor Green
Write-Host "`nTask Details:" -ForegroundColor Cyan
Write-Host "  Name: $taskName"
Write-Host "  Description: $taskDescription"
Write-Host "  Schedule: Daily at 5:00 PM (Israel time)"
Write-Host "  Recipient: ivy@purpleelephant.ventures"
Write-Host "`nThe scheduler will start automatically when your computer starts."
Write-Host "You can also start it manually by running: npm run scheduler" -ForegroundColor Yellow
Write-Host "`nTo start the task now, run:" -ForegroundColor Yellow
Write-Host "  Start-ScheduledTask -TaskName '$taskName'" -ForegroundColor White
Write-Host "`nTo stop the task, run:" -ForegroundColor Yellow
Write-Host "  Stop-ScheduledTask -TaskName '$taskName'" -ForegroundColor White
Write-Host "`nTo remove the task, run:" -ForegroundColor Yellow
Write-Host "  Unregister-ScheduledTask -TaskName '$taskName' -Confirm:`$false" -ForegroundColor White
