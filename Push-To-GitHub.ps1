$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$owner = 'rajkamalbhakat'
$repo = "$owner/Student-Life-OS"
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Install Git first.' }
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) { throw 'Install GitHub CLI, then run gh auth login using rajkamalbhakat.' }
$login = gh api user --jq '.login'
if ($LASTEXITCODE -ne 0) { throw 'Sign in first with gh auth login.' }
if ($login.Trim() -cne $owner) { throw "Authenticated as $login; this project must be pushed by $owner. Use gh auth switch or gh auth login to select the correct account." }
if (-not (Test-Path '.git')) {
    git init -b main
    if ($LASTEXITCODE -ne 0) { throw 'Git initialisation failed.' }
}
git add -- .
if ($LASTEXITCODE -ne 0) { throw 'Could not stage project files.' }
git diff --cached --quiet
if ($LASTEXITCODE -eq 1) {
    git -c user.name=Rajkamal -c user.email=rajkamalbhakat@users.noreply.github.com commit -m 'Build Orbit student life web application'
    if ($LASTEXITCODE -ne 0) { throw 'Commit failed.' }
}
$existing = gh repo view $repo --json name --jq '.name' 2>$null
if ($LASTEXITCODE -ne 0) {
    gh repo create $repo --private
    if ($LASTEXITCODE -ne 0) { throw 'Could not create the repository. Check permissions and try again.' }
}
$remote = git remote get-url origin 2>$null
$desired = "https://github.com/$repo.git"
if ($LASTEXITCODE -ne 0) { git remote add origin $desired }
elseif ($remote.Trim() -notin @($desired, "git@github.com:$repo.git")) { throw "Origin points to $remote. Refusing to push to a different repository." }
gh auth setup-git
if ($LASTEXITCODE -ne 0) { throw 'Could not configure GitHub authentication.' }
git push --set-upstream origin main
if ($LASTEXITCODE -ne 0) { throw 'Push failed. No force-push was attempted. Check repository permissions or existing remote history.' }
Write-Host "Published source to https://github.com/$repo"
