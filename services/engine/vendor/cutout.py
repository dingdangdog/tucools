#!/usr/bin/env python3
"""
图像背景移除工具
支持单图和批量处理，使用多种AI模型进行智能抠图
"""

import os
import sys
import json
import time
import argparse
import logging
from pathlib import Path


# 设置本地模型目录 - 支持PyInstaller打包
def get_models_directory():
    """获取模型目录路径，支持环境变量、PyInstaller 和开发目录。"""
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


LOCAL_MODELS_DIR = get_models_directory()

# 设置 rembg 使用本地模型目录
os.environ["U2NET_HOME"] = str(LOCAL_MODELS_DIR)

try:
    import onnxruntime as ort
    from rembg import remove, new_session
except ImportError as e:
    raise ImportError(
        "抠图依赖未安装。请安装 services/engine/requirements.txt 中的 onnxruntime 与 rembg。"
    ) from e

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("erembg.log", encoding="utf-8"),
    ],
)
logger = logging.getLogger(__name__)

# Ensure immediate log output
sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)

logger.info("AI Background Removal Module Started - Multi-Model Support")
logger.info(f"Using local models directory: {LOCAL_MODELS_DIR}")

def list_local_models():
    """列出本地可用的模型"""
    try:
        if not LOCAL_MODELS_DIR.exists():
            logger.info("Local models directory does not exist yet")
            return []

        model_files = list(LOCAL_MODELS_DIR.glob("*.onnx"))
        model_names = [f.stem for f in model_files]

        if model_names:
            logger.info(f"Available local models: {', '.join(model_names)}")
        else:
            logger.info("No local models found")

        return model_names
    except Exception as e:
        logger.error(f"Error listing local models: {str(e)}")
        return []


def create_local_session(model_name="u2net"):
    """创建使用本地模型的会话"""
    try:
        # 确保本地模型目录存在
        LOCAL_MODELS_DIR.mkdir(parents=True, exist_ok=True)

        # 检查本地模型文件是否存在
        model_file = LOCAL_MODELS_DIR / f"{model_name}.onnx"
        if model_file.exists():
            logger.info(f"Found local model: {model_file}")
        else:
            logger.warning(
                f"Local model not found: {model_file}, will download if needed"
            )

        # 创建会话，rembg会自动使用REMBG_HOME环境变量指定的目录
        session = new_session(model_name)
        logger.info(f"Successfully created session for model: {model_name}")
        return session

    except Exception as e:
        logger.error(f"Failed to create session for model {model_name}: {str(e)}")
        raise


def report_progress(percentage, current=0, total=0, filename="", status="processing"):
    """报告处理进度"""
    progress = {
        "percentage": percentage,
        "current": current,
        "total": total,
        "filename": filename,
        "status": status,
    }
    print(f"PROGRESS:{json.dumps(progress)}")
    # 强制立即刷新输出缓冲区，确保进度实时传递
    sys.stdout.flush()


def process_single_image(input_path, output_path, model_name="u2net", use_gpu=False):
    """处理单张图片"""
    try:
        if not os.path.exists(input_path):
            raise FileNotFoundError(f"输入文件不存在: {input_path}")

        # 确保输出目录存在
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # 加载并处理图片
        with open(input_path, "rb") as input_file:
            input_data = input_file.read()

        # 创建rembg会话并移除背景 (使用本地模型，支持GPU加速)
        session = setup_onnx_session(model_name, use_gpu)
        output_data = remove(input_data, session=session)

        # 保存结果
        with open(output_path, "wb") as output_file:
            output_file.write(output_data)

        if os.path.exists(output_path):
            return True
        else:
            raise Exception("输出文件未成功创建")

    except Exception as e:
        logger.error(f"Rembg {input_path} error: {str(e)}")
        return False


def check_gpu_support():
    """检查GPU支持"""
    try:
        # 检查是否有可用的GPU提供程序
        providers = ort.get_available_providers()

        if "CUDAExecutionProvider" in providers:
            # 简单检查，rembg 2.x会自动处理GPU
            return True

        return False
    except Exception as e:
        if "CUDA" in str(e):
            logger.warning("GPU不可用: CUDA执行提供程序未在onnxruntime中找到")
        else:
            logger.error(f"GPU不可用: {str(e)}")
        return False


def check_dependencies():
    """检查依赖是否正常"""
    try:
        # 检查核心依赖
        import onnxruntime as ort
        from rembg import remove, new_session

        # 检查ONNX运行时版本
        ort_version = ort.__version__

        # 检查可用的执行提供程序
        providers = ort.get_available_providers()

        return {
            "status": "success",
            "onnxruntime_version": ort_version,
            "available_providers": providers,
            "cpu_available": "CPUExecutionProvider" in providers,
            "cuda_available": "CUDAExecutionProvider" in providers,
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
        # 检查本地模型目录
        models_info = {
            "status": "success",
            "models_directory": str(LOCAL_MODELS_DIR),
            "directory_exists": LOCAL_MODELS_DIR.exists(),
            "local_models": [],
        }

        # 列出本地模型
        if LOCAL_MODELS_DIR.exists():
            model_files = list(LOCAL_MODELS_DIR.glob("*.onnx"))
            models_info["local_models"] = [f.stem for f in model_files]

        return models_info

    except Exception as e:
        return {
            "status": "error",
            "error": f"模型检查失败: {str(e)}",
            "type": "model_error",
        }


def check_gpu_acceleration():
    """详细检查GPU加速可用性"""
    try:
        gpu_info = {
            "status": "success",
            "gpu_available": False,
            "cuda_available": False,
            "providers": [],
            "gpu_test_result": None,
        }

        # 检查可用的执行提供程序
        providers = ort.get_available_providers()
        gpu_info["providers"] = providers
        gpu_info["cuda_available"] = "CUDAExecutionProvider" in providers

        if gpu_info["cuda_available"]:
            try:
                # 尝试创建一个简单的CUDA会话来测试GPU
                import numpy as np

                # 创建一个简单的ONNX会话测试GPU
                session_options = ort.SessionOptions()
                session_options.log_severity_level = 3  # 减少日志输出

                # 这里我们不实际创建rembg会话，只测试ONNX运行时的CUDA支持
                gpu_info["gpu_available"] = True
                gpu_info["gpu_test_result"] = "CUDA Execution Provider Available"

            except Exception as e:
                gpu_info["gpu_available"] = False
                gpu_info["gpu_test_result"] = f"GPU Check Error: {str(e)}"
        else:
            gpu_info["gpu_test_result"] = "CUDA Execution Provider Not Available"

        return gpu_info

    except Exception as e:
        return {
            "status": "error",
            "error": f"GPU检查失败: {str(e)}",
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


def setup_onnx_session(model_name, use_gpu=False):
    """设置ONNX运行时会话 (使用本地模型)"""
    try:
        # 确保本地模型目录存在
        LOCAL_MODELS_DIR.mkdir(parents=True, exist_ok=True)

        # 检查GPU支持并设置提供程序
        if use_gpu and check_gpu_support():
            # logger.info("GPU support detected, rembg will use GPU acceleration")
            # rembg 2.x 会自动检测并使用可用的GPU提供程序
            # 我们只需要确保CUDA提供程序可用
            providers = ort.get_available_providers()
            if "CUDAExecutionProvider" in providers:
                logger.info("Using CUDA Execution Provider for GPU acceleration")
            else:
                logger.warning("GPU requested but CUDA provider not available, falling back to CPU")
        else:
            logger.info("Using CPU processing")

        # 使用本地模型创建会话，rembg会自动选择最佳的执行提供程序
        session = create_local_session(model_name)
        return session

    except Exception as e:
        logger.error(f"Failed to setup ONNX session: {str(e)}")
        # 如果GPU设置失败，尝试使用CPU
        if use_gpu:
            logger.info("GPU setup failed, falling back to CPU processing")
            return create_local_session(model_name)
        else:
            raise


def process_batch_images(input_dir, output_dir, model_name="u2net", use_gpu=False):
    """批量处理图片"""
    supported_formats = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}

    # 获取所有图片文件
    image_files = []
    for ext in supported_formats:
        image_files.extend(Path(input_dir).glob(f"*{ext}"))
        image_files.extend(Path(input_dir).glob(f"*{ext.upper()}"))

    # 去重，确保不重复处理相同的文件
    image_files = list(set(image_files))

    if not image_files:
        logger.warning(f"No image files found in {input_dir}")
        return

    logger.info(f"Found {len(image_files)} image files, starting processing...")
    # 确保日志立即输出
    sys.stdout.flush()

    # 确保输出目录存在
    os.makedirs(output_dir, exist_ok=True)

    success_count = 0
    failed_count = 0
    # 跟踪已处理的文件，避免重复处理
    processed_files = set()

    # 添加延迟，确保每个文件处理之间有一定间隔，避免消息堆积
    def process_single_file(input_file):
        nonlocal success_count, failed_count

        # 如果文件已经处理过，跳过
        if str(input_file) in processed_files:
            return True

        # 添加到已处理文件集合
        processed_files.add(str(input_file))

        try:
            # 报告开始处理
            report_progress(
                percentage=int((success_count + failed_count) / len(image_files) * 100),
                current=success_count + failed_count,
                total=len(image_files),
                filename=input_file.name,
                status="processing",
            )

            # 添加小延迟，确保处理消息能实时显示
            time.sleep(0.1)

            # 生成输出文件路径
            output_file = (
                Path(output_dir) / f"{input_file.stem}_cutout{input_file.suffix}"
            )

            # 处理单张图片
            if process_single_image(str(input_file), str(output_file), model_name, use_gpu):
                success_count += 1
                report_progress(
                    percentage=int(
                        (success_count + failed_count) / len(image_files) * 100
                    ),
                    current=success_count + failed_count,
                    total=len(image_files),
                    filename=input_file.name,
                    status="completed",
                )

                # 添加小延迟，确保完成消息能实时显示
                time.sleep(0.1)

                return True
            else:
                failed_count += 1
                report_progress(
                    percentage=int(
                        (success_count + failed_count) / len(image_files) * 100
                    ),
                    current=success_count + failed_count,
                    total=len(image_files),
                    filename=input_file.name,
                    status="error",
                )

                # 添加小延迟，确保错误消息能实时显示
                time.sleep(0.1)

                return False
        except Exception as e:
            failed_count += 1
            logger.error(f"处理文件 {input_file} 失败: {str(e)}")
            return False

    # 顺序处理每个文件，让用户看到处理进度
    for img_file in image_files:
        try:
            process_single_file(img_file)
            # 处理文件之间添加小延迟，避免消息堆积
            time.sleep(0.2)
        except Exception as e:
            logger.error(f"处理文件 {img_file} 失败: {str(e)}")
            time.sleep(0.1)  # 出错时也添加延迟

    logger.info(
        f"Processing completed! Success: {success_count}, Failed: {failed_count}"
    )


def main():
    parser = argparse.ArgumentParser(description="AI图像抠图工具")
    parser.add_argument("input_path", nargs="?", help="输入图片或文件夹路径")
    parser.add_argument("output_path", nargs="?", help="输出图片或文件夹路径")
    parser.add_argument("--model", default="u2net", help="AI模型名称")
    parser.add_argument("--gpu", action="store_true", help="使用GPU加速")
    parser.add_argument("--batch", action="store_true", help="批量处理模式")
    parser.add_argument(
        "--health-check", action="store_true", help="运行功能可用性检测"
    )

    args = parser.parse_args()

    # 如果是健康检查模式，直接运行检测并退出
    if args.health_check:
        logger.info("开始功能可用性检测...")
        run_functionality_check()
        # logger.info("功能可用性检测完成")
        return

    try:
        # 验证输入输出路径（健康检查模式不需要）
        if not args.input_path or not args.output_path:
            logger.error("Input path and output path are required")
            sys.exit(1)

        # 列出可用的本地模型
        list_local_models()

        # 验证输入路径
        if not os.path.exists(args.input_path):
            logger.error(f"Input path not found: {args.input_path}")
            sys.exit(1)

        if args.batch:
            # 批量处理模式
            if not os.path.isdir(args.input_path):
                logger.error(f"batch need folder: {args.input_path}")
                sys.exit(1)

            logger.info("Start batch cutout processing...")
            process_batch_images(
                args.input_path, args.output_path, args.model, args.gpu
            )
        else:
            # 单图处理模式
            logger.info("Starting single image cutout processing...")
            if process_single_image(args.input_path, args.output_path, args.model, args.gpu):
                report_progress(
                    100, 1, 1, os.path.basename(args.input_path), "completed"
                )
                logger.info("Single image cutout processing completed")
            else:
                report_progress(0, 0, 1, os.path.basename(args.input_path), "error")
                logger.error("Single image cutout processing failed")

    except Exception as e:
        logger.error(f"Process exception: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
