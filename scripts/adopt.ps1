# Wire a local repo checkout to house-standards. Safe to re-run: it merges, never overwrites.
param([Parameter(Mandatory, HelpMessage = 'Path to the repo to adopt')] [string] $TargetRepo)
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'lib/HouseSettings.ps1')

$target = (Resolve-Path $TargetRepo).Path
$template = Join-Path $PSScriptRoot '../templates/consumer'

$settings = Join-Path $target '.claude/settings.json'
$hadSettings = Test-Path $settings
Merge-HouseSettings -SettingsPath $settings
Write-Host ($(if ($hadSettings) { 'merged  ' } else { 'created ' }) + '.claude/settings.json')

$workflowDir = Join-Path $target '.github/workflows'
New-Item -ItemType Directory -Path $workflowDir -Force | Out-Null
Copy-Item (Join-Path $template '.github/workflows/house-standards.yml') $workflowDir -Force
Write-Host 'wrote   .github\workflows\house-standards.yml'

$claudeMd = Join-Path $target 'CLAUDE.md'
if (Test-Path $claudeMd) {
    Write-Host 'kept    CLAUDE.md (remove any pasted house standards text; the plugin provides it)'
} else {
    $repoName = Split-Path $target -Leaf
    $stub = [System.IO.File]::ReadAllText((Join-Path $template 'CLAUDE.md')).Replace('REPO_NAME', $repoName)
    [System.IO.File]::WriteAllText($claudeMd, $stub, (New-Object System.Text.UTF8Encoding $false))
    Write-Host 'created CLAUDE.md (fill in the repo-specific sections)'
}
