$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$serverUrl = $env:CAP_WEB_URL

if (-not $serverUrl) {
  $serverUrl = "https://memorysnap.org"
}

$config = [ordered]@{
  appId = "com.memorysnap.app"
  appName = "Memory Snap"
  webDir = "www"
  server = [ordered]@{
    url = $serverUrl
    androidScheme = "https"
  }
}

$json = $config | ConvertTo-Json -Depth 6
Set-Content -LiteralPath (Join-Path $root "capacitor.config.json") -Value $json -Encoding UTF8

Push-Location $root
try {
  npm.cmd run build:app
  npx.cmd cap sync android
}
finally {
  Pop-Location
}

Write-Host "Synced Android app to web target: $serverUrl"
