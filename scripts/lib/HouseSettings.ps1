# Shared helpers for the PowerShell scripts. Works in Windows PowerShell 5.1 and PowerShell 7+.

$script:TemplateSettingsPath = Join-Path $PSScriptRoot '../../templates/consumer/.claude/settings.json'

function Merge-JsonObject {
    param([Parameter(Mandatory)] $Base, [Parameter(Mandatory)] $Overlay)
    # Deep merge so a repo's own permissions, hooks and env survive.
    foreach ($property in $Overlay.PSObject.Properties) {
        $existing = $Base.PSObject.Properties[$property.Name]
        $bothObjects = $existing -and ($existing.Value -is [pscustomobject]) -and ($property.Value -is [pscustomobject])
        if ($bothObjects) {
            Merge-JsonObject -Base $existing.Value -Overlay $property.Value | Out-Null
        } elseif ($existing) {
            $existing.Value = $property.Value
        } else {
            $Base | Add-Member -NotePropertyName $property.Name -NotePropertyValue $property.Value
        }
    }
    return $Base
}

function Read-JsonFile {
    param([Parameter(Mandatory)] [string] $Path)
    if (-not (Test-Path $Path)) { return [pscustomobject]@{} }
    $text = [System.IO.File]::ReadAllText((Resolve-Path $Path))
    if ([string]::IsNullOrWhiteSpace($text)) { return [pscustomobject]@{} }
    return $text | ConvertFrom-Json
}

function Write-JsonFile {
    param([Parameter(Mandatory)] [string] $Path, [Parameter(Mandatory)] $Value)
    $json = $Value | ConvertTo-Json -Depth 32
    # Windows PowerShell's UTF8 encoding adds a BOM, which some JSON readers reject.
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($Path, $json + [Environment]::NewLine, $utf8NoBom)
}

function Merge-HouseSettings {
    param([Parameter(Mandatory)] [string] $SettingsPath)
    $directory = Split-Path -Parent $SettingsPath
    if (-not (Test-Path $directory)) { New-Item -ItemType Directory -Path $directory -Force | Out-Null }
    $merged = Merge-JsonObject -Base (Read-JsonFile $SettingsPath) -Overlay (Read-JsonFile $script:TemplateSettingsPath)
    Write-JsonFile -Path $SettingsPath -Value $merged
}
