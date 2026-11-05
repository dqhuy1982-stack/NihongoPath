# Nihongo Path: ONE Worker (nihongopath), ONE remote D1, ONE develop branch.
# Default: dry run only. -Publish deploys the CURRENT website, not a second one.
# Requires FAMILY_SYNC_KEY to exist as a secret on that existing Worker.
param([switch]$Publish)
$ErrorActionPreference='Stop'
$root=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $root

$branch=(& git branch --show-current).Trim()
if($LASTEXITCODE -ne 0 -or $branch -ne 'develop'){
  throw 'Switch to develop before building/publishing. No branch or website created.'
}
if(-not (Get-Command node -ErrorAction SilentlyContinue)){
  throw 'Node.js 24+ required.'
}
if(-not (Get-Command npx.cmd -ErrorAction SilentlyContinue)){
  throw 'npx.cmd required.'
}

# Guard against accidentally deploying to an unrelated Worker/database.
$cfg=Get-Content '.\wrangler.jsonc' -Raw | ConvertFrom-Json
if($cfg.name -cne 'nihongopath' -or
   $cfg.main -cne './workers/nihongopath-api.mjs' -or
   $cfg.assets.binding -cne 'ASSETS' -or
   $cfg.assets.run_worker_first.Count -ne 1 -or
   $cfg.assets.run_worker_first[0] -cne '/api/*' -or
   $cfg.d1_databases.Count -ne 1 -or
   $cfg.d1_databases[0].database_id -cne '8504e0d8-c7a5-490d-ab40-a7590cd9af9d' -or
   $cfg.routes -or $cfg.route){
  throw 'Unexpected Worker/config/D1 target. Refusing publication.'
}
if($Publish){
  & git diff --exit-code -- wrangler.jsonc workers/nihongopath-api.mjs workers/family-identity.mjs scripts/build-site.cjs
  if($LASTEXITCODE -ne 0){throw 'Core deployment files have uncommitted edits. Review/commit first.'}
  & git diff --cached --exit-code -- wrangler.jsonc workers/nihongopath-api.mjs workers/family-identity.mjs scripts/build-site.cjs
  if($LASTEXITCODE -ne 0){throw 'Core deployment files have staged edits. Review/commit first.'}
}

Write-Host 'Building ONE Nihongo Path website with optional family D1 pairing...'
$previous=[Environment]::GetEnvironmentVariable('NP_FAMILY_SYNC_BUILD','Process')
try {
  $env:NP_FAMILY_SYNC_BUILD='1'
  & node .\scripts\build-site.cjs
  if($LASTEXITCODE -ne 0){throw 'Family D1 frontend build failed.'}
} finally {
  if($null -eq $previous){Remove-Item Env:\NP_FAMILY_SYNC_BUILD -ErrorAction SilentlyContinue}
  else{$env:NP_FAMILY_SYNC_BUILD=$previous}
}
if(-not ((Get-Content '.\dist\site\index.html' -Raw).Contains('window.NP_FAMILY_SYNC=true;'))){
  throw 'Family D1 frontend flag missing.'
}
Write-Host 'Checking ONE Worker bundle (no publish)...'
& npx.cmd wrangler deploy --dry-run --config wrangler.jsonc
if($LASTEXITCODE -ne 0){throw 'Dry run failed; nothing published.'}
if(-not $Publish){
  Write-Host 'DRY RUN COMPLETE. To publish the existing Worker only, use -Publish after configuring its FAMILY_SYNC_KEY secret.'
  exit 0
}

Write-Host 'Checking secret name on existing nihongopath Worker (never reading value)...'
$secretList=& npx.cmd wrangler secret list --config wrangler.jsonc 2>&1
if($LASTEXITCODE -ne 0){throw 'Cannot list Worker secrets. Configure FAMILY_SYNC_KEY in Cloudflare dashboard first.'}
if(($secretList | Out-String) -notmatch '"name"\s*:\s*"FAMILY_SYNC_KEY"'){
  throw 'FAMILY_SYNC_KEY secret missing. In Cloudflare dashboard > nihongopath > Settings > Variables and Secrets, add a Secret before deploying.'
}
Write-Host 'The Worker secret name exists. Its value cannot be inspected by this script.'
$confirmation=Read-Host 'Type PUBLISH to update existing nihongopath Worker (same workers.dev URL)'
if($confirmation -cne 'PUBLISH'){throw 'Cancelled before publishing.'}

& npx.cmd wrangler deploy --config wrangler.jsonc
if($LASTEXITCODE -ne 0){throw 'Cloudflare deploy failed. Do not initialize family data until API is checked.'}
Write-Host 'EXISTING WEBSITE DEPLOYED. No other Worker/database was created.'
Write-Host 'Verify /api/pilot/bootstrap returns 401 without a family key, then pair once and initialize 4 profiles.'
