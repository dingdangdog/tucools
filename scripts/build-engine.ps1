param(
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$python = Join-Path $root ".venv\Scripts\python.exe"
$engine = Join-Path $root "services\engine"
$dist = Join-Path $engine "dist\tucools-engine"
$exe = Join-Path $dist "tucools-engine.exe"

if (-not (Test-Path $python)) {
    Write-Error "Missing $python. Create the repo .venv and install services\engine\requirements.txt first."
}

& $python -c "import torch, torchvision, uvicorn, fastapi, onnxruntime, rembg, cv2, PIL, numpy, multipart, pydantic, scipy, skimage, pymatting"
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

$sources = Get-ChildItem $engine -Recurse -File -Include *.py, *.spec |
    Where-Object { $_.FullName -notmatch '\\(dist|build|tmp|__pycache__)\\' }
$newestSource = ($sources | Sort-Object LastWriteTime -Descending | Select-Object -First 1).LastWriteTime
if (-not $Force -and (Test-Path $exe) -and (Get-Item $exe).LastWriteTime -gt $newestSource) {
    Write-Host "Engine executable is up to date: $exe"
    exit 0
}

& $python -c "import PyInstaller"
if ($LASTEXITCODE -ne 0) {
    & $python -m pip install pyinstaller
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Set-Location $engine
& $python -m PyInstaller --noconfirm --clean tucools-engine.spec
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
if (-not (Test-Path $exe)) {
    Write-Error "Did not create $exe"
}

$blockedRelative = @(
    "app.py",
    "entry.py",
    "jobs.py",
    "runtime_info.py",
    "vendor\cutout.py",
    "vendor\enhance.py",
    "vendor\erase.py",
    "_internal\app.py",
    "_internal\entry.py",
    "_internal\jobs.py",
    "_internal\runtime_info.py",
    "_internal\vendor\cutout.py",
    "_internal\vendor\enhance.py",
    "_internal\vendor\erase.py"
)
$leaked = @($blockedRelative | Where-Object { Test-Path (Join-Path $dist $_) })
if ($leaked.Count -gt 0) {
    $paths = $leaked | ForEach-Object { $_.FullName }
    Write-Error "Engine source is still in the frozen output: $($paths -join ', ')"
}

Write-Host "Engine executable: $exe"
