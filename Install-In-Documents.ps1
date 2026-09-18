$ErrorActionPreference = 'Stop'
$projectSource = $PSScriptRoot
$documentsPath = [Environment]::GetFolderPath('MyDocuments')
$projectTarget = Join-Path $documentsPath 'Student-Life-OS'
if ([IO.Path]::GetFullPath($projectSource).TrimEnd('\') -eq [IO.Path]::GetFullPath($projectTarget).TrimEnd('\')) {
    Write-Host "The project is already in $projectTarget"
    exit 0
}
if (Test-Path $projectTarget) { throw "The folder $projectTarget already exists. Choose a new folder name or move it first; existing files will not be overwritten." }
New-Item -ItemType Directory -Path $projectTarget | Out-Null
Get-ChildItem -LiteralPath $projectSource -Force | Where-Object { $_.Name -notin @('node_modules', 'data', '.git', '.env', '.vercel', '.sites-runtime', 'test-results') } | Copy-Item -Destination $projectTarget -Recurse
Write-Host "Project copied to $projectTarget"
Write-Host 'Double-click Start-Orbit.cmd in that folder, then open http://localhost:3000.'
