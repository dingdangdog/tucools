"""模型与超分程序的就绪检查。不导入 torch 或 rembg。"""

from __future__ import annotations

import os
import platform
from pathlib import Path

CUTOUT_MODELS = [
    "u2net.onnx",
    "u2netp.onnx",
    "u2net_human_seg.onnx",
    "isnet-general-use.onnx",
    "isnet-anime.onnx",
]

ENHANCE_MODELS = {
    "balanced": ("upscayl-lite-4x.bin", "upscayl-lite-4x.param"),
    "standard": ("upscayl-standard-4x.bin", "upscayl-standard-4x.param"),
    "premium": ("realesrgan-x4plus.bin", "realesrgan-x4plus.param"),
    "anime": ("digital-art-4x.bin", "digital-art-4x.param"),
    "anime_pro": ("realesrgan-x4plus-anime.bin", "realesrgan-x4plus-anime.param"),
}

ERASE_MODEL = "big-lama.pt"


def pack_root() -> Path:
    """用户单独下载的模型包。不在安装目录和镜像里。"""
    raw = os.environ.get("TUCOOLS_MODEL_PACK", "").strip()
    if raw:
        return Path(raw)
    return Path.cwd() / "model-pack"


def models_dir() -> Path:
    raw = os.environ.get("TUCOOLS_MODELS", "").strip()
    if raw:
        return Path(raw)
    return pack_root() / "models"


def upscayl_path() -> Path:
    override = os.environ.get("TUCOOLS_UPSCAYL", "").strip()
    if override:
        return Path(override)
    system = platform.system()
    if system == "Windows":
        return pack_root() / "bin" / "windows" / "upscayl-bin.exe"
    if system == "Darwin":
        return pack_root() / "bin" / "macos" / "upscayl-bin"
    return pack_root() / "bin" / "linux" / "upscayl-bin"


def bind_pack_env() -> None:
    """让推理代码只从模型包读文件，不回落到程序目录。"""
    root = pack_root()
    os.environ.setdefault("TUCOOLS_MODEL_PACK", str(root))
    os.environ.setdefault("TUCOOLS_MODELS", str(models_dir()))
    os.environ.setdefault("TUCOOLS_UPSCAYL", str(upscayl_path()))


def missing(names: list[str]) -> list[str]:
    root = models_dir()
    return [name for name in names if not (root / name).is_file()]


def tool_status() -> dict:
    cutout_missing = missing(CUTOUT_MODELS)
    erase_missing = missing([ERASE_MODEL])
    binary = upscayl_path()
    enhance_missing: list[str] = []
    enhance_ready_models: list[str] = []
    for name, files in ENHANCE_MODELS.items():
        absent = missing(list(files))
        if absent:
            enhance_missing.extend(absent)
        else:
            enhance_ready_models.append(name)
    if not binary.is_file():
        enhance_missing.append(str(binary))
    cutout_ready_models = [
        name[: -len(".onnx")]
        for name in CUTOUT_MODELS
        if name not in cutout_missing
    ]
    return {
        "modelPack": str(pack_root()),
        "modelsDir": str(models_dir()),
        "upscayl": str(binary),
        "cutout": {
            "ready": len(cutout_ready_models) > 0,
            "missing": cutout_missing,
            "available": cutout_ready_models,
        },
        "enhance": {
            "ready": binary.is_file() and len(enhance_ready_models) > 0,
            "missing": enhance_missing,
            "available": enhance_ready_models,
        },
        "erase": {
            "ready": len(erase_missing) == 0,
            "missing": erase_missing,
            "available": [] if erase_missing else ["lama"],
        },
    }


def device_label() -> dict:
    cuda = False
    try:
        import torch

        cuda = bool(torch.cuda.is_available())
    except Exception:
        cuda = False
    return {"device": "cuda" if cuda else "cpu", "cuda": cuda}
