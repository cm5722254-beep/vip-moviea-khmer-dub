#Requires -Version 5.1
<#
.SYNOPSIS
    អាធិរាជរឿង — Initial Setup Script (Windows PowerShell)

.DESCRIPTION
    Sets up the development/production environment for អាធិរាជរឿង.
    - Checks prerequisites (Docker, openssl)
    - Creates .env from .env.docker.example
    - Generates JWT secrets
    - Creates required directories
    - Builds and starts Docker containers
    - Optionally seeds the first admin account

.PARAMETER SeedAdmin
    Also seed the first admin account after containers start.

.EXAMPLE
    .\scripts\setup.ps1
    .\scripts\setup.ps1 -SeedAdmin
#>

param(
    [switch]$SeedAdmin
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# ── Helpers ───────────────────────────────────────────────────────────────────
function Write-Info    ($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Success ($msg) { Write-Host "[OK]   $msg" -ForegroundColor Green }
function Write-Warn    ($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Err     ($msg) { Write-Host "[ERR]  $msg" -ForegroundColor Red }
function Write-Header  ($msg) {
    Write-Host ""
    Write-Host "══════════════════════════════════════" -ForegroundColor Blue
    Write-Host "  $msg" -ForegroundColor Blue
    Write-Host "══════════════════════════════════════" -ForegroundColor Blue
}

# ── Script root ───────────────────────────────────────────────────────────────
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir   = Split-Path -Parent $ScriptDir

# ── Banner ────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  ======================================" -ForegroundColor Cyan
Write-Host "    អាធិរាជរឿង — Initial Setup          " -ForegroundColor Cyan
Write-Host "  ======================================" -ForegroundColor Cyan
Write-Host ""

# ── Check prerequisites ───────────────────────────────────────────────────────
Write-Header "Checking Prerequisites"

function Test-Command($cmd) {
    return [bool](Get-Command $cmd -ErrorAction SilentlyContinue)
}

if (Test-Command 'docker') {
    $dockerVersion = (docker --version)
    Write-Success "Docker found: $dockerVersion"
} else {
    Write-Err "Docker is not installed."
    Write-Host "  Download: https://docs.docker.com/desktop/install/windows/" -ForegroundColor White
    exit 1
}

# Docker Compose v2
try {
    $null = docker compose version 2>&1
    Write-Success "docker compose (v2) found"
} catch {
    Write-Err "Docker Compose v2 not found. Install Docker Desktop 4.x or later."
    exit 1
}

# ── Create .env from example ──────────────────────────────────────────────────
Write-Header "Environment Configuration"

$EnvFile    = Join-Path $RootDir ".env"
$EnvExample = Join-Path $RootDir ".env.docker.example"

if (-not (Test-Path $EnvExample)) {
    Write-Err ".env.docker.example not found at: $EnvExample"
    exit 1
}

if (Test-Path $EnvFile) {
    Write-Warn ".env already exists — skipping copy"
    Write-Warn "Delete $EnvFile and re-run if you want a fresh config"
} else {
    Copy-Item $EnvExample $EnvFile
    Write-Success "Created .env from .env.docker.example"
}

# ── Generate secrets ──────────────────────────────────────────────────────────
Write-Header "Generating Secrets"

function New-RandomBase64 {
    param([int]$Bytes = 48)
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $randomBytes = New-Object byte[] $Bytes
    $rng.GetBytes($randomBytes)
    return [Convert]::ToBase64String($randomBytes)
}

function New-AlphanumericPassword {
    param([int]$Length = 24)
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $bytes = New-Object byte[] $Length
    $rng.GetBytes($bytes)
    return -join ($bytes | ForEach-Object { $chars[$_ % $chars.Length] })
}

function Set-EnvValue {
    param(
        [string]$Key,
        [string]$Value,
        [string]$FilePath
    )
    $content = Get-Content $FilePath -Raw
    if ($content -match "^${Key}=.*CHANGE_ME") {
        $content = $content -replace "(?m)^${Key}=.*$", "${Key}=${Value}"
        Set-Content -Path $FilePath -Value $content -NoNewline
        Write-Success "Generated secret for $Key"
    } else {
        Write-Info "$Key already set — skipping"
    }
}

$JwtSecret      = New-RandomBase64 -Bytes 48
$JwtAdminSecret = New-RandomBase64 -Bytes 48
$DbPassword     = New-AlphanumericPassword -Length 24

Set-EnvValue -Key "JWT_SECRET"       -Value $JwtSecret      -FilePath $EnvFile
Set-EnvValue -Key "JWT_ADMIN_SECRET" -Value $JwtAdminSecret -FilePath $EnvFile
Set-EnvValue -Key "POSTGRES_PASSWORD" -Value $DbPassword    -FilePath $EnvFile

# Update DATABASE_URL password placeholder
$content = Get-Content $EnvFile -Raw
if ($content -match "CHANGE_ME_STRONG_PASSWORD") {
    $content = $content -replace "CHANGE_ME_STRONG_PASSWORD", $DbPassword
    Set-Content -Path $EnvFile -Value $content -NoNewline
    Write-Success "Updated DATABASE_URL with generated password"
}

# ── Create required directories ───────────────────────────────────────────────
Write-Header "Creating Directories"

$Dirs = @(
    (Join-Path $RootDir "backend\uploads"),
    (Join-Path $RootDir "logs")
)

foreach ($dir in $Dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Success "Created: $dir"
    } else {
        Write-Info "Already exists: $dir"
    }
}

# ── Configuration check ───────────────────────────────────────────────────────
Write-Header "Configuration Check"

function Test-EnvValueSet {
    param([string]$Key, [string]$FilePath)
    $line = (Get-Content $FilePath) | Where-Object { $_ -match "^${Key}=" } | Select-Object -First 1
    if ($null -eq $line) { return $false }
    $value = $line -replace "^${Key}=", ""
    return ($value -notmatch "CHANGE_ME") -and ($value.Trim() -ne "")
}

$Missing = 0
$RequiredKeys = @("TELEGRAM_BOT_TOKEN", "FRONTEND_URL", "VITE_API_URL")
foreach ($key in $RequiredKeys) {
    if (Test-EnvValueSet -Key $key -FilePath $EnvFile) {
        Write-Success "$key is set"
    } else {
        Write-Warn "$key is not configured — edit .env before deploying"
        $Missing++
    }
}

if ($Missing -gt 0) {
    Write-Host ""
    Write-Warn "$Missing required values not set in .env"
    Write-Warn "Edit $EnvFile before running: docker compose up -d"
    Write-Host ""
    $continue = Read-Host "Continue anyway? [y/N]"
    if ($continue -notmatch '^[Yy]$') {
        Write-Info "Exiting. Edit .env and re-run: .\scripts\setup.ps1"
        exit 0
    }
}

# ── Build Docker images ───────────────────────────────────────────────────────
Write-Header "Building Docker Images"

Push-Location $RootDir
try {
    Write-Info "Building images (this may take a few minutes)..."
    docker compose build --no-cache
    if ($LASTEXITCODE -ne 0) { throw "docker compose build failed" }
    Write-Success "Images built successfully"
} finally {
    Pop-Location
}

# ── Start containers ──────────────────────────────────────────────────────────
Write-Header "Starting Containers"

Push-Location $RootDir
try {
    docker compose up -d
    if ($LASTEXITCODE -ne 0) { throw "docker compose up failed" }
    Write-Success "Containers started"
} finally {
    Pop-Location
}

# ── Wait for services ─────────────────────────────────────────────────────────
Write-Header "Waiting for Services"

function Wait-ForHealthy {
    param(
        [string]$ServiceName,
        [scriptblock]$TestBlock,
        [int]$MaxRetries = 30,
        [int]$SleepSeconds = 2
    )
    Write-Info "Waiting for $ServiceName..."
    $retries = $MaxRetries
    while ($retries -gt 0) {
        try {
            $result = & $TestBlock
            if ($result) {
                Write-Success "$ServiceName is healthy"
                return $true
            }
        } catch { }
        $retries--
        Start-Sleep -Seconds $SleepSeconds
    }
    Write-Warn "$ServiceName did not become healthy in time"
    return $false
}

# PostgreSQL
$pgUser = ((Get-Content $EnvFile) | Where-Object { $_ -match "^POSTGRES_USER=" }) -replace "^POSTGRES_USER=", ""
Wait-ForHealthy -ServiceName "PostgreSQL" -TestBlock {
    $out = docker compose exec -T postgres pg_isready -U $pgUser 2>&1
    return ($out -match "accepting connections")
}

# Redis
Wait-ForHealthy -ServiceName "Redis" -TestBlock {
    $out = docker compose exec -T redis redis-cli ping 2>&1
    return ($out -match "PONG")
}

# Backend
Wait-ForHealthy -ServiceName "Backend API" -MaxRetries 30 -SleepSeconds 3 -TestBlock {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/health" -UseBasicParsing -TimeoutSec 5
        return ($response.StatusCode -eq 200)
    } catch { return $false }
}

# ── Seed admin account ────────────────────────────────────────────────────────
if ($SeedAdmin) {
    Write-Header "Seeding Admin Account"

    $AdminUsername = ((Get-Content $EnvFile) | Where-Object { $_ -match "^ADMIN_USERNAME=" }) -replace "^ADMIN_USERNAME=", ""
    $AdminPassword = ((Get-Content $EnvFile) | Where-Object { $_ -match "^ADMIN_PASSWORD=" }) -replace "^ADMIN_PASSWORD=", ""
    $AdminEmail    = ((Get-Content $EnvFile) | Where-Object { $_ -match "^ADMIN_EMAIL=" })    -replace "^ADMIN_EMAIL=",    ""

    if ($AdminPassword -match "CHANGE_ME") {
        Write-Err "ADMIN_PASSWORD is not set in .env — skipping admin seed"
    } else {
        $seedScript = @"
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
async function main() {
  const password = await bcrypt.hash('$AdminPassword', 12);
  const admin = await prisma.admin.upsert({
    where: { username: '$AdminUsername' },
    update: { password, email: '$AdminEmail' },
    create: {
      username: '$AdminUsername',
      password,
      email: '$AdminEmail',
      role: 'SUPER_ADMIN',
    },
  });
  console.log('Admin ready:', admin.username);
}
main().catch(console.error).finally(() => prisma.`$disconnect());
"@
        docker compose exec -T backend node -e $seedScript
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Admin account seeded: $AdminUsername"
        } else {
            Write-Err "Failed to seed admin account — check container logs"
        }
    }
}

# ── Final summary ─────────────────────────────────────────────────────────────
Write-Header "Setup Complete!"

Write-Host ""
Write-Host "Services running:" -ForegroundColor Green
Push-Location $RootDir
docker compose ps
Pop-Location

Write-Host ""
Write-Host "Access points:" -ForegroundColor White
Write-Host "  Frontend :  http://localhost"          -ForegroundColor Cyan
Write-Host "  Backend  :  http://localhost:3000"     -ForegroundColor Cyan
Write-Host "  Health   :  http://localhost:3000/api/v1/health" -ForegroundColor Cyan
Write-Host "  Admin    :  http://localhost/admin"    -ForegroundColor Cyan
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor White
Write-Host "  docker compose logs -f             # watch all logs"          -ForegroundColor Yellow
Write-Host "  docker compose logs -f backend     # backend logs only"       -ForegroundColor Yellow
Write-Host "  docker compose ps                  # service status"          -ForegroundColor Yellow
Write-Host "  docker compose down                # stop all services"       -ForegroundColor Yellow
Write-Host ""
Write-Success "Done! See DEPLOYMENT.md for full production configuration."
