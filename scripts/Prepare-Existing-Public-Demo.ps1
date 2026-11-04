# NIHONGO PATH - prepare a safe update for the EXISTING public demo repository.
# Use AFTER Pull develop and successful Prepare-GitHub-Pages.ps1 export.
# It NEVER pushes or publishes automatically. Open result in GitHub Desktop to review.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$build = Join-Path $root "dist\public-preview"
$dest = Join-Path (Split-Path -Parent $root) "NihongoPath-Public-Release"
$remote = "https://github.com/dqhuy1982-stack/NihongoPath-Public-Demo.git"

$branch = (& git -C $root branch --show-current).Trim()
if ($LASTEXITCODE -ne 0 -or $branch -ne "develop") {
 throw "Expected private NihongoPath source branch develop; current branch: $branch"
}
if (Test-Path $dest) {
 throw "STOP: $dest already exists. No files were modified. Review it before rerunning."
}
if (-not (Test-Path (Join-Path $build "index.html"))) {
 throw "Missing static preview export. Run Prepare-GitHub-Pages.ps1 first."
}
$mp3 = @(Get-ChildItem -LiteralPath (Join-Path $build "assets\kana-audio") -Filter "*.mp3" -File)
if ($mp3.Count -ne 46 -or -not (Test-Path (Join-Path $build "assets\kana-audio\pack.json"))) {
 throw "Expected 46 MP3 and pack.json in the static preview. Aborting."
}
$preview = [IO.File]::ReadAllText((Join-Path $build "index.html"))
if (-not $preview.Contains('searchParams.set("mode","demo")')) {
 throw "Public preview demo-only guard is missing. Aborting."
}
if (-not $preview.Contains('kana-studio.js')) {
 throw "Kana Studio not found in public preview. Aborting."
}

Write-Host "Cloning EXISTING public repository (main) to a NEW local folder..." -ForegroundColor Cyan
& git clone --branch main --single-branch $remote $dest
if ($LASTEXITCODE -ne 0) { throw "Git clone failed; no public data was pushed." }
$actualRemote = (& git -C $dest remote get-url origin).Trim()
if ($LASTEXITCODE -ne 0 -or $actualRemote -ne $remote) {
 throw "Unexpected repository remote; safe update stopped."
}
$currentBranch = (& git -C $dest branch --show-current).Trim()
if ($currentBranch -ne "main") { throw "Expected main in public demo clone." }
$dirty = @(& git -C $dest status --porcelain)
if ($dirty.Count -gt 0) { throw "Cloned worktree is not clean; aborting." }

# Fresh clone = safe to replace its tracked working files; .git history is preserved.
Get-ChildItem -LiteralPath $dest -Force | Where-Object { $_.Name -ne ".git" } |
 ForEach-Object { Remove-Item -LiteralPath $_.FullName -Recurse -Force }
Get-ChildItem -LiteralPath $build -Force |
 ForEach-Object { Copy-Item -LiteralPath $_.FullName -Destination $dest -Recurse -Force }

if (-not (Test-Path (Join-Path $dest ".git"))) { throw "Git metadata missing: abort." }
if (-not (Test-Path (Join-Path $dest "index.html"))) { throw "Missing published index: abort." }
$copied = @(Get-ChildItem -LiteralPath (Join-Path $dest "assets\kana-audio") -Filter "*.mp3" -File)
if ($copied.Count -ne 46) { throw "Audio copy mismatch; no commit/push was performed." }

Write-Host ""
Write-Host "READY - static files copied into the existing public demo clone:" -ForegroundColor Green
Write-Host $dest
Write-Host "Git remote: $actualRemote; branch: $currentBranch; audio: $($copied.Count)/46"
Write-Host "No commit or push has been performed."
Write-Host ""
Write-Host "NEXT: In GitHub Desktop > File > Add local repository > choose $dest"
Write-Host "Review Changes > Commit to main > Push origin."
Write-Host "DO NOT use Publish repository (the remote already exists)."
& git -C $dest status -sb
