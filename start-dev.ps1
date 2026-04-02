# Unified Dev Startup Script for QFS Wallet
# This script sets the Node.js path for the current session and launches both frontend and backend.

$Env:Path = "C:\nodejs;" + $Env:Path
Write-Host "Node.js environment configured from C:\nodejs" -ForegroundColor Cyan

if (Test-Path "node_modules") {
    npm run dev
} else {
    Write-Host "Installing dependencies first..." -ForegroundColor Yellow
    npm install
    npm run dev
}
