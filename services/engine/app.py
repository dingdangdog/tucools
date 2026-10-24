"""图酷图像引擎。页面只通过同源 /api/engine 访问。"""

from __future__ import annotations

import os
import shutil
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, StreamingResponse

from jobs import Job, jobs
from runtime_info import ENHANCE_MODELS, bind_pack_env, device_label, missing, models_dir, pack_root, tool_status

bind_pack_env()

MAX_BYTES = 50 * 1024 * 1024
ALLOWED_TYPES = {
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/bmp",
    "image/gif",
}
CUTOUT_MODELS = {
    "u2net",
    "u2netp",
    "u2net_human_seg",
    "isnet-general-use",
    "isnet-anime",
}

app = FastAPI(title="图酷图像引擎", docs_url=None, redoc_url=None)
ROOT = Path(os.environ.get("TUCOOLS_TMP", Path(__file__).resolve().parent / "tmp"))
ROOT.mkdir(parents=True, exist_ok=True)


def _suffix(upload: UploadFile) -> str:
    name = upload.filename or "image.png"
    suffix = Path(name).suffix.lower()
    if suffix in {".png", ".jpg", ".jpeg", ".webp", ".bmp", ".gif"}:
        return suffix
    return ".png"


async def _save_upload(upload: UploadFile, dest: Path) -> None:
    size = 0
    with dest.open("wb") as handle:
        while True:
            chunk = await upload.read(1024 * 1024)
            if not chunk:
                break
            size += len(chunk)
            if size > MAX_BYTES:
                raise HTTPException(status_code=400, detail="图片超过 50MB。")
            handle.write(chunk)
    content_type = (upload.content_type or "").split(";")[0].lower()
    if content_type and content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"不支持的图片类型：{content_type}")


def _run_cutout(job: Job, model: str, use_gpu: bool) -> None:
    os.environ["U2NET_HOME"] = str(models_dir())
    os.environ.setdefault("TUCOOLS_MODELS", str(models_dir()))
    from vendor.cutout import process_single_image

    source = next(job.workdir.glob("input*"))
    target = job.workdir / "result.png"
    jobs.publish(job, status="running", percentage=15, message="正在抠图")
    ok = process_single_image(str(source), str(target), model, use_gpu)
    if not ok or not target.is_file():
        raise RuntimeError("抠图没有生成结果。请确认模型文件完整，并查看引擎日志。")
    job.result_path = target


def _run_enhance(job: Job, model: str, scale: int, use_gpu: bool) -> None:
    from vendor.enhance import process_image

    source = next(job.workdir.glob("input*"))
    target = job.workdir / "result.png"
    jobs.publish(job, status="running", percentage=15, message="正在优化")
    ok = process_image(str(source), str(target), model, scale, use_gpu)
    if not ok or not target.is_file():
        raise RuntimeError("优化没有生成结果。请确认 upscayl-bin 与对应模型可用。")
    job.result_path = target


def _run_erase(job: Job, device: str) -> None:
    from vendor.erase import ImageEraser

    source = next(job.workdir.glob("input*"))
    mask = job.workdir / "mask.png"
    target = job.workdir / "result.png"
    jobs.publish(job, status="running", percentage=15, message="正在消除")
    eraser = ImageEraser(device)
    eraser.process_single(str(source), str(mask), str(target), "common_removal", "lama")
    if not target.is_file():
        raise RuntimeError("消除没有生成结果。")
    job.result_path = target


def _worker(job: Job, fn) -> None:
    try:
        fn()
        jobs.publish(job, status="completed", percentage=100, message="处理完成", error="")
    except Exception as exc:
        jobs.publish(job, status="failed", percentage=100, message="处理失败", error=str(exc))
    finally:
        jobs.finish_slot()


def _schedule(job: Job, fn) -> dict:
    import threading

    threading.Thread(target=_worker, args=(job, fn), daemon=True).start()
    return job.snapshot()


@app.get("/api/engine/health")
def health():
    info = tool_status()
    info.update(device_label())
    info["ok"] = True
    return info


@app.post("/api/engine/cutout")
async def cutout(
    image: UploadFile = File(...),
    model: str = Form("u2net"),
    gpu: bool = Form(False),
):
    if model not in CUTOUT_MODELS:
        raise HTTPException(status_code=400, detail="未知的抠图模型。")
    absent = missing([f"{model}.onnx"])
    if absent:
        raise HTTPException(
            status_code=400,
            detail=f"缺少模型文件 {absent[0]}。模型包单独下载，请解压到 {pack_root()}。",
        )
    workdir = ROOT / "pending"
    workdir.mkdir(parents=True, exist_ok=True)
    job = jobs.try_start("cutout", workdir)
    if job is None:
        raise HTTPException(status_code=409, detail="引擎正在处理另一张图片，请等当前任务结束后再试。")
    job.workdir = ROOT / job.id
    job.workdir.mkdir(parents=True, exist_ok=True)
    try:
        await _save_upload(image, job.workdir / f"input{_suffix(image)}")
    except Exception:
        jobs.finish_slot()
        shutil.rmtree(job.workdir, ignore_errors=True)
        raise
    return _schedule(job, lambda: _run_cutout(job, model, gpu))


@app.post("/api/engine/enhance")
async def enhance(
    image: UploadFile = File(...),
    model: str = Form("balanced"),
    scale: int = Form(2),
    gpu: bool = Form(False),
):
    if model not in ENHANCE_MODELS:
        raise HTTPException(status_code=400, detail="未知的优化效果。")
    if scale < 1 or scale > 4:
        raise HTTPException(status_code=400, detail="放大倍率需要在 1 到 4 之间。")
    absent = missing(list(ENHANCE_MODELS[model]))
    from runtime_info import upscayl_path

    binary = upscayl_path()
    if not binary.is_file():
        absent.append(str(binary))
    if absent:
        raise HTTPException(
            status_code=400,
            detail=f"优化还不能运行，缺少：{'、'.join(absent)}。模型包单独下载，请解压到 {pack_root()}。",
        )
    job = jobs.try_start("enhance", ROOT)
    if job is None:
        raise HTTPException(status_code=409, detail="引擎正在处理另一张图片，请等当前任务结束后再试。")
    job.workdir = ROOT / job.id
    job.workdir.mkdir(parents=True, exist_ok=True)
    try:
        await _save_upload(image, job.workdir / f"input{_suffix(image)}")
    except Exception:
        jobs.finish_slot()
        shutil.rmtree(job.workdir, ignore_errors=True)
        raise
    return _schedule(job, lambda: _run_enhance(job, model, scale, gpu))


@app.post("/api/engine/erase")
async def erase(
    image: UploadFile = File(...),
    mask: UploadFile = File(...),
    device: str = Form("cpu"),
):
    if device not in {"cpu", "cuda", "auto"}:
        raise HTTPException(status_code=400, detail="设备只能是 cpu、cuda 或 auto。")
    absent = missing(["big-lama.pt"])
    if absent:
        raise HTTPException(
            status_code=400,
            detail=f"缺少模型文件 big-lama.pt。模型包单独下载，请解压到 {pack_root()}。",
        )
    job = jobs.try_start("erase", ROOT)
    if job is None:
        raise HTTPException(status_code=409, detail="引擎正在处理另一张图片，请等当前任务结束后再试。")
    job.workdir = ROOT / job.id
    job.workdir.mkdir(parents=True, exist_ok=True)
    try:
        await _save_upload(image, job.workdir / f"input{_suffix(image)}")
        await _save_upload(mask, job.workdir / "mask.png")
    except Exception:
        jobs.finish_slot()
        shutil.rmtree(job.workdir, ignore_errors=True)
        raise
    return _schedule(job, lambda: _run_erase(job, device))


@app.get("/api/engine/jobs/{job_id}/events")
async def events(job_id: str):
    job = jobs.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="任务不存在或已过期。")

    async def stream():
        queue = jobs.subscribe(job)
        while True:
            payload = await queue.get()
            yield f"data: {__import__('json').dumps(payload, ensure_ascii=False)}\n\n"
            if payload.get("status") in {"completed", "failed"}:
                break

    return StreamingResponse(stream(), media_type="text/event-stream")


@app.get("/api/engine/jobs/{job_id}/result")
def result(job_id: str):
    job = jobs.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="任务不存在或已过期。")
    if job.status == "failed":
        raise HTTPException(status_code=400, detail=job.error or "处理失败。")
    if job.status != "completed" or job.result_path is None or not job.result_path.is_file():
        raise HTTPException(status_code=409, detail="结果还没准备好。")
    return FileResponse(job.result_path, media_type="image/png", filename=f"{job.kind}.png")
