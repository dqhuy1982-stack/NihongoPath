# Prepare a data-only export of the seven learning tables.
# Run ONLY on the home PC where .wrangler/state/v3/d1 contains actual study progress.
# READ-ONLY: does not import, deploy, migrate or write to remote D1.
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $root
if (-not (Test-Path '.wrangler\state\v3\d1')) {
  throw 'Home D1 local state is missing. Do not run this script from a newly cloned office PC.'
}
if (-not (Get-Command npx.cmd -ErrorAction SilentlyContinue)) {
  throw 'npx.cmd not available.'
}
$folder = Join-Path $root ('.private-backups\transfer-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -Path $folder -ItemType Directory -Force | Out-Null
$tables = @(
  'learners', 'learning_states', 'learning_attempts', 'command_receipts',
  'kana_states', 'kana_drawings', 'kana_practices'
)
Write-Host 'Exporting study tables from HOME LOCAL D1 only...'
foreach ($table in $tables) {
  $file = Join-Path $folder ($table + '.sql')
  & npx.cmd wrangler d1 export nihongopath-dev --local --config wrangler.backend.jsonc --table=$table --no-schema --output $file
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path $file)) {
    throw ('Local D1 export failed for ' + $table + '. No remote changes were made.')
  }
  Write-Host ('Exported ' + $table + ' (' + (Get-Item $file).Length + ' bytes)')
}
$sql = "SELECT (SELECT COUNT(*) FROM learners) AS learners, (SELECT COUNT(*) FROM learning_states) AS learning_states, (SELECT COUNT(*) FROM learning_attempts) AS learning_attempts, (SELECT COUNT(*) FROM command_receipts) AS command_receipts, (SELECT COUNT(*) FROM kana_states) AS kana_states, (SELECT COUNT(*) FROM kana_drawings) AS kana_drawings, (SELECT COUNT(*) FROM kana_practices) AS kana_practices;"
Write-Host ''
Write-Host 'HOME LOCAL ROW COUNTS (for verification):'
& npx.cmd wrangler d1 execute nihongopath-dev --local --config wrangler.backend.jsonc --command $sql
if ($LASTEXITCODE -ne 0) { throw 'Local D1 count verification failed.' }
Write-Host ''
Write-Host 'HOME LOCAL OWNER CHECK (counts only):'
$ownerSql = "SELECT COUNT(DISTINCT owner) AS owner_groups, COUNT(*) AS total_profiles, COALESCE(SUM(CASE WHEN owner='family:primary' THEN 1 ELSE 0 END),0) AS family_profiles FROM learners;"
& npx.cmd wrangler d1 execute nihongopath-dev --local --config wrangler.backend.jsonc --command $ownerSql
if ($LASTEXITCODE -ne 0) { throw 'Local owner verification failed.' }
Write-Host 'Expected before transfer: owner_groups=1 and family_profiles=total_profiles.'
Write-Host 'If owner_groups differs, DO NOT import any data before reviewing the identity mapping.'
Write-Host ''
Write-Host 'DATA-ONLY EXPORT COMPLETE. NO remote upload or writes.'
Write-Host 'All SQL files remain in .private-backups and are ignored by Git.'
Write-Host 'Do not send the SQL files, record contents, or family secret in chat.'
Write-Host 'For the next step, share only the seven row counts and error messages.'
