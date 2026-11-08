# HORIZON: publish front-end updates to the existing Cloudflare Worker.
# Dry run by default. -Publish requires an interactive "PUBLISH" confirmation.
# This preserves the currently active static / family-sync mode.
param([switch]$Publish)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$site = 'https://nihongopath.dqhuy1982.workers.dev'
$targetVersion = 'v1.43'
Push-Location $root
try {
  $branch = (& git branch --show-current).Trim()
  if ($LASTEXITCODE -ne 0 -or $branch -cne 'develop') { throw 'Expected develop branch. Nothing deployed.' }
  & git fetch origin develop --quiet
  if ($LASTEXITCODE -ne 0) { throw 'Git fetch failed. Nothing deployed.' }
  $head = (& git rev-parse HEAD).Trim()
  $upstream = (& git rev-parse origin/develop).Trim()
  if ($LASTEXITCODE -ne 0 -or $head -cne $upstream) {
    throw "Local HEAD is not latest origin/develop. Run git pull --ff-only origin develop. Nothing deployed."
  }
  $dirty = @(& git status --porcelain --untracked-files=no)
  if ($dirty.Count -gt 0) { throw 'Tracked working files have local changes. Review them first. Nothing deployed.' }
  foreach ($command in @('node', 'npx.cmd')) {
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) { throw "Missing $command. Nothing deployed." }
  }

  $cfg = Get-Content '.\wrangler.jsonc' -Raw | ConvertFrom-Json
  if ($cfg.name -cne 'nihongopath' -or
      $cfg.main -cne './workers/nihongopath-api.mjs' -or
      $cfg.assets.directory -cne './dist/site' -or
      $cfg.assets.binding -cne 'ASSETS' -or
      $cfg.d1_databases.Count -ne 1 -or
      $cfg.d1_databases[0].database_id -cne '8504e0d8-c7a5-490d-ab40-a7590cd9af9d') {
    throw 'Worker or D1 target differs from reviewed config. Nothing deployed.'
  }

  # Read public assets only. Never fetch or display learner data or secrets.
  $url = $site + '/?ui_release_check=' + [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
  $live = (Invoke-WebRequest -Uri $url -UseBasicParsing -Headers @{'Cache-Control'='no-cache'}).Content
  if ($live -notmatch 'window\.NP_STATIC_PUBLISH=true;') {
    throw 'Cannot identify deployed frontend mode. Do not risk changing family-sync behaviour.'
  }
  $family = $live -match 'window\.NP_FAMILY_SYNC=true;'
  $mode = if ($family) { 'family-sync' } else { 'static' }
  Write-Host "Cloudflare target: nihongopath; live mode: $mode; local commit: $head"

  $appMatch = [regex]::Match($live, 'src="(app\.js\?v=[^"]+)"')
  if ($appMatch.Success) {
    $remoteApp = (Invoke-WebRequest -Uri ($site + '/' + $appMatch.Groups[1].Value) -UseBasicParsing).Content
    if ($remoteApp.Contains('>v1.43</small>')) {
      Write-Host "Cloudflare already serves $targetVersion. No publish needed; force-refresh browser or remove PWA cache."
      exit 0
    }
    if ($remoteApp -match '>v1\.\d+</small>') {
      Write-Host ('Cloudflare currently serves ' + $matches[0] + ', not ' + $targetVersion)
    }
  }

  $previous = [Environment]::GetEnvironmentVariable('NP_FAMILY_SYNC_BUILD','Process')
  try {
    $env:NP_FAMILY_SYNC_BUILD = if ($family) { '1' } else { '0' }
    & node --test tests/foundation-course-v33.test.mjs
    if ($LASTEXITCODE -ne 0) { throw 'Foundation regression tests failed; nothing deployed.' }
    & node .\scripts\build-site.cjs
    if ($LASTEXITCODE -ne 0) { throw 'Site build failed; nothing deployed.' }
  } finally {
    if ($null -eq $previous) { Remove-Item Env:\NP_FAMILY_SYNC_BUILD -ErrorAction SilentlyContinue }
    else { $env:NP_FAMILY_SYNC_BUILD = $previous }
  }

  $built = Get-Content '.\dist\site\index.html' -Raw
  $builtJs = Get-Content '.\dist\site\app.js' -Raw
  if (-not $builtJs.Contains('>v1.43</small>') -or
      -not $built.Contains('result-v142.css?v=') -or
      -not $built.Contains('progress-v143.css?v=') -or
      -not $built.Contains('foundation-course-v33.js?v=')) {
    throw 'Unexpected frontend release assets. Nothing deployed.'
  }
  if ($family -ne $built.Contains('window.NP_FAMILY_SYNC=true;')) {
    throw 'Built family-sync mode differs from currently deployed mode. Nothing deployed.'
  }

  & npx.cmd wrangler deploy --dry-run --config wrangler.jsonc
  if ($LASTEXITCODE -ne 0) { throw 'Wrangler dry-run failed. Nothing deployed.' }
  if (-not $Publish) {
    Write-Host "DRY RUN OK: $targetVersion is built; original website unchanged."
    Write-Host 'To publish: .\scripts\Release-Horizon-UI.ps1 -Publish'
    exit 0
  }

  if ($family) {
    $secrets = (& npx.cmd wrangler secret list --config wrangler.jsonc 2>&1 | Out-String)
    if ($LASTEXITCODE -ne 0 -or $secrets -notmatch '"name"\s*:\s*"FAMILY_SYNC_KEY"') {
      throw 'Family-sync is active but FAMILY_SYNC_KEY secret name is not present. Nothing deployed.'
    }
  }
  $confirmation = Read-Host "Type PUBLISH to deploy $targetVersion to the existing nihongopath Worker"
  if ($confirmation -cne 'PUBLISH') { throw 'Publish cancelled. Nothing deployed.' }
  & npx.cmd wrangler deploy --config wrangler.jsonc
  if ($LASTEXITCODE -ne 0) { throw 'Cloudflare deploy returned error. Check deployments before retrying.' }
  Write-Host "Worker deployment requested for $targetVersion. No D1 migrations executed."
  $check = (Invoke-WebRequest -Uri ($site + '/?ui_verify=' + [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()) -UseBasicParsing -Headers @{'Cache-Control'='no-cache'}).Content
  $match = [regex]::Match($check, 'src="(app\.js\?v=[^"]+)"')
  if ($match.Success) {
    $app = (Invoke-WebRequest -Uri ($site + '/' + $match.Groups[1].Value) -UseBasicParsing).Content
    if ($app.Contains('>v1.43</small>')) {
      Write-Host "VERIFIED LIVE: $targetVersion at $site"
      exit 0
    }
  }
  Write-Warning "Deploy returned success but $targetVersion was NOT independently verified live. Inspect Cloudflare Deployments."
} finally { Pop-Location }
