#!/usr/bin/env python3
"""
AI Image Inpainting Implementation - Multi-Model Support
Based on lama-cleaner complete implementation with multiple specialized models
"""

import os
import sys
import argparse
import cv2
import numpy as np
import json
import time

import torch

# 导入其他依赖
from PIL import Image, ImageOps
import logging
from pathlib import Path
from typing import Optional
import io
from enum import Enum
import gc

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("eerase.log", encoding="utf-8"),
    ],
)
logger = logging.getLogger(__name__)

# Ensure immediate log output
sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)

logger.info("AI Erase Module Started - Multi-Model Support with Prompt Guidance")


class HDStrategy(str, Enum):
    """High Resolution Strategy"""

    ORIGINAL = "Original"
    RESIZE = "Resize"
    CROP = "Crop"


class InpaintModel(str, Enum):
    """Available Inpainting Models"""

    LAMA = "lama"  # Best for: watermarks, simple patterns


class InpaintMode(str, Enum):
    """Inpainting Modes for different scenarios"""

    WATERMARK_REMOVAL = "common_removal"  # 去水印


class Config:
    """Enhanced Configuration class with multi-model support"""

    def __init__(self):
        # Model selection
        self.model_name = InpaintModel.LAMA
        self.inpaint_mode = InpaintMode.WATERMARK_REMOVAL

        # High resolution strategy configuration
        self.hd_strategy = HDStrategy.ORIGINAL

        # Prompt configuration
        self.prompt = ""
        self.negative_prompt = ""

    def auto_configure_for_mode(self, mode: InpaintMode):
        """Auto-configure settings based on inpainting mode"""
        if mode == InpaintMode.WATERMARK_REMOVAL:
            self.model_name = InpaintModel.LAMA
            self.prompt = ""
            self.negative_prompt = "watermark, text, logo, signature"

        logger.info(
            f"Auto-configured for {mode}: model={self.model_name}, prompt='{self.prompt}'"
        )





def get_models_path():
    """获取模型目录。优先使用 TUCOOLS_MODELS。"""
    env_dir = os.environ.get("TUCOOLS_MODELS")
    if env_dir:
        return Path(env_dir)
    if getattr(sys, "frozen", False):
        # PyInstaller打包后的情况
        if hasattr(sys, "_MEIPASS"):
            # 临时解压目录中查找
            temp_models_dir = Path(sys._MEIPASS) / "models"
            if temp_models_dir.exists():
                return temp_models_dir

        # 可执行文件同级目录查找
        exe_dir = Path(sys.executable).parent
        exe_models_dir = exe_dir / "models"
        if exe_models_dir.exists():
            return exe_models_dir

        # 如果都没找到，使用可执行文件目录
        return exe_dir / "models"
    else:
        return Path(__file__).resolve().parents[1] / "models"


def load_img(img_path_or_bytes, gray: bool = False, return_exif: bool = False):
    """
    Load image, completely corresponding to lama-cleaner's load_img function
    """
    alpha_channel = None

    # Determine input type
    if isinstance(img_path_or_bytes, (str, Path)):
        # File path
        image = Image.open(img_path_or_bytes)
    else:
        # Byte data
        image = Image.open(io.BytesIO(img_path_or_bytes))

    if return_exif:
        info = image.info or {}
        exif_infos = {"exif": image.getexif(), "parameters": info.get("parameters")}

    try:
        image = ImageOps.exif_transpose(image)
    except (AttributeError, Exception):
        pass

    if gray:
        image = image.convert("L")
        np_img = np.array(image)
    else:
        if image.mode == "RGBA":
            np_img = np.array(image)
            alpha_channel = np_img[:, :, -1]
            np_img = cv2.cvtColor(np_img, cv2.COLOR_RGBA2RGB)
        else:
            image = image.convert("RGB")
            np_img = np.array(image)

    if return_exif:
        return np_img, alpha_channel, exif_infos
    return np_img, alpha_channel


def norm_img(np_img):
    """
    Image normalization, corresponding to lama-cleaner's norm_img
    """
    if len(np_img.shape) == 2:
        np_img = np_img[:, :, np.newaxis]
    np_img = np.transpose(np_img, (2, 0, 1))
    np_img = np_img.astype("float32") / 255
    return np_img





def ceil_modulo(x, mod):
    """Round up to multiple of mod"""
    if x % mod == 0:
        return x
    return (x // mod + 1) * mod


def pad_img_to_modulo(
    img: np.ndarray, mod: int, square: bool = False, min_size: Optional[int] = None
):
    """
    Pad image to specified modulo, corresponding to lama-cleaner's pad_img_to_modulo
    """
    if len(img.shape) == 2:
        img = img[:, :, np.newaxis]
    height, width = img.shape[:2]
    out_height = ceil_modulo(height, mod)
    out_width = ceil_modulo(width, mod)

    if min_size is not None:
        assert min_size % mod == 0
        out_width = max(min_size, out_width)
        out_height = max(min_size, out_height)

    if square:
        max_size = max(out_height, out_width)
        out_height = max_size
        out_width = max_size

    return np.pad(
        img,
        ((0, out_height - height), (0, out_width - width), (0, 0)),
        mode="symmetric",
    )





class BaseInpaintModel:
    """Base class for all inpainting models"""

    def __init__(self, model_path: str, device: str = "cpu"):
        self.model_path = model_path
        self.device = torch.device(device)
        self.model = None
        self.name = "base"
        self.pad_mod = 8
        self.pad_to_square = False
        self.min_size = None

    def _load_model(self):
        """Load model - to be implemented by subclasses"""
        raise NotImplementedError

    def forward(self, image, mask, config: Config):
        """Forward pass - to be implemented by subclasses"""
        raise NotImplementedError

    def _pad_forward(self, image, mask, config: Config):
        """
        Padded forward pass with critical blending logic
        """
        origin_height, origin_width = image.shape[:2]
        pad_image = pad_img_to_modulo(
            image, mod=self.pad_mod, square=self.pad_to_square, min_size=self.min_size
        )
        pad_mask = pad_img_to_modulo(
            mask, mod=self.pad_mod, square=self.pad_to_square, min_size=self.min_size
        )

        logger.info(f"Padded size: {pad_image.shape}")

        result = self.forward(pad_image, pad_mask, config)
        result = result[0:origin_height, 0:origin_width, :]

        # Critical blending logic!
        mask = mask[:, :, np.newaxis]
        result = result * (mask / 255) + image[:, :, ::-1] * (1 - (mask / 255))
        return result

    def __call__(self, image, mask, config: Config):
        """Main call function with HD strategies"""
        # For now, use original strategy
        # Can be extended with crop/resize strategies
        inpaint_result = self._pad_forward(image, mask, config)
        return inpaint_result


class LaMaModel(BaseInpaintModel):
    """LaMa model - Best for watermarks and simple patterns"""

    name = "lama"
    pad_mod = 8

    def _load_model(self):
        """Load LaMa model with CUDA fallback"""
        try:
            logger.info(f"Loading LaMa model: {self.model_path}")

            if not os.path.exists(self.model_path):
                raise FileNotFoundError(f"Model file does not exist: {self.model_path}")

            # Load model to CPU first
            self.model = torch.jit.load(self.model_path, map_location="cpu")

            # Try to move to target device with fallback
            try:
                self.model = self.model.to(self.device)
                logger.info(f"LaMa model loaded successfully on {self.device}")
            except Exception as device_error:
                if str(self.device) != "cpu":
                    logger.warning(
                        f"Failed to load model on {self.device}: {str(device_error)}"
                    )
                    logger.info("Falling back to CPU for model execution")
                    self.device = torch.device("cpu")
                    self.model = self.model.to(self.device)
                else:
                    raise device_error

            self.model.eval()

        except Exception as e:
            logger.error(f"LaMa model loading failed: {str(e)}")
            raise

    def forward(self, image, mask, config: Config):
        """LaMa forward pass"""
        image = norm_img(image)
        mask = norm_img(mask)

        mask = (mask > 0) * 1
        image = torch.from_numpy(image).unsqueeze(0).to(self.device)
        mask = torch.from_numpy(mask).unsqueeze(0).to(self.device)

        with torch.no_grad():
            inpainted_image = self.model(image, mask)

        cur_res = inpainted_image[0].permute(1, 2, 0).detach().cpu().numpy()
        cur_res = np.clip(cur_res * 255, 0, 255).astype("uint8")
        cur_res = cv2.cvtColor(cur_res, cv2.COLOR_RGB2BGR)
        return cur_res


class ModelManager:
    """Enhanced Model Manager supporting multiple specialized models"""

    def __init__(self, device: str = "auto"):
        self.device = self._setup_device(device)
        self.models = {}
        self.current_model = None

    def _setup_device(self, device: str) -> str:
        """Setup computing device with proper fallback"""
        if device == "auto":
            device = "cuda" if torch.cuda.is_available() else "cpu"

        # Validate CUDA device availability
        if device == "cuda":
            try:
                # Test if CUDA is actually usable
                test_tensor = torch.tensor([1.0])
                test_tensor = test_tensor.to("cuda")
                test_tensor = test_tensor.to("cpu")  # Clean up
                logger.info(f"Using device: {device}")
            except Exception as e:
                logger.warning(f"CUDA requested but not available: {str(e)}")
                logger.info("Falling back to CPU processing")
                device = "cpu"
        else:
            logger.info(f"Using device: {device}")

        return device

    def load_model(self, model_name: InpaintModel, model_path: Optional[str] = None):
        """Load specific model"""
        if model_name in self.models:
            logger.info(f"Model {model_name} already loaded")
            return self.models[model_name]

        # Get model path
        if model_path is None:
            model_path = self._get_default_model_path(model_name)

        # Create model instance
        if model_name == InpaintModel.LAMA:
            model = LaMaModel(model_path, self.device)
        else:
            # Fallback to LaMa
            logger.warning(f"Model {model_name} not implemented, using LaMa")
            model = LaMaModel(
                self._get_default_model_path(InpaintModel.LAMA), self.device
            )

        model._load_model()
        self.models[model_name] = model
        logger.info(f"Model {model_name} loaded successfully")
        return model

    def _get_default_model_path(self, model_name: InpaintModel) -> str:
        """Get default model path"""
        models_dir = get_models_path()

        if model_name == InpaintModel.LAMA:
            default_model = os.path.join(models_dir, "big-lama.pt")
        else:
            # For other models, return placeholder path
            default_model = os.path.join(models_dir, f"{model_name}.pt")

        if model_name == InpaintModel.LAMA and not os.path.exists(default_model):
            raise FileNotFoundError(
                f"Default model file does not exist: {default_model}"
            )

        return default_model

    def get_model(self, model_name: InpaintModel) -> BaseInpaintModel:
        """Get loaded model or load if not exists"""
        if model_name not in self.models:
            self.load_model(model_name)
        return self.models[model_name]


def check_dependencies():
    """检查依赖是否正常"""
    try:
        # 检查核心依赖
        import torch
        import cv2
        import numpy as np
        from PIL import Image

        return {
            "status": "success",
            "torch_version": torch.__version__,
            "cv2_version": cv2.__version__,
            "numpy_version": np.__version__,
            "pil_available": True,
        }
    except ImportError as e:
        return {
            "status": "error",
            "error": f"依赖导入失败: {str(e)}",
            "type": "import_error",
        }
    except Exception as e:
        return {
            "status": "error",
            "error": f"依赖检查失败: {str(e)}",
            "type": "dependency_error",
        }


def check_models_availability():
    """检查模型可用性"""
    try:
        models_path = get_models_path()
        models_info = {
            "status": "success",
            "models_directory": str(models_path),
            "directory_exists": os.path.exists(models_path),
            "local_models": [],
        }

        # 检查LaMa模型文件
        lama_model_path = os.path.join(models_path, "big-lama.pt")

        if os.path.exists(lama_model_path):
            models_info["local_models"].append("lama")

        return models_info

    except Exception as e:
        return {
            "status": "error",
            "error": f"Model Check Error: {str(e)}",
            "type": "model_error",
        }


def check_gpu_acceleration():
    """详细检查GPU加速可用性"""
    try:
        gpu_info = {
            "status": "success",
            "cuda_available": False,
            "gpu_available": False,
            "cuda_version": None,
            "gpu_count": 0,
            "gpu_names": [],
            "gpu_test_result": None,
        }

        # 检查PyTorch CUDA支持
        gpu_info["cuda_available"] = torch.cuda.is_available()

        if gpu_info["cuda_available"]:
            try:
                gpu_info["gpu_available"] = True
                gpu_info["cuda_version"] = torch.version.cuda
                gpu_info["gpu_count"] = torch.cuda.device_count()

                # 获取GPU名称
                for i in range(gpu_info["gpu_count"]):
                    gpu_name = torch.cuda.get_device_name(i)
                    gpu_info["gpu_names"].append(gpu_name)

                # 简单的GPU测试
                test_tensor = torch.tensor([1.0]).cuda()
                test_result = test_tensor.cpu()
                gpu_info["gpu_test_result"] = "GPU Check Success"

            except Exception as e:
                gpu_info["gpu_test_result"] = f"GPU Check Error: {str(e)}"
        else:
            gpu_info["gpu_test_result"] = "CUDA is not available"

        return gpu_info

    except Exception as e:
        return {
            "status": "error",
            "error": f"GPU Check Error: {str(e)}",
            "type": "gpu_error",
        }


def run_functionality_check():
    """运行完整的功能可用性检测"""
    try:
        # 临时禁用stdout日志输出，只保留文件日志
        stdout_handler = None
        for handler in logger.handlers:
            if (
                isinstance(handler, logging.StreamHandler)
                and handler.stream == sys.stdout
            ):
                stdout_handler = handler
                logger.removeHandler(handler)
                break

        check_results = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "overall_status": "unknown",
            "checks": {},
        }

        # 1. 检查依赖
        dep_result = check_dependencies()
        check_results["checks"]["dependencies"] = dep_result

        # 2. 检查模型
        model_result = check_models_availability()
        check_results["checks"]["models"] = model_result

        # 3. 检查GPU加速
        gpu_result = check_gpu_acceleration()
        check_results["checks"]["gpu"] = gpu_result

        # 判断整体状态
        all_success = all(
            result.get("status") == "success"
            for result in check_results["checks"].values()
        )

        if all_success:
            check_results["overall_status"] = "healthy"
        else:
            check_results["overall_status"] = "issues_detected"

        # 输出检测结果 - 只输出JSON，不包含其他日志
        print(f"RESULT:{json.dumps(check_results, ensure_ascii=False)}")
        sys.stdout.flush()

        # 恢复stdout日志处理器
        if stdout_handler:
            logger.addHandler(stdout_handler)

        return check_results

    except Exception as e:
        error_result = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "overall_status": "error",
            "error": f"健康检查失败: {str(e)}",
            "type": "health_check_error",
        }
        print(f"RESULT:{json.dumps(error_result, ensure_ascii=False)}")
        sys.stdout.flush()

        # 恢复stdout日志处理器
        if "stdout_handler" in locals() and stdout_handler:
            logger.addHandler(stdout_handler)

        return error_result


class ImageEraser:
    """Enhanced Image Eraser with multi-model support and smart mode selection"""

    def __init__(self, device: str = "auto"):
        """Initialize Enhanced Image Eraser"""
        self.device = device
        self.model_manager = ModelManager(device)

    def process_single(
        self,
        image_path: str,
        mask_path: str,
        output_path: str,
        inpaint_mode: str = "common_removal",
        model_name: Optional[str] = None,
        prompt: str = "",
        negative_prompt: str = "",
        hd_strategy: str = "original",
        **kwargs,
    ) -> bool:
        """
        Process single image with enhanced multi-model support

        Args:
            image_path: Input image path
            mask_path: Mask image path
            output_path: Output image path
            inpaint_mode: Inpainting mode ('common_removal', 'object_removal', etc.)
            model_name: Specific model to use (optional, auto-selected if None)
            prompt: Text prompt for guidance (for SD models)
            negative_prompt: Negative prompt
            hd_strategy: High resolution strategy

        Returns:
            bool: Whether processing succeeded
        """
        try:
            # Parse inpaint mode
            mode = InpaintMode(inpaint_mode)
            logger.info(f"Processing with mode: {mode}")

            # Create and auto-configure settings
            config = Config()
            config.auto_configure_for_mode(mode)

            # Override with user settings
            if model_name:
                config.model_name = InpaintModel(model_name)
            if prompt:
                config.prompt = prompt
            if negative_prompt:
                config.negative_prompt = negative_prompt

            if hd_strategy.lower() == "resize":
                config.hd_strategy = HDStrategy.RESIZE
            elif hd_strategy.lower() == "crop":
                config.hd_strategy = HDStrategy.CROP

            # logger.info(f"Selected model: {config.model_name}")
            # logger.info(f"Using prompt: '{config.prompt}'")

            # Load image and mask
            image, alpha_channel, exif_infos = load_img(image_path, return_exif=True)
            mask, _ = load_img(mask_path, gray=True)

            # Binary threshold mask
            mask = cv2.threshold(mask, 127, 255, cv2.THRESH_BINARY)[1]

            # Auto-resize mask if needed
            if mask.shape[:2] != image.shape[:2]:
                # logger.info(f"Resizing mask from {mask.shape[:2]} to {image.shape[:2]}")
                mask = cv2.resize(
                    mask,
                    (image.shape[1], image.shape[0]),
                    interpolation=cv2.INTER_NEAREST,
                )

            # Get model and process
            model = self.model_manager.get_model(config.model_name)
            # logger.info(f"Processing with {model.name} model...")

            # Process image
            result = model(image, mask, config)

            # Convert color space: BGR -> RGB
            result = cv2.cvtColor(result.astype(np.uint8), cv2.COLOR_BGR2RGB)

            # Handle alpha channel
            if alpha_channel is not None:
                if alpha_channel.shape[:2] != result.shape[:2]:
                    alpha_channel = cv2.resize(
                        alpha_channel, dsize=(result.shape[1], result.shape[0])
                    )
                result = np.concatenate(
                    (result, alpha_channel[:, :, np.newaxis]), axis=-1
                )

            # Save result
            # logger.info(f"Saving result to: {output_path}")
            output_dir = os.path.dirname(output_path)
            if output_dir:  # Only create directory if output_path has a directory part
                os.makedirs(output_dir, exist_ok=True)

            result_image = Image.fromarray(result)
            save_kwargs = {}
            if exif_infos.get("exif"):
                save_kwargs["exif"] = exif_infos["exif"]

            # Check if output is JPG/JPEG and handle RGBA conversion
            is_jpg_output = output_path.lower().endswith(
                ".jpg"
            ) or output_path.lower().endswith(".jpeg")
            if is_jpg_output and result_image.mode == "RGBA":
                logger.info("Converting RGBA image to RGB for JPEG output")
                # Create white background
                background = Image.new("RGB", result_image.size, (255, 255, 255))
                # Paste using alpha channel as mask
                background.paste(result_image, mask=result_image.split()[3])
                result_image = background

            # Save with appropriate format
            if is_jpg_output:
                # Ensure RGB mode for JPEG
                if result_image.mode != "RGB":
                    result_image = result_image.convert("RGB")
                result_image.save(output_path, "JPEG", quality=95, **save_kwargs)
            else:
                result_image.save(output_path, quality=95, **save_kwargs)

            # Verify output
            if not os.path.exists(output_path):
                raise IOError(f"Save failed: {output_path}")

            file_size = os.path.getsize(output_path)
            # logger.info(f"Processing completed! File size: {file_size} bytes")
            return True

        except Exception as e:
            logger.error(f"Processing failed: {str(e)}")
            raise


def main():
    """Enhanced main function with multi-model support"""
    parser = argparse.ArgumentParser(
        description="Enhanced AI Image Inpainting Tool - Multi-Model Support with Smart Mode Selection"
    )
    parser.add_argument("--image", help="Input image path")
    parser.add_argument("--mask", help="Mask image path")
    parser.add_argument("--output", help="Output image path")
    parser.add_argument(
        "--device",
        default="auto",
        choices=["auto", "cuda", "cpu"],
        help="Computing device",
    )
    parser.add_argument(
        "--mode",
        default="common_removal",
        choices=[
            "common_removal",
        ],
        help="Inpainting mode for automatic optimization",
    )
    parser.add_argument(
        "--model",
        choices=["lama"],
        help="Specific model to use (auto-selected based on mode if not specified)",
    )
    parser.add_argument(
        "--prompt", default="", help="Text prompt for guidance (for SD models)"
    )
    parser.add_argument("--negative-prompt", default="", help="Negative prompt")
    parser.add_argument(
        "--hd-strategy",
        default="original",
        choices=["original", "resize", "crop"],
        help="High resolution strategy",
    )
    parser.add_argument(
        "--health-check", action="store_true", help="运行功能可用性检测"
    )

    args = parser.parse_args()

    # 如果是健康检查模式，直接运行检测并退出
    if args.health_check:
        logger.info("Begin Check Erase Environment...")
        run_functionality_check()
        # logger.info("Check Erase Environment Done")
        return

    # 验证必需参数
    if not args.image or not args.mask or not args.output:
        logger.error("Erase Param Requires --image, --mask and --output Parameters")
        sys.exit(1)

    try:
        # Create enhanced eraser
        eraser = ImageEraser(device=args.device)

        # Process image with enhanced pipeline
        success = eraser.process_single(
            args.image,
            args.mask,
            args.output,
            inpaint_mode=args.mode,
            model_name=args.model,
            prompt=args.prompt,
            negative_prompt=args.negative_prompt,
            hd_strategy=args.hd_strategy,
        )

        if success:
            # print(f"Processing successful! Mode: {args.mode}")
            if args.prompt:
                print(f"Used prompt: '{args.prompt}'")
            sys.exit(0)
        else:
            print("Processing failed!")
            sys.exit(1)

    except Exception as e:
        logger.error(f"Program error: {str(e)}")
        print(f"Error: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
