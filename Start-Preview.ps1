$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$bundledPython = 'C:\Users\hp\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
Write-Host 'Paras R. Patel — local website preview'
Write-Host 'Open http://localhost:4173'
Write-Host 'Press Ctrl+C to stop.'
if (Test-Path -LiteralPath $bundledPython) {
    & $bundledPython -m http.server 4173 --bind 127.0.0.1 --directory $PSScriptRoot
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
    python -m http.server 4173 --bind 127.0.0.1 --directory $PSScriptRoot
} else {
    Write-Host 'Python is unavailable. Open index.html directly in your browser.'
}