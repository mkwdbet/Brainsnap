$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$androidDir = Join-Path $root "android"
$localJdkRoot = Join-Path $root "jdk21"
$gradleHomeRoot = if ($env:LOCALAPPDATA) { $env:LOCALAPPDATA } else { $root }
$env:GRADLE_USER_HOME = Join-Path $gradleHomeRoot "MemorySnap\gradle-home"
New-Item -ItemType Directory -Force -Path $env:GRADLE_USER_HOME | Out-Null

if (Test-Path $localJdkRoot) {
  $localJdk = Get-ChildItem -LiteralPath $localJdkRoot -Directory |
    Where-Object { Test-Path (Join-Path $_.FullName "bin\java.exe") } |
    Select-Object -First 1

  if ($localJdk) {
    $env:JAVA_HOME = $localJdk.FullName
    $env:Path = "$env:JAVA_HOME\bin;$env:Path"
  }
}

Push-Location $androidDir
try {
  .\gradlew.bat --no-daemon assembleDebug
  if ($LASTEXITCODE -ne 0) {
    throw "Gradle build failed with exit code $LASTEXITCODE"
  }
}
finally {
  Pop-Location
}

$apk = Join-Path $androidDir "app\build\outputs\apk\debug\app-debug.apk"
Write-Host "Debug APK: $apk"
