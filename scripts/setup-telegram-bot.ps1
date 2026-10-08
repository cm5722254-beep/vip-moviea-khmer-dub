# =============================================================================
# Rueng Vip Khmer -- Telegram Bot Setup Script
# Configures @ruengvipkhmer_bot via the Telegram Bot API.
#
# Usage:
#   .\setup-telegram-bot.ps1
#   .\setup-telegram-bot.ps1 -WebAppUrl "https://yourdomain.com"
# =============================================================================

param(
  [string]$WebAppUrl = ""
)

# ---------------------------------------------------------------------------
# Load TELEGRAM_BOT_TOKEN from root .env
# ---------------------------------------------------------------------------
$envFile = Join-Path $PSScriptRoot "..\\.env"
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^([^#=\s]+)\s*=\s*(.+)$') {
      $name  = $matches[1].Trim()
      $value = $matches[2].Trim()
      if (-not [System.Environment]::GetEnvironmentVariable($name)) {
        [System.Environment]::SetEnvironmentVariable($name, $value)
      }
    }
  }
}

$TOKEN = $env:TELEGRAM_BOT_TOKEN
if (-not $TOKEN) {
  Write-Error "TELEGRAM_BOT_TOKEN is not set. Check .env file."
  exit 1
}

$BASE = "https://api.telegram.org/bot$TOKEN"

# Helper: call Telegram API with JSON body
function Call-API {
  param([string]$Method, [string]$JsonBody)
  try {
    $bytes  = [System.Text.Encoding]::UTF8.GetBytes($JsonBody)
    $result = Invoke-RestMethod -Uri "$BASE/$Method" -Method POST `
                -ContentType "application/json; charset=utf-8" -Body $bytes
    if ($result.ok) {
      Write-Host "  [OK] $Method" -ForegroundColor Green
    } else {
      Write-Host "  [FAIL] $Method : $($result.description)" -ForegroundColor Red
    }
    return $result
  } catch {
    Write-Host "  [ERROR] $Method : $($_.Exception.Message)" -ForegroundColor Red
  }
}

Write-Host ""
Write-Host "Configuring @ruengvipkhmer_bot ..." -ForegroundColor Cyan
Write-Host "-----------------------------------"

# Step 1 -- Verify token
Write-Host ""
Write-Host "Step 1: Verifying bot token..."
$me = Invoke-RestMethod "$BASE/getMe"
if (-not $me.ok) {
  Write-Error "Bot token invalid. Check TELEGRAM_BOT_TOKEN in .env"
  exit 1
}
Write-Host "  [OK] @$($me.result.username) (id $($me.result.id))" -ForegroundColor Green

# Step 2 -- Display name (set to ASCII-safe; use BotFather /setname for Khmer)
Write-Host ""
Write-Host "Step 2: Setting bot display name..."
Call-API "setMyName" '{"name":"Rueng Vip Khmer"}'

# Step 3 -- Short description
Write-Host ""
Write-Host "Step 3: Setting short description..."
Call-API "setMyShortDescription" '{"short_description":"Watch Khmer dramas and movies on Telegram"}'

# Step 4 -- Full description
Write-Host ""
Write-Host "Step 4: Setting full description..."
Call-API "setMyDescription" '{"description":"Rueng Vip Khmer - Watch premium Khmer dramas and movies directly in Telegram. Sign in instantly with your Telegram account."}'

# Step 5 -- Commands
Write-Host ""
Write-Host "Step 5: Setting bot commands..."
Call-API "setMyCommands" '{"commands":[{"command":"start","description":"Open the Mini App"},{"command":"help","description":"Help and support"}]}'

# Step 6 -- Menu button (only if WebAppUrl provided)
if ($WebAppUrl) {
  Write-Host ""
  Write-Host "Step 6: Setting menu button -> $WebAppUrl"
  $menuJson = "{`"menu_button`":{`"type`":`"web_app`",`"text`":`"Watch Movies`",`"web_app`":{`"url`":`"$WebAppUrl`"}}}"
  Call-API "setChatMenuButton" $menuJson
} else {
  Write-Host ""
  Write-Host "Step 6: Skipped (no -WebAppUrl given)" -ForegroundColor Yellow
  Write-Host "  Re-run after deployment:"
  Write-Host "  .\setup-telegram-bot.ps1 -WebAppUrl 'https://yourdomain.com'"
}

# Step 7 -- Verify commands were set
Write-Host ""
Write-Host "Step 7: Verifying commands..."
$cmds = Invoke-RestMethod "$BASE/getMyCommands"
$cmds.result | ForEach-Object {
  Write-Host "  /$($_.command) -- $($_.description)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "-----------------------------------"
Write-Host "Bot setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Open in Telegram: https://t.me/ruengvipkhmer_bot"
Write-Host ""
Write-Host "Remaining manual steps in @BotFather:"
Write-Host "  /setname        -- Set Khmer display name"
Write-Host "  /setuserpic     -- Upload bot profile photo"
Write-Host "  /newapp         -- Create the Mini App entry (set Web App URL)"
Write-Host ""
