param(
  [string]$Region = "ap-northeast-2",
  [string]$UsersTable = "MemorySnapUsers",
  [string]$SessionsTable = "MemorySnapSessions",
  [string]$Confirm = "",
  [switch]$UsersOnly,
  [switch]$SessionsOnly
)

$ErrorActionPreference = "Stop"

$aws = "C:\Program Files\Amazon\AWSCLIV2\aws.exe"
if (-not (Test-Path -LiteralPath $aws)) {
  $aws = "aws"
}

function Invoke-AwsJson {
  param([string[]]$Arguments)

  $output = & $aws @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "AWS CLI failed: aws $($Arguments -join ' ')"
  }

  if ([string]::IsNullOrWhiteSpace($output)) {
    return $null
  }

  return $output | ConvertFrom-Json
}

function Get-AllKeys {
  param(
    [string]$TableName,
    [string]$KeyName
  )

  $keys = New-Object System.Collections.Generic.List[object]
  $exclusiveStartKey = $null

  $attributeNamesFile = New-TemporaryFile
  @{ "#k" = $KeyName } | ConvertTo-Json -Compress | Set-Content -LiteralPath $attributeNamesFile.FullName -Encoding ASCII

  try {
  do {
    $attributeNamesJson = @{ "#k" = $KeyName } | ConvertTo-Json -Compress
    $args = @(
      "dynamodb", "scan",
      "--table-name", $TableName,
      "--region", $Region,
      "--projection-expression", "#k",
      "--expression-attribute-names", "file://$($attributeNamesFile.FullName)",
      "--output", "json"
    )

    if ($exclusiveStartKey) {
      $args += @("--exclusive-start-key", ($exclusiveStartKey | ConvertTo-Json -Compress))
    }

    $result = Invoke-AwsJson -Arguments $args
    foreach ($item in @($result.Items)) {
      $keys.Add($item) | Out-Null
    }

    $exclusiveStartKey = $result.LastEvaluatedKey
  } while ($exclusiveStartKey)
  }
  finally {
    Remove-Item -LiteralPath $attributeNamesFile.FullName -Force -ErrorAction SilentlyContinue
  }

  return $keys
}

function Remove-Keys {
  param(
    [string]$TableName,
    [object[]]$Keys
  )

  foreach ($key in $Keys) {
    $keyFile = New-TemporaryFile
    try {
      $key | ConvertTo-Json -Compress | Set-Content -LiteralPath $keyFile.FullName -Encoding ASCII
      Invoke-AwsJson -Arguments @(
        "dynamodb", "delete-item",
        "--table-name", $TableName,
        "--region", $Region,
        "--key", "file://$($keyFile.FullName)",
        "--output", "json"
      ) | Out-Null
    }
    finally {
      Remove-Item -LiteralPath $keyFile.FullName -Force -ErrorAction SilentlyContinue
    }
  }
}

$resetUsers = -not $SessionsOnly
$resetSessions = -not $UsersOnly

Write-Host "Memory Snap production data reset"
Write-Host "Region: $Region"
Write-Host "Users table: $UsersTable"
Write-Host "Sessions table: $SessionsTable"
Write-Host ""

$userKeys = @()
$sessionKeys = @()

if ($resetUsers) {
  $userKeys = @(Get-AllKeys -TableName $UsersTable -KeyName "userId")
  Write-Host "Users to delete: $($userKeys.Count)"
}

if ($resetSessions) {
  $sessionKeys = @(Get-AllKeys -TableName $SessionsTable -KeyName "token")
  Write-Host "Sessions to delete: $($sessionKeys.Count)"
}

Write-Host ""

if ($Confirm -ne "RESET_MEMORY_SNAP_PROD") {
  Write-Host "Dry run only. No data was deleted."
  Write-Host "To actually reset, run with: -Confirm RESET_MEMORY_SNAP_PROD"
  exit 0
}

if ($resetSessions) {
  Remove-Keys -TableName $SessionsTable -Keys $sessionKeys
  Write-Host "Deleted sessions: $($sessionKeys.Count)"
}

if ($resetUsers) {
  Remove-Keys -TableName $UsersTable -Keys $userKeys
  Write-Host "Deleted users: $($userKeys.Count)"
}

Write-Host "Production data reset complete."
