$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$python = Join-Path $root ".venv\Scripts\python.exe"
Set-Location (Join-Path $root "services\engine")
& $python -m pip install pyinstaller
& $python -m PyInstaller --noconfirm --name tucools-engine --onefile entry.py --collect-all uvicorn --collect-all fastapi
Write-Host "如果成功，可执行文件在 services\engine\dist\tucools-engine.exe。"
Write-Host "把它放到安装包资源前，还需要把 torch、onnxruntime、rembg 打进同一个环境。本脚本只生成入口，不保证当前机器已经装好推理依赖。"
