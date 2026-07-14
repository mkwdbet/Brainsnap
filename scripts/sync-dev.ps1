$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$serverUrl = $env:CAP_SERVER_URL

if (-not $serverUrl) {
  $activeIp = $null
  $ipconfigBlocks = (ipconfig) -join "`n" -split "(\r?\n){2,}"

  foreach ($block in $ipconfigBlocks) {
    $candidateIp = $null

    if ($block -match "IPv4 Address[^\r\n]*:\s*([0-9.]+)") {
      $candidateIp = $Matches[1]
    }

    if ($candidateIp -and $block -match "Default Gateway[^\r\n]*:\s*([0-9.]+)") {
      $activeIp = $candidateIp
      break
    }
  }

  if (-not $activeIp) {
    throw "Could not detect an active LAN IP. Set CAP_SERVER_URL manually, for example: `$env:CAP_SERVER_URL = 'http://192.168.0.10:5173'"
  }

  $serverUrl = "http://${activeIp}:5173"
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
  npm.cmd run build:app
  npx.cmd cap sync android
}
finally {
  Pop-Location
}

Write-Host "Synced Android app to dev server: $serverUrl"
