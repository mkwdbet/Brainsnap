$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot

$config = [ordered]@{
  appId = "com.memorysnap.app"
  appName = "Memory Snap"
  webDir = "www"
  server = [ordered]@{
    androidScheme = "https"
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

Write-Host "Synced Android app to bundled production assets."
