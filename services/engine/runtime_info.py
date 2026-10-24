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


def cutout_status() -> dict:
    absent = missing(CUTOUT_MODELS)
    available = [name[: -len(".onnx")] for name in CUTOUT_MODELS if name not in absent]
    return {
        "ready": len(available) > 0,
        "missing": absent,
        "available": available,
    }


def enhance_status() -> dict:
    binary = upscayl_path()
    absent_files: list[str] = []
    available: list[str] = []
    for name, files in ENHANCE_MODELS.items():
        absent = missing(list(files))
        if absent:
            absent_files.extend(absent)
        else:
            available.append(name)
    if not binary.is_file():
        absent_files.append(str(binary))
    return {
        "ready": binary.is_file() and len(available) > 0,
        "missing": absent_files,
        "available": available,
    }


def erase_status() -> dict:
    absent = missing([ERASE_MODEL])
    return {
        "ready": len(absent) == 0,
        "missing": absent,
        "available": [] if absent else ["lama"],
    }


TOOL_CHECKS = {
    "cutout": cutout_status,
    "enhance": enhance_status,
    "erase": erase_status,
}


def tool_status() -> dict:
    """三个功能一起列出。页面检查单个功能时不要走这里。"""
    binary = upscayl_path()
    return {
        "modelPack": str(pack_root()),
        "modelsDir": str(models_dir()),
        "upscayl": str(binary),
        "cutout": cutout_status(),
        "enhance": enhance_status(),
        "erase": erase_status(),
    }


def single_tool_status(tool: str) -> dict:
    """只检查一个功能是否支持，不读取其他功能的模型。"""
    status = TOOL_CHECKS[tool]()
    body = {
        "tool": tool,
        "modelPack": str(pack_root()),
        "modelsDir": str(models_dir()),
        **status,
    }
    if tool == "enhance":
        body["upscayl"] = str(upscayl_path())
    return body


def device_label() -> dict:
    cuda = False
    try:
        import torch

        cuda = bool(torch.cuda.is_available())
    except Exception:
        cuda = False
    return {"device": "cuda" if cuda else "cpu", "cuda": cuda}
