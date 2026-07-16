$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$androidDir = Join-Path $root "android"
$appDir = Join-Path $androidDir "app"
$keystorePath = Join-Path $appDir "memorysnap-release.keystore"
$keystorePropertiesPath = Join-Path $androidDir "keystore.properties"
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

if (-not (Get-Command keytool.exe -ErrorAction SilentlyContinue)) {
  throw "keytool.exe was not found. Install or configure JDK 21 before building a release AAB."
}

if ((Test-Path $keystorePath) -and -not (Test-Path $keystorePropertiesPath)) {
  throw "Release keystore exists, but android\keystore.properties is missing. Restore it from backup before building."
}

if ((Test-Path $keystorePropertiesPath) -and -not (Test-Path $keystorePath)) {
  throw "android\keystore.properties exists, but the release keystore file is missing. Restore it from backup before building."
}

if (-not (Test-Path $keystorePath)) {
  $storePassword = [Convert]::ToBase64String([Guid]::NewGuid().ToByteArray()).TrimEnd("=")
  $keyPassword = $storePassword
  $alias = "memorysnap"

  & keytool.exe -genkeypair `
    -v `
    -keystore $keystorePath `
    -storepass $storePassword `
    -keypass $keyPassword `
    -alias $alias `
    -keyalg RSA `
    -keysize 2048 `
    -validity 10000 `
    -dname "CN=Memory Snap, OU=Memory Snap, O=Memory Snap, L=Seoul, ST=Seoul, C=KR"

  if ($LASTEXITCODE -ne 0) {
    throw "Release keystore generation failed with exit code $LASTEXITCODE"
  }

  @"
storeFile=app/memorysnap-release.keystore
storePassword=$storePassword
keyAlias=$alias
keyPassword=$keyPassword
"@ | Set-Content -LiteralPath $keystorePropertiesPath -Encoding ASCII

  Write-Host "Generated release keystore: $keystorePath"
  Write-Host "Generated signing properties: $keystorePropertiesPath"
  Write-Host "Back up both files. Losing them can prevent future app updates."
}

Push-Location $root
try {
  npm.cmd run cap:prod
  if ($LASTEXITCODE -ne 0) {
    throw "Capacitor production sync failed with exit code $LASTEXITCODE"
  }
}
finally {
  Pop-Location
}

Push-Location $androidDir
try {
  .\gradlew.bat --no-daemon bundleRelease
  if ($LASTEXITCODE -ne 0) {
    throw "Gradle release bundle failed with exit code $LASTEXITCODE"
  }
}
finally {
  Pop-Location
}

$aab = Join-Path $androidDir "app\build\outputs\bundle\release\app-release.aab"
Write-Host "Release AAB: $aab"
