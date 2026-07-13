$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$serverUrl = $env:CAP_SERVER_URL

if (-not $serverUrl) {
  $serverUrl = "http://10.234.77.170:5173"
}

$config = [ordered]@{
  appId = "com.memorysnap.app"
  appName = "Memory Snap"
  webDir = "www"
  server = [ordered]@{
    url = $serverUrl
    cleartext = $true
    androidScheme = "http"
  }
}

$json = $config | ConvertTo-Json -Depth 6
Set-Content -LiteralPath (Join-Path $root "capacitor.config.json") -Value $json -Encoding UTF8

Push-Location $root
try {
  npm run build:app
  npx cap sync android
}
finally {
  Pop-Location
}

Write-Host "Synced Android app to dev server: $serverUrl"
