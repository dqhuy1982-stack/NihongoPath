# Prepare a public DEMO repository without changing private NihongoPath or its branches.
# Requires Node.js and Git; run after GitHub Desktop Pull on develop.
# This script does NOT publish anything by itself.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$parent = Split-Path -Parent $root
$dest = Join-Path $parent "NihongoPath-Public-Demo"
$build = Join-Path $root "scripts\build-public-preview.cjs"
$src = Join-Path $root "dist\public-preview"
Write-Host "Nihongo Path - safe public demo export"
if ((-not (Get-Command node -ErrorAction SilentlyContinue)) -or (-not (Get-Command git -ErrorAction SilentlyContinue))) {
  throw "Node.js and Git are required. No files were published."
}
$branch = (& git -C $root branch --show-current).Trim()
if ($LASTEXITCODE -ne 0 -or $branch -ne "develop") {
  throw "Expected source branch develop, got '$branch'. No files were published."
}
if (Test-Path $dest) {
  throw "Destination exists: $dest. Nothing overwritten. For future updates use the review procedure in docs/PUBLIC_PREVIEW_DEPLOY.md."
}
& node $build
if ($LASTEXITCODE -ne 0) { throw "Preview build failed. Nothing published." }
if (-not (Test-Path (Join-Path $src "index.html"))) { throw "Preview entry point missing. Nothing published." }
New-Item -ItemType Directory -Path $dest | Out-Null
Get-ChildItem -LiteralPath $src -Force | Copy-Item -Destination $dest -Recurse -Force
& git -C $dest init -b main
if ($LASTEXITCODE -ne 0) { throw "Git init failed at $dest" }
& git -C $dest add .
if ($LASTEXITCODE -ne 0) { throw "Git add failed. Files kept in $dest" }
Write-Host ""
Write-Host "READY: $dest"
Write-Host "Only static DEMO files were exported. Original private repo is unchanged."
Write-Host "Next in GitHub Desktop: File > Add local repository > Choose $dest;"
Write-Host "Commit all; Publish repository with Keep this code private UNCHECKED."
Write-Host "Then in new public GitHub repo: Settings > Pages > Deploy from branch > main / (root)."
Write-Host "DO NOT publish the original NihongoPath repository."
