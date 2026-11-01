# NIHONGO PATH — Kana audio pack (46 basic sounds), Windows PowerShell 5.1
# Source: https://huggingface.co/datasets/arsalan-anwari/kana-sounds
# Recording origin: FUN Japanese Learning; dataset maintained by Arsalan Anwari
# License stated by dataset: CC BY 4.0. Preserve attribution in the deployed site.
# Run on branch develop only. Never alters backend, learners or published ChatGPT Site.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$js = Join-Path $root "source\public\kana-studio.js"
$folder = Join-Path $root "source\public\assets\kana-audio"
$manifest = Join-Path $folder "pack.json"
if (-not (Test-Path $js)) { throw "Missing kana-studio.js. Check repository path." }
$branch = (& git -C $root branch --show-current).Trim()
if ($branch -ne "develop") { throw "Switch GitHub Desktop to develop first. Current: $branch" }
$txt = [IO.File]::ReadAllText($js)
$pattern = "(?<key>[a-z]+):\['[0-9a-f]{2}','[^']+'\]"
$records = [regex]::Matches($txt, $pattern)
if ($records.Count -ne 46) { throw "Expected exactly 46 base sounds in existing Kana Studio (found $($records.Count)). Pull develop." }
$keys = @($records | ForEach-Object { $_.Groups["key"].Value })
if (@($keys | Select-Object -Unique).Count -ne 46) { throw "Duplicate Kana sound names. Aborting." }
New-Item -ItemType Directory -Path $folder -Force | Out-Null
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$source = "https://huggingface.co/datasets/arsalan-anwari/kana-sounds/resolve/main/audio/seion"
Write-Host "Audio source: Kana Sounds, FUN Japanese Learning (CC BY 4.0)" 
Write-Host "Preparing $($keys.Count) files. First request is an access check."
function Test-Mp3([string]$file) {
 if (-not (Test-Path $file)) { return $false }
 $buf = [IO.File]::ReadAllBytes($file)
 if ($buf.Length -le 500) { return $false }
 return (($buf[0] -eq 73 -and $buf[1] -eq 68 -and $buf[2] -eq 51) -or
         ($buf[0] -eq 255 -and (($buf[1] -band 224) -eq 224)))
}
$success = 0
foreach($key in $keys) {
 $file = Join-Path $folder ($key + ".mp3")
 if (Test-Mp3 $file) { $success++; Write-Host "EXISTS $key.mp3"; continue }
 $tmp = $file + ".part"
 $url = $source + "/" + $key + ".mp3"
 try {
  if (Test-Path $tmp) { Remove-Item -LiteralPath $tmp -Force }
  Invoke-WebRequest -UseBasicParsing -Uri $url -OutFile $tmp -TimeoutSec 35
  if (-not (Test-Mp3 $tmp)) { throw "File is missing or is not valid MP3." }
  Move-Item -LiteralPath $tmp -Destination $file -Force
  $success++
  Write-Host "OK $key.mp3"
  Start-Sleep -Milliseconds 350
 } catch {
  if (Test-Path $tmp) { Remove-Item -LiteralPath $tmp -Force }
  # Stop at first server rejection. Do not retry a robot-policy or rate-limit block.
  Write-Host "FAILED: $key.mp3 : $($_.Exception.Message)"
  Write-Host "Stopped safely. $success/46 recordings available; no new audio pack activated."
  Write-Host "Do not bypass provider access controls. Send this first failure for review."
  throw "Audio download stopped: $key"
 }
}
if ($success -ne 46) { throw "Incomplete audio pack $success/46; activation disabled." }
$pack = [ordered]@{
 schemaVersion = 1
 audioFormat = "mp3"
 sounds = 46
 source = "https://huggingface.co/datasets/arsalan-anwari/kana-sounds"
 recordingOrigin = "FUN Japanese Learning"
 datasetMaintainer = "Arsalan Anwari"
 license = "CC BY 4.0"
 sourceGroup = "seion"
 status = "Complete local pack; physical iPhone QA pending"
}
$pack | ConvertTo-Json -Depth 3 | Set-Content -Encoding UTF8 -LiteralPath $manifest
Write-Host "READY: all 46 MP3 (same-origin audio pack)."
Write-Host "Please verify Safari iPhone pronunciation before committing or publishing the pack."
