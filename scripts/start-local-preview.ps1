$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$logPath = Join-Path $root "preview-server.log"

Set-Location $root

"[$(Get-Date -Format s)] Starting Memory Snap preview server" | Out-File -LiteralPath $logPath -Encoding UTF8

try {
  & node.exe scripts/dev-server.js *>> $logPath
}
catch {
  "[$(Get-Date -Format s)] Server failed" | Out-File -LiteralPath $logPath -Append -Encoding UTF8
  $_ | Out-File -LiteralPath $logPath -Append -Encoding UTF8
  throw
}
