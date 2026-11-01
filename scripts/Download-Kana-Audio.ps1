# Download 46 public-domain Commons MP3 transcodes into existing Kana Studio.
# Run after Pull on develop; no changes to database, main or original Site.
$ErrorActionPreference="Stop"
$root=Split-Path -Parent $PSScriptRoot
$js=Join-Path $root "source\public\kana-studio.js"
$dir=Join-Path $root "source\public\assets\kana-audio"
if(-not (Test-Path $js)){throw "Kana source not found."}
$branch=(& git -C $root branch --show-current).Trim()
if($branch -ne "develop"){throw "Select develop first (current: $branch)."}
$txt=[System.IO.File]::ReadAllText($js)
$re="(?<key>[a-z]+):\['(?<hash>[0-9a-f]{2})','(?<name>[^']+)'\]"
$matches=[regex]::Matches($txt,$re)
if($matches.Count -ne 46){throw "Expected 46 audio mappings, got $($matches.Count). Pull code first."}
New-Item -ItemType Directory -Force -Path $dir | Out-Null
[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12
$errors=New-Object System.Collections.Generic.List[string]
foreach($m in $matches){
 $key=$m.Groups["key"].Value
 $hash=$m.Groups["hash"].Value
 $name=$m.Groups["name"].Value
 $md5=[Security.Cryptography.MD5]::Create()
 try{
  $calculated=([BitConverter]::ToString($md5.ComputeHash([Text.Encoding]::UTF8.GetBytes($name)))).Replace("-","").ToLowerInvariant()
 }finally{$md5.Dispose()}
 if($calculated.Substring(0,2) -ne $hash){$errors.Add("$key filename hash mismatch");continue}
 $target=Join-Path $dir "$key.mp3"
 if((Test-Path $target) -and ((Get-Item $target).Length -gt 500)){Write-Host "EXISTS $key.mp3";continue}
 $url="https://upload.wikimedia.org/wikipedia/commons/transcoded/$($hash.Substring(0,1))/$hash/$name/$name.mp3"
 $tmp="$target.download"
 try{
  Invoke-WebRequest -UseBasicParsing -Uri $url -OutFile $tmp -TimeoutSec 35
  $data=[IO.File]::ReadAllBytes($tmp)
  $isMp3=($data.Length -gt 500) -and (($data[0] -eq 73 -and $data[1] -eq 68 -and $data[2] -eq 51) -or ($data[0] -eq 255 -and (($data[1] -band 224) -eq 224)))
  if(-not $isMp3){throw "Download is not an MP3 file."}
  Move-Item -Force $tmp $target
  Write-Host "OK $key.mp3 ($($data.Length) bytes)"
  Start-Sleep -Milliseconds 250
 }catch{
  if(Test-Path $tmp){Remove-Item -Force $tmp}
  $errors.Add("$key : $($_.Exception.Message)")
  Write-Warning "$key failed: $($_.Exception.Message)"
 }
}
$ready=0
foreach($m in $matches){
 $p=Join-Path $dir "$($m.Groups['key'].Value).mp3"
 if((Test-Path $p) -and ((Get-Item $p).Length -gt 500)){$ready++}
}
if($ready -ne 46 -or $errors.Count -gt 0){
 Write-Host "Only $ready/46 MP3 present; local pack NOT activated."
 Write-Host "Re-run script later; existing clips are reused."
 throw ($errors -join [Environment]::NewLine)
}
$pack=@{schemaVersion=1;audioFormat="mp3";sounds=46;source="Wikimedia Commons PD recordings";status="iPhone QA pending"}
$pack | ConvertTo-Json -Depth 3 | Set-Content -Encoding UTF8 (Join-Path $dir "pack.json")
Write-Host "READY: all 46 MP3. Commit the static audio assets to develop using GitHub Desktop, then Push."
