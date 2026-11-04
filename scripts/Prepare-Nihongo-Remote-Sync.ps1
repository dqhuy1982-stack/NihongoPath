# Preflight only. Backs up LOCAL and REMOTE D1 into git-ignored files.
# Does NOT run migrations, deploy a Worker, or publish a site.
# Stop the local Wrangler dev server first, so local SQLite can be exported.
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $root

$config = Join-Path $root 'wrangler.backend.jsonc'
if (-not (Test-Path $config)) { throw 'Expected backend config not found.' }
if (-not (Test-Path (Join-Path $root '.wrangler\state\v3\d1'))) {
  throw 'Local D1 state not found. Run the local sync sandbox before backup.'
}
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
  throw 'npx is missing. Install Node.js/npm first.'
}

$folder = Join-Path $root '.private-backups'
New-Item -ItemType Directory -Path $folder -Force | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$localBackup = Join-Path $folder ("nihongopath-local-" + $stamp + ".sql")
$remoteBackup = Join-Path $folder ("nihongopath-remote-before-sync-" + $stamp + ".sql")

Write-Host '1/3 Backing up local D1 learning data...'
& npx wrangler d1 export nihongopath-dev --local --config wrangler.backend.jsonc --output $localBackup
if ($LASTEXITCODE -ne 0 -or -not (Test-Path $localBackup)) {
  throw 'Local backup failed. No remote changes were made.'
}
if ((Get-Item $localBackup).Length -lt 200) {
  throw 'Local backup is unexpectedly small. Inspect before continuing.'
}

# Wrangler d1 info can fail with Cloudflare API authentication error 10000
# even when D1 SQL execution works. Check remote schema through read-only SQL
# and do not block the backup on the separate management API endpoint.
Write-Host '2/3 Reading remote D1 table names (read-only SQL)...'
& npx wrangler d1 execute nihongopath-dev --remote --config wrangler.backend.jsonc --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
if ($LASTEXITCODE -ne 0) { throw 'Cannot inspect remote D1 schema. No remote changes were made.' }

Write-Host '3/3 Backing up remote D1 before any future deployment...'
& npx wrangler d1 export nihongopath-dev --remote --config wrangler.backend.jsonc --output $remoteBackup
if ($LASTEXITCODE -ne 0 -or -not (Test-Path $remoteBackup)) {
  throw 'Remote backup failed. No migration or Worker deployment was made.'
}
if ((Get-Item $remoteBackup).Length -lt 200) {
  throw 'Remote backup is unexpectedly small. Inspect before continuing.'
}

Write-Host ''
Write-Host 'PREFLIGHT COMPLETE - no remote writes or deployment.'
Write-Host ('Local backup size:  ' + (Get-Item $localBackup).Length + ' bytes')
Write-Host ('Remote backup size: ' + (Get-Item $remoteBackup).Length + ' bytes')
Write-Host 'Both backups are stored in .private-backups (ignored by git).'
Write-Host 'Do not share the SQL files, family key, or their contents.'
Write-Host 'Share only this console status and any errors, with personal details redacted.'
