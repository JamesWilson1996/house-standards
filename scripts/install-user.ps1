# Enable house-standards for every repo you open on this machine, adopted or not.
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'lib/HouseSettings.ps1')

$configDir = if ($env:CLAUDE_CONFIG_DIR) { $env:CLAUDE_CONFIG_DIR } else { Join-Path $HOME '.claude' }
$userSettings = Join-Path $configDir 'settings.json'

if (Test-Path $userSettings) { Copy-Item $userSettings "$userSettings.before-house" -Force }
Merge-HouseSettings -SettingsPath $userSettings

Write-Host "Enabled house-standards in $userSettings"
if (Test-Path "$userSettings.before-house") { Write-Host "Backup: $userSettings.before-house" }
Write-Host 'Start a new Claude Code session; /plugin should list house-standards@house.'
