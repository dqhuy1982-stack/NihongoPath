# Build and dry-run a SEPARATE, un-routed Cloudflare D1 sandbox Worker.
# Default is read/compile only. -Publish deploys ONLY the dark sandbox Worker.
# It does not enable workers.dev, preview URLs, migrations, imports or production.
param([switch]$Publish)
$ErrorActionPreference='Stop'
$root=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $root
$path=Join-Path $root 'wrangler.backend.jsonc'
if(-not(Test-Path $path)){throw 'Backend configuration missing.'}
$raw=Get-Content $path -Raw
$json=[regex]::Replace($raw,'(?m)^\s*//[^\r\n]*\r?\n','')
$cfg=$json | ConvertFrom-Json
if($cfg.name -cne 'nihongopath-d1-sandbox'){
  throw 'Unsafe Worker name: refusing to deploy anything except nihongopath-d1-sandbox.'
}
if($cfg.workers_dev -ne $false -or $cfg.preview_urls -ne $false -or $cfg.route -or $cfg.routes){
  throw 'Sandbox must have workers_dev=false, preview_urls=false and no routes.'
}
if($cfg.main -ne './workers/nihongopath-api.mjs'){
  throw 'Unexpected Worker entrypoint.'
}
if($cfg.d1_databases.Count -ne 1 -or
   $cfg.d1_databases[0].database_name -ne 'nihongopath-dev' -or
   $cfg.d1_databases[0].database_id -ne '8504e0d8-c7a5-490d-ab40-a7590cd9af9d'){
  throw 'Unexpected D1 binding; refusing deployment.'
}
if(-not(Get-Command npx.cmd -ErrorAction SilentlyContinue)){
  throw 'npx.cmd is required.'
}
$previous=[Environment]::GetEnvironmentVariable('NP_FAMILY_SYNC_BUILD','Process')
try{
  $env:NP_FAMILY_SYNC_BUILD='1'
  & node .\scripts\build-site.cjs
  if($LASTEXITCODE -ne 0){throw 'Frontend build failed.'}
}finally{
  if($null -eq $previous){Remove-Item Env:\NP_FAMILY_SYNC_BUILD -ErrorAction SilentlyContinue}
  else{$env:NP_FAMILY_SYNC_BUILD=$previous}
}
Write-Host 'Dry-running isolated Worker bundle with no publication...'
& npx.cmd wrangler deploy --dry-run --config wrangler.backend.jsonc
if($LASTEXITCODE -ne 0){throw 'Dry-run failed. Nothing deployed.'}
if(-not $Publish){
  Write-Host 'DRY RUN PASSED: no Cloudflare Worker, route, or D1 data changed.'
  Write-Host 'When reviewed, use this script with -Publish to deploy an unreachable sandbox Worker.'
  exit 0
}
Write-Host 'Deploying DARK sandbox: workers_dev=false, preview_urls=false, no routes.'
Write-Host 'This does not enable Internet access or change Nihongo Path production.'
& npx.cmd wrangler deploy --config wrangler.backend.jsonc
if($LASTEXITCODE -ne 0){throw 'Sandbox Worker deployment failed.'}
Write-Host 'DARK SANDBOX DEPLOY COMPLETE. No route is enabled.'
