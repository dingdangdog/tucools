$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$source = "E:\work-gt\gt-tucools\desktop\.runtime"
$pack = Join-Path $root "model-pack"
$models = Join-Path $pack "models"
$bin = Join-Path $pack "bin\windows"

if (-not (Test-Path (Join-Path $source "models"))) {
  Write-Host "没有找到 $source\models。请把单独下载的模型包解压到 $pack。"
  exit 1
}

if (Test-Path $models) {
  Write-Host "已存在 $models，不覆盖。"
} else {
  New-Item -ItemType Directory -Path $pack -Force | Out-Null
  New-Item -ItemType Junction -Path $models -Target (Join-Path $source "models") | Out-Null
  Write-Host "已链接模型到 $models"
}

$windowsBin = Join-Path $source "bin\windows"
if (Test-Path $windowsBin) {
  if (Test-Path (Join-Path $bin "upscayl-bin.exe")) {
    Write-Host "已存在 $bin\upscayl-bin.exe，不覆盖。"
  } else {
    New-Item -ItemType Directory -Path $bin -Force | Out-Null
    Copy-Item (Join-Path $windowsBin "*") $bin
    Write-Host "已复制 Windows 超分程序到 $bin。Linux 容器请另放 bin\linux\upscayl-bin。"
  }
}

Write-Host "模型包目录：$pack"
Write-Host "这个目录不进入 Git、Windows 安装包和 Docker 镜像。"
