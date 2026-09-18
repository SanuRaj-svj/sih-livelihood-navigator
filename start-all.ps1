$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $root 'backend'
$frontendDir = Join-Path $root 'frontend'
$aiDir = Join-Path $root 'Livelihood-Assistant'

function Test-PortOpen {
    param([int]$Port)

    try {
        Get-NetTCPConnection -LocalPort $Port -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

function Start-ServiceIfNeeded {
    param(
        [string]$Name,
        [string]$Directory,
        [string]$Command,
        [int]$Port
    )

    if (Test-PortOpen -Port $Port) {
        Write-Host "$Name is already running on port $Port."
        return
    }

    Write-Host "Starting $Name in $Directory..."
    Start-Process -FilePath "powershell" -ArgumentList @(
        '-NoExit',
        '-Command',
        "Set-Location '$Directory'; $Command"
    ) | Out-Null

    Write-Host "$Name started on port $Port."
}

Write-Host "Checking required services..."
Start-ServiceIfNeeded -Name 'Backend API' -Directory $backendDir -Command 'npm start' -Port 5000
Start-ServiceIfNeeded -Name 'Frontend UI' -Directory $frontendDir -Command 'npm run dev -- --host 0.0.0.0' -Port 5173
Start-ServiceIfNeeded -Name 'AI Service' -Directory $aiDir -Command 'C:/Python314/python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000' -Port 8000

Write-Host ""
Write-Host "Project URLs:"
Write-Host "  Frontend: http://localhost:5173/login"
Write-Host "  Backend:  http://127.0.0.1:5000/api/health"
Write-Host "  AI:       http://127.0.0.1:8000/docs"
