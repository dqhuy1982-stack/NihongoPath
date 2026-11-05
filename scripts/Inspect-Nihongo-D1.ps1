# Read-only readiness check before any transfer of local study data to remote D1.
# Prints table counts only. Does not print learner names, keys or note contents.
# Does not perform database writes or deployment.
$ErrorActionPreference='Stop'
$root=(Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $root
if (-not (Test-Path '.private-backups')) {
  throw 'Backups missing. Complete Prepare-Nihongo-Remote-Sync.ps1 first.'
}
$local=Get-ChildItem '.private-backups\nihongopath-local-*.sql' -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
$remote=Get-ChildItem '.private-backups\nihongopath-remote-before-sync-*.sql' -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if (-not $local -or -not $remote) { throw 'Both local and remote SQL backups are required.' }
if ($local.Length -lt 200 -or $remote.Length -lt 200) { throw 'Unexpectedly small SQL backup. Stop.' }
$sql=@"
SELECT 'learners' AS table_name,COUNT(*) AS records FROM learners
UNION ALL SELECT 'learning_states',COUNT(*) FROM learning_states
UNION ALL SELECT 'learning_attempts',COUNT(*) FROM learning_attempts
UNION ALL SELECT 'command_receipts',COUNT(*) FROM command_receipts
UNION ALL SELECT 'kana_states',COUNT(*) FROM kana_states
UNION ALL SELECT 'kana_drawings',COUNT(*) FROM kana_drawings
UNION ALL SELECT 'kana_practices',COUNT(*) FROM kana_practices;
"@
$owners="SELECT COUNT(DISTINCT owner) AS owner_groups,COALESCE(SUM(CASE WHEN owner='family:primary' THEN 1 ELSE 0 END),0) AS family_profiles FROM learners;"
$orphan="SELECT COUNT(*) AS missing_learner_state_rows FROM learning_states s LEFT JOIN learners l ON l.owner=s.owner AND l.id=s.learner WHERE l.id IS NULL;"
foreach($scope in @('local','remote')){
  Write-Host ''
  Write-Host "======== D1 $scope (READ ONLY) ========"
  & npx wrangler d1 execute nihongopath-dev "--$scope" --config wrangler.backend.jsonc --command $sql
  if($LASTEXITCODE -ne 0){throw "$scope D1 table count query failed."}
  & npx wrangler d1 execute nihongopath-dev "--$scope" --config wrangler.backend.jsonc --command $owners
  if($LASTEXITCODE -ne 0){throw "$scope D1 owner summary failed."}
  & npx wrangler d1 execute nihongopath-dev "--$scope" --config wrangler.backend.jsonc --command $orphan
  if($LASTEXITCODE -ne 0){throw "$scope D1 integrity check failed."}
}
Write-Host ''
Write-Host 'READ-ONLY COMPARISON COMPLETE. No import, migration, or deployment.'
Write-Host 'Share table counts and owner_groups only; never send SQL backups or family key.'
