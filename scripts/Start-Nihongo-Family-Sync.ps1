# Nihongo Path family D1 sync - LOCAL sandbox only (no Cloudflare deployment).
# Run: powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Start-Nihongo-Family-Sync.ps1
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $root
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw 'Node.js is required. Install Node.js 24 or newer before running.'
}
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
  throw 'npx is required. Install Node.js / npm before running.'
}
if (-not (Test-Path (Join-Path $root '.dev.vars'))) {
  $bytes = New-Object byte[] 32
  $generator = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try { $generator.GetBytes($bytes) } finally { $generator.Dispose() }
  $code = [Convert]::ToBase64String($bytes)
  'FAMILY_SYNC_KEY="' + $code + '"' | Out-File -FilePath (Join-Path $root '.dev.vars') -Encoding ascii
  Write-Host 'A new local family code was generated in .dev.vars (git-ignored).'
  Write-Host 'Keep it private. You can read it locally for the one-time device pairing.'
} else {
  Write-Host 'Using existing local .dev.vars. The family key was not reset.'
}
Write-Host 'Building the opt-in family frontend (not touching existing public Worker)...'
$previous = [Environment]::GetEnvironmentVariable('NP_FAMILY_SYNC_BUILD','Process')
try {
  $env:NP_FAMILY_SYNC_BUILD = '1'
  & node .\scripts\build-site.cjs
  if ($LASTEXITCODE -ne 0) { throw 'Family frontend build failed.' }
} finally {
  if ($null -eq $previous) { Remove-Item Env:\NP_FAMILY_SYNC_BUILD -ErrorAction SilentlyContinue }
  else { $env:NP_FAMILY_SYNC_BUILD = $previous }
}
Write-Host 'Applying migrations to LOCAL D1 emulation only...'
& npx wrangler d1 migrations apply nihongopath-dev --local --config wrangler.backend.jsonc
if ($LASTEXITCODE -ne 0) { throw 'Local D1 migrations failed.' }
Write-Host 'Starting local family sandbox. No remote Worker deployment.'
Write-Host 'Open http://127.0.0.1:8787, then optionally select "Bat dong bo gia dinh".'
& npx wrangler dev --config wrangler.backend.jsonc --ip 127.0.0.1
if ($LASTEXITCODE -ne 0) { throw 'Local Worker exited with an error.' }
