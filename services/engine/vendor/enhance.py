#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
import argparse
import json
import logging
import warnings
from pathlib import Path
import subprocess
import platform
import time
from PIL import Image, ExifTags

Image.MAX_IMAGE_PIXELS = 300000000
# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("eenhance.log", encoding="utf-8"),
    ],
)
logger = logging.getLogger(__name__)

# Ensure immediate log output
sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)

# 忽略警告
warnings.filterwarnings("ignore", category=UserWarning)


def get_resource_path():
    """获取资源根目录。模型在其 models/ 下，超分程序在其 bin/<平台>/ 下。"""
    pack = os.environ.get("TUCOOLS_MODEL_PACK")
    if pack:
        return pack
    runtime = os.environ.get("TUCOOLS_RUNTIME")
    if runtime:
        return runtime
    models = os.environ.get("TUCOOLS_MODELS")
    if models:
        return os.path.dirname(os.path.abspath(models))
    if getattr(sys, "frozen", False):
        # PyInstaller 打包后的情况
        # sys.executable 指向打包后的可执行文件
        base_path = os.path.dirname(sys.executable)
        logger.info(f"Running in packaged mode, base path: {base_path}")
    else:
        base_path = str(Path(__file__).resolve().parents[1])
        logger.info(f"Running in development mode, base path: {base_path}")

    return base_path


# 进度报告工具函数
def report_progress(current, total, filename, status, extra_info=None):
    """报告处理进度"""
    progress = {
        "current": current,
        "total": total,
        "filename": filename,
        "status": status,
        "percentage": round((current / total) * 100, 2) if total > 0 else 0,
    }

    if extra_info:
        progress.update(extra_info)

    print(f"PROGRESS:{json.dumps(progress)}")
    sys.stdout.flush()


# 图像工具函数
def validate_image_file(file_path):
    """验证是否为有效的图像文件"""
    try:
        image = Image.open(file_path)
        image.verify()
        return True
    except Exception:
        return False


def get_image_info(file_path):
    """获取图像信息"""
    try:
        with Image.open(file_path) as img:
            return {
                "width": img.width,
                "height": img.height,
                "mode": img.mode,
                "format": img.format,
                "size_bytes": os.path.getsize(file_path),
            }
    except Exception as e:
        raise ValueError(f"无法获取图像信息: {str(e)}")


# AI模型配置 - 专注于图像优化，使用经过验证的可靠模型
SUPPORTED_MODELS = {
    # 通用增强 - 使用轻量级可靠模型
    "balanced": {
        "model": "upscayl-lite-4x",
        "scale": 2,  # 默认2倍放大
        "description": "通用增强 - 轻量级可靠，适合大多数图像",
        "type": "general",
    },
    # 标准增强 - 使用标准模型
    "standard": {
        "model": "upscayl-standard-4x",
        "scale": 2,  # 默认2倍放大
        "description": "标准增强 - 保持原始风格和细节",
        "type": "general",
    },
    # 高质量增强 - 使用RealESRGAN官方模型
    "premium": {
        "model": "realesrgan-x4plus",
        "scale": 2,  # 默认2倍放大
        "description": "高质量增强 - RealESRGAN官方模型，质量最佳",
        "type": "premium",
    },
    # 数字艺术增强
    "anime": {
        "model": "digital-art-4x",
        "scale": 2,  # 默认2倍放大
        "description": "数字艺术增强 - 适合动漫和数字绘画",
        "type": "digital_art",
    },
    # 动漫专业增强
    "anime_pro": {
        "model": "realesrgan-x4plus-anime",
        "scale": 2,  # 默认2倍放大
        "description": "动漫专业增强 - 专为动漫优化的高质量模型",
        "type": "anime_specialized",
    },
}


def get_realesrgan_executable():
    """获取图像优化可执行文件路径"""
    override = os.environ.get("TUCOOLS_UPSCAYL")
    if override:
        return override
    # 获取资源文件基础路径
    base_path = get_resource_path()

    # bin 目录就在基础路径下
    bin_dir = os.path.join(base_path, "bin")

    logger.info(f"Looking for executables in: {bin_dir}")
    system = platform.system()

    if system == "Windows":
        platform_dir = os.path.join(bin_dir, "windows")
        executable = os.path.join(platform_dir, "upscayl-bin.exe")
        return executable

    elif system == "Linux":
        platform_dir = os.path.join(bin_dir, "linux")
        executable = os.path.join(platform_dir, "upscayl-bin")

        if os.path.exists(executable):
            try:
                os.chmod(executable, 0o755)  # 赋予可执行权限
            except:
                pass
        return executable

    elif system == "Darwin":
        platform_dir = os.path.join(bin_dir, "macos")
        executable = os.path.join(platform_dir, "upscayl-bin")

        if os.path.exists(executable):
            try:
                os.chmod(executable, 0o755)  # 赋予可执行权限
            except:
                pass
        return executable

    else:
        logger.warning(f"Unknown platform: {system}, trying generic path")
        return os.path.join(bin_dir, "upscayl-bin")


def get_models_path():
    """获取模型文件路径"""
    models = os.environ.get("TUCOOLS_MODELS")
    if models:
        return models
    # 获取资源文件基础路径
    base_path = get_resource_path()

    # models 目录就在基础路径下
    models_dir = os.path.join(base_path, "models")

    return models_dir


def check_gpu_availability():
    """检查GPU是否可用"""
    try:
        # 尝试使用nvidia-smi检测
        result = subprocess.run(
            ["nvidia-smi"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=5
        )
        if result.returncode == 0:
            return True
    except:
        pass

    return False


def apply_exif_orientation(image, orientation):
    """根据EXIF方向值物理旋转图像。"""
    if orientation == 2:
        return image.transpose(Image.FLIP_LEFT_RIGHT)
    elif orientation == 3:
        return image.transpose(Image.ROTATE_180)
    elif orientation == 4:
        return image.transpose(Image.FLIP_TOP_BOTTOM)
    elif orientation == 5:
        return image.transpose(Image.TRANSPOSE)  # 转置 (相当于顺时针旋转270度再翻转)
    elif orientation == 6:
        return image.transpose(Image.ROTATE_270)  # 顺时针旋转90度
    elif orientation == 7:
        return image.transpose(
            Image.TRANSVERSE
        )  # 横向转置 (相当于顺时针旋转90度再翻转)
    elif orientation == 8:
        return image.transpose(Image.ROTATE_90)  # 顺时针旋转270度 (逆时针90度)
    return image  # Orientation 1 或未知，不需旋转


def process_image(
    input_path,
    output_path,
    model="balanced",
    scale=4,
    use_gpu=False,
):
    """处理单张图片"""
    filename = os.path.basename(input_path)
    temp_input_path = None
    temp_output_path_after_upscale = None
    original_exif_orientation = 1  # 默认值，如果无EXIF或读取失败

    try:

        # 验证输入文件
        if not os.path.exists(input_path):
            raise Exception(f"Input file not found: {input_path}")

        # --- 预处理：读取EXIF方向并物理扶正图像作为upscayl输入 ---
        original_img = Image.open(input_path)

        # 尝试读取EXIF方向
        try:
            if (
                hasattr(original_img, "_getexif")
                and original_img._getexif() is not None
            ):
                for tag_id, tag_name in ExifTags.TAGS.items():
                    if tag_name == "Orientation":
                        exif = original_img._getexif()
                        if exif is not None and tag_id in exif:
                            original_exif_orientation = exif[tag_id]
                            logger.info(
                                f"Original EXIF Orientation for {filename}: {original_exif_orientation}"
                            )
                            break
        except Exception as e:
            logger.warning(f"Could not read EXIF Orientation for {filename}: {e}")

        # 根据EXIF方向物理旋转图像，使其变为“正向”
        # Pillow的Image.open()在读取时通常会根据EXIF自动旋转图像。
        # 但为了确保传递给外部工具的是“扶正”的图像，我们显式地进行转换
        # 同时，我们移除或忽略可能已经应用的旋转，确保原始像素数据被正确处理

        # Pillow的load()方法会应用EXIF方向并清除Orientation标签
        original_img.load()  # 确保图像数据被完全加载，并应用了EXIF旋转（如果存在）
        # 此时 original_img 已经是物理扶正的，其EXIF中的Orientation标签如果被Pillow处理，可能已经移除或置为1

        # 为了更明确，如果原始图像有Orientation信息且Pillow没有自动处理（某些情况可能），
        # 我们可以强制将其物理扶正。但通常情况下，Image.open().load()会完成这一步。
        # 最简单的方法是，让Pillow先自动处理，然后我们确保临时文件是纯粹的物理数据。

        # 为了避免任何不确定性，我们确保临时文件不含EXIF方向信息，且图像本身是物理正的
        temp_input_path = input_path.rsplit(".", 1)[0] + "_temp_input_pre_upscale.png"

        # 强制将图像转换为RGB，移除alpha通道和可能的EXIF信息
        if original_img.mode in ("RGBA", "LA", "P", "L"):
            temp_img_for_upscale = Image.new("RGB", original_img.size, (255, 255, 255))
            temp_img_for_upscale.paste(
                original_img,
                mask=original_img.split()[-1] if original_img.mode == "RGBA" else None,
            )
        else:
            temp_img_for_upscale = original_img.convert("RGB")

        # 保存为临时PNG文件，PNG不携带复杂的EXIF方向元数据，从而保证外部工具处理的是“正向”图像
        temp_img_for_upscale.save(temp_input_path, "PNG")
        logger.info(
            f"Saved physically oriented temp input for upscaling: {temp_input_path}"
        )
        # --- 预处理结束 ---

        # 验证模型参数
        if model not in SUPPORTED_MODELS:
            raise Exception(f"Unsupported model: {model}")

        model_config = SUPPORTED_MODELS[model]
        actual_model = model_config["model"]
        actual_scale = scale or model_config["scale"]

        # 获取可执行文件和模型路径
        executable = get_realesrgan_executable()
        models_path = get_models_path()

        # 验证可执行文件存在且有执行权限
        if not os.path.exists(executable):
            raise Exception(f"Executable file not found: {executable}")

        if platform.system() != "Windows":
            try:
                if not os.access(executable, os.X_OK):
                    os.chmod(executable, 0o755)
            except Exception as e:
                logger.warning(f"Set executable permission failed: {e}")

        # 确保输出目录存在
        output_dir = os.path.dirname(output_path)
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)

        # 外部工具处理的实际输出路径 (总是PNG，之后再转换为目标格式)
        temp_output_path_after_upscale = (
            output_path.rsplit(".", 1)[0] + "_temp_upscale_output.png"
        )

        executable_name = os.path.basename(executable)
        is_upscayl = "upscayl-bin" in executable_name

        if is_upscayl:
            cmd_args = [
                executable,
                "-i",
                temp_input_path,  # 使用物理扶正的临时输入文件
                "-o",
                temp_output_path_after_upscale,
                "-n",
                actual_model,
                "-s",
                str(actual_scale),
                "-m",
                models_path,
                "-f",
                "png",
            ]
            if use_gpu and check_gpu_availability():
                logger.info("Using GPU acceleration (upscayl)")
            else:
                logger.info("Using CPU (upscayl)")
        else:
            cmd_args = [
                executable,
                "-i",
                temp_input_path,  # 使用物理扶正的临时输入文件
                "-o",
                temp_output_path_after_upscale,
                "-n",
                actual_model,
                "-s",
                str(actual_scale),
                "-m",
                models_path,
            ]
            if use_gpu and check_gpu_availability():
                cmd_args.extend(["-g", "0"])
                logger.info("Using GPU acceleration")
            else:
                cmd_args.extend(["-g", "-1"])
                logger.info(
                    "Using CPU" if not use_gpu else "GPU is not available, using CPU"
                )

        # 执行命令
        logger.info(f"Run Command: {' '.join(cmd_args)}")
        process = subprocess.Popen(
            cmd_args,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True,
        )

        # 等待进程完成
        stdout, stderr = process.communicate()

        if process.returncode != 0:
            error_msg = (
                f"Upscale tool failed (exit code: {process.returncode}): {stderr}"
            )
            logger.error(error_msg)
            report_progress(0, 1, filename, "error")
            raise Exception(error_msg)

        # 检查中间输出文件是否生成
        if not os.path.exists(temp_output_path_after_upscale):
            error_msg = "Upscale tool completed but output file not generated"
            logger.error(error_msg)
            report_progress(0, 1, filename, "error")
            raise Exception(error_msg)

        # --- 后处理：应用原始EXIF方向到放大后的图像，并保存最终结果 ---
        final_processed_img = Image.open(temp_output_path_after_upscale)

        # 根据原始EXIF方向值反向旋转放大后的图像
        # 这里的 apply_exif_orientation 已经处理了物理旋转
        # 我们需要的是将放大后的“扶正”图片，旋转回原始应有的显示方向
        corrected_final_img = apply_exif_orientation(
            final_processed_img, original_exif_orientation
        )

        # 处理透明度，转换为RGB以便保存为JPG
        if corrected_final_img.mode in ("RGBA", "LA"):
            background = Image.new("RGB", corrected_final_img.size, (255, 255, 255))
            background.paste(
                corrected_final_img,
                mask=(
                    corrected_final_img.split()[-1]
                    if corrected_final_img.mode == "RGBA"
                    else None
                ),
            )
            corrected_final_img = background
        elif corrected_final_img.mode != "RGB":
            corrected_final_img = corrected_final_img.convert("RGB")

        # 确定最终输出格式并保存
        if output_path.lower().endswith((".jpg", ".jpeg")):
            # 保存为JPG，不再写入Orientation EXIF标签，因为图像本身已被物理扶正
            corrected_final_img.save(output_path, "JPEG", quality=95, optimize=True)
            logger.info(
                f"Final image saved as JPG with corrected orientation: {output_path}"
            )
        elif output_path.lower().endswith(".png"):
            # 保存为PNG
            corrected_final_img.save(output_path, "PNG")
            logger.info(
                f"Final image saved as PNG with corrected orientation: {output_path}"
            )
        else:
            # 对于其他格式，直接复制或默认保存
            corrected_final_img.save(output_path)
            logger.info(
                f"Final image saved in specified output format with corrected orientation: {output_path}"
            )

        # 清理临时文件
        if temp_input_path and os.path.exists(temp_input_path):
            os.remove(temp_input_path)
            logger.info(f"Cleaned up temporary input file: {temp_input_path}")
        if temp_output_path_after_upscale and os.path.exists(
            temp_output_path_after_upscale
        ):
            os.remove(temp_output_path_after_upscale)
            logger.info(
                f"Cleaned up temporary upscale output file: {temp_output_path_after_upscale}"
            )
        # --- 后处理结束 ---

        # 检查最终输出文件
        if not os.path.exists(output_path):
            error_msg = (
                "Final output file generation failed after orientation correction"
            )
            logger.error(error_msg)
            report_progress(0, 1, filename, "error")
            raise Exception(error_msg)

        logger.info(
            f"Successfully processed and corrected orientation for: {input_path} -> {output_path}"
        )
        return True

    except Exception as e:
        logger.error(f"Error processing {input_path} -> {output_path}: {str(e)}")
        report_progress(0, 1, filename, "error")
        return False
    finally:
        # 确保在任何情况下都尝试清理临时文件
        if temp_input_path and os.path.exists(temp_input_path):
            try:
                os.remove(temp_input_path)
            except Exception as e:
                logger.error(f"Failed to clean up {temp_input_path}: {e}")
        if temp_output_path_after_upscale and os.path.exists(
            temp_output_path_after_upscale
        ):
            try:
                os.remove(temp_output_path_after_upscale)
            except Exception as e:
                logger.error(
                    f"Failed to clean up {temp_output_path_after_upscale}: {e}"
                )


def check_dependencies():
    """检查依赖是否正常"""
    try:
        # 检查核心依赖
        from PIL import Image
        import platform

        # 检查PIL版本
        pil_version = Image.__version__ if hasattr(Image, "__version__") else "unknown"

        # 检查系统平台
        system_info = {
            "system": platform.system(),
            "platform": platform.platform(),
            "python_version": platform.python_version(),
        }

        return {
            "status": "success",
            "pil_version": pil_version,
            "system_info": system_info,
            "subprocess_available": True,
        }
    except ImportError as e:
        return {
            "status": "error",
            "error": f"Dependency import failed: {str(e)}",
            "type": "import_error",
        }
    except Exception as e:
        return {
            "status": "error",
            "error": f"Dependency check failed: {str(e)}",
            "type": "dependency_error",
        }


def check_executables_availability():
    """检查可执行文件可用性"""
    try:
        executable_info = {
            "status": "success",
            "executable_path": None,
            "executable_exists": False,
            "executable_permissions": False,
            "models_path": None,
            "models_directory_exists": False,
        }

        # 检查可执行文件
        try:
            executable = get_realesrgan_executable()
            executable_info["executable_path"] = executable
            executable_info["executable_exists"] = os.path.exists(executable)

            if executable_info["executable_exists"]:
                # 检查执行权限
                if platform.system() != "Windows":
                    executable_info["executable_permissions"] = os.access(
                        executable, os.X_OK
                    )
                else:
                    executable_info["executable_permissions"] = True
        except Exception as e:
            executable_info["executable_error"] = str(e)

        # 检查模型目录
        try:
            models_path = get_models_path()
            executable_info["models_path"] = models_path
            executable_info["models_directory_exists"] = os.path.exists(models_path)
        except Exception as e:
            executable_info["models_error"] = str(e)

        return executable_info

    except Exception as e:
        return {
            "status": "error",
            "error": f"Executable check failed: {str(e)}",
            "type": "executable_error",
        }


def check_gpu_acceleration():
    """详细检查GPU加速可用性"""
    try:
        gpu_info = {
            "status": "success",
            "nvidia_smi_available": False,
            "gpu_available": False,
            "gpu_test_result": None,
        }

        # 检查nvidia-smi
        try:
            result = subprocess.run(
                ["nvidia-smi"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=5,
            )
            gpu_info["nvidia_smi_available"] = result.returncode == 0
            if gpu_info["nvidia_smi_available"]:
                gpu_info["nvidia_smi_output"] = result.stdout.decode(
                    "utf-8", errors="ignore"
                )[:500]
        except Exception as e:
            gpu_info["nvidia_smi_error"] = str(e)

        # 综合GPU测试结果
        if gpu_info["nvidia_smi_available"]:
            gpu_info["gpu_test_result"] = "NVIDIA GPU Can be used"
            gpu_info["gpu_available"] = True
        else:
            gpu_info["gpu_test_result"] = "GPU acceleration is not available"
            gpu_info["gpu_available"] = False

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

        # 2. 检查可执行文件和模型
        exec_result = check_executables_availability()
        check_results["checks"]["executables"] = exec_result

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
            "error": f"Health check failed: {str(e)}",
            "type": "health_check_error",
        }
        print(f"RESULT:{json.dumps(error_result, ensure_ascii=False)}")
        sys.stdout.flush()

        # 恢复stdout日志处理器
        if "stdout_handler" in locals() and stdout_handler:
            logger.addHandler(stdout_handler)

        return error_result


def process_directory(input_dir, output_dir, model="balanced", scale=4, use_gpu=False):
    """处理整个目录的图片"""
    input_dir = Path(input_dir)
    output_dir = Path(output_dir)

    # 确保输出目录存在
    os.makedirs(output_dir, exist_ok=True)

    # 获取所有图片文件
    image_extensions = [".jpg", ".jpeg", ".png", ".bmp", ".webp", ".tiff"]
    image_files = set()

    for ext in image_extensions:
        files = list(input_dir.glob(f"*{ext.lower()}"))
        files.extend(list(input_dir.glob(f"*{ext.upper()}")))
        image_files.update([str(f) for f in files])

    image_files = [Path(f) for f in image_files]

    if not image_files:
        logger.warning(f"No image files found in {input_dir}")
        return

    logger.info(f"Found {len(image_files)} image files, starting batch processing...")
    sys.stdout.flush()  # 确保日志消息立即输出

    success_count = 0
    failed_count = 0
    processed_files = set()

    for i, img_path in enumerate(image_files):
        if str(img_path) in processed_files:
            logger.info(f"Jump FIle: {img_path}")
            continue

        processed_files.add(str(img_path))

        rel_path = img_path.relative_to(input_dir)
        output_path = output_dir / rel_path

        try:
            # 报告开始处理
            report_progress(
                i, len(image_files), os.path.basename(img_path), "processing"
            )
            if process_image(
                str(img_path),
                str(output_path),
                model,
                scale,
                use_gpu,
            ):
                report_progress(
                    i + 1, len(image_files), os.path.basename(img_path), "completed"
                )
                success_count += 1
            else:
                failed_count += 1
        except Exception as e:
            logger.error(f"Process file {img_path} failed: {str(e)}")
            failed_count += 1

        time.sleep(0.2)

    logger.info(
        f"Batch processing completed: {success_count} success, {failed_count} failed"
    )
    sys.stdout.flush()


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="AI图像优化工具")
    parser.add_argument("input_path", nargs="?", help="输入图片路径")
    parser.add_argument("output_path", nargs="?", help="输出图片路径")
    parser.add_argument(
        "--model",
        default="balanced",
        choices=list(SUPPORTED_MODELS.keys()),
        help="优化模型选择",
    )
    parser.add_argument("--scale", type=int, default=4, help="放大倍率")
    parser.add_argument("--gpu", action="store_true", help="使用GPU加速")
    parser.add_argument("--batch", action="store_true", help="批量处理模式")
    parser.add_argument(
        "--health-check", action="store_true", help="运行功能可用性检测"
    )

    args = parser.parse_args()

    # 如果是健康检查模式，直接运行检测并退出
    if args.health_check:
        logger.info("Begin Check Enhance Environment...")
        run_functionality_check()
        return

    # 验证必需参数
    if not args.input_path or not args.output_path:
        logger.error("Enhance Param Requires --input_path and --output_path Parameters")
        sys.exit(1)

    try:
        if args.batch:
            process_directory(
                args.input_path, args.output_path, args.model, args.scale, args.gpu
            )
        else:
            report_progress(0, 1, os.path.basename(args.input_path), "processing")
            success = process_image(
                args.input_path, args.output_path, args.model, args.scale, args.gpu
            )
            if success:
                report_progress(1, 1, os.path.basename(args.input_path), "completed")
            if not success:
                sys.exit(1)

    except KeyboardInterrupt:
        logger.info("User interrupt processing")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Process exception: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
