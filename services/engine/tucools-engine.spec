# -*- mode: python ; coding: utf-8 -*-
"""把引擎冻成 Windows 目录，而不是把 Python 源码交给安装包。"""

from PyInstaller.utils.hooks import collect_all, collect_submodules

packages = [
    "uvicorn",
    "fastapi",
    "starlette",
    "torch",
    "torchvision",
    "onnxruntime",
    "rembg",
    "cv2",
    "PIL",
    "numpy",
    "pydantic",
    "pydantic_core",
    "multipart",
    "scipy",
    "skimage",
    "pymatting",
    "pooch",
    "imageio",
    "numba",
    "llvmlite",
]

skip_suffixes = (".onnx", ".pt", ".pth", ".param", ".bin")
datas = []
binaries = []
hiddenimports = ["app", "jobs", "runtime_info", *collect_submodules("vendor")]


def keep_data(source):
    lowered = source.replace("\\", "/").lower()
    if lowered.endswith(skip_suffixes):
        return False
    if "/tests/" in lowered or "/test/" in lowered:
        return False
    return True


for name in packages:
    try:
        package_datas, package_binaries, package_hidden = collect_all(name)
    except Exception as exc:
        print(f"skip {name}: {exc}")
        continue
    datas.extend(item for item in package_datas if keep_data(item[0]))
    binaries.extend(package_binaries)
    hiddenimports.extend(package_hidden)

a = Analysis(
    ["entry.py"],
    pathex=[],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=["tkinter", "pytest", "IPython", "matplotlib"],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name="tucools-engine",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
)
coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=False,
    upx_exclude=[],
    name="tucools-engine",
)
