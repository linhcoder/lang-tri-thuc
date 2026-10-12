$ErrorActionPreference = 'Stop'
$taskWorkspace = Split-Path -Parent $PSScriptRoot
$taskConfigPath = Join-Path $taskWorkspace 'temp/deploy/offsite-config.json'
if (-not (Test-Path -LiteralPath $taskConfigPath)) { throw 'Offsite configuration is not connected.' }
$taskConfig = Get-Content -LiteralPath $taskConfigPath -Raw | ConvertFrom-Json
if ($taskConfig.enabled -ne $true -or $taskConfig.destination.kind -ne 'local-encrypted' -or -not $taskConfig.destination.directory) {
    throw 'Connect an encrypted destination before installing the schedule.'
}
$taskPython = (Get-Command python).Source
$taskScript = Join-Path $PSScriptRoot 'offsite-backup.py'
$taskAction = New-ScheduledTaskAction -Execute $taskPython -Argument ('"' + $taskScript + '"') -WorkingDirectory $taskWorkspace
$taskTrigger = New-ScheduledTaskTrigger -Daily -At '02:15'
$taskSettings = New-ScheduledTaskSettingsSet -StartWhenAvailable -RunOnlyIfNetworkAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 15) -MultipleInstances IgnoreNew
$taskPrincipal = New-ScheduledTaskPrincipal -UserId ([System.Security.Principal.WindowsIdentity]::GetCurrent().Name) -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName 'LangTriThucOffsiteBackup' -Action $taskAction -Trigger $taskTrigger -Settings $taskSettings -Principal $taskPrincipal -Description 'Encrypted application backup when this Windows account is signed in.' -Force | Select-Object TaskName, State
