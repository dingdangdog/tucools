"""单任务队列。推理在线程里跑，进度通过 SSE 送出。"""

from __future__ import annotations

import asyncio
import shutil
import threading
import time
import uuid
from dataclasses import dataclass, field
from pathlib import Path

JOB_TTL_SECONDS = 30 * 60


@dataclass
class Job:
    id: str
    kind: str
    workdir: Path
    status: str = "queued"
    percentage: int = 0
    message: str = "已排队"
    error: str = ""
    result_path: Path | None = None
    created_at: float = field(default_factory=time.time)
    events: list[dict] = field(default_factory=list)
    waiters: list[asyncio.Queue] = field(default_factory=list)
    loop: asyncio.AbstractEventLoop | None = None

    def snapshot(self) -> dict:
        return {
            "id": self.id,
            "kind": self.kind,
            "status": self.status,
            "percentage": self.percentage,
            "message": self.message,
            "error": self.error,
        }


class JobManager:
    def __init__(self) -> None:
        self._jobs: dict[str, Job] = {}
        self._lock = threading.Lock()
        self._busy = False

    def cleanup(self) -> None:
        now = time.time()
        expired = [
            job
            for job in self._jobs.values()
            if now - job.created_at > JOB_TTL_SECONDS and job.status in {"completed", "failed"}
        ]
        for job in expired:
            self._jobs.pop(job.id, None)
            shutil.rmtree(job.workdir, ignore_errors=True)

    def get(self, job_id: str) -> Job | None:
        return self._jobs.get(job_id)

    def try_start(self, kind: str, workdir: Path) -> Job | None:
        self.cleanup()
        with self._lock:
            if self._busy:
                return None
            self._busy = True
            job = Job(id=uuid.uuid4().hex, kind=kind, workdir=workdir)
            job.loop = asyncio.get_running_loop()
            self._jobs[job.id] = job
            self._publish(job, job.snapshot())
            return job

    def finish_slot(self) -> None:
        with self._lock:
            self._busy = False

    def publish(self, job: Job, **fields: object) -> None:
        for key, value in fields.items():
            setattr(job, key, value)
        self._publish(job, job.snapshot())

    def _publish(self, job: Job, payload: dict) -> None:
        job.events.append(payload)
        loop = job.loop
        if loop is None:
            return
        for queue in list(job.waiters):
            loop.call_soon_threadsafe(queue.put_nowait, payload)

    def subscribe(self, job: Job) -> asyncio.Queue:
        queue: asyncio.Queue = asyncio.Queue()
        for event in job.events:
            queue.put_nowait(event)
        job.waiters.append(queue)
        return queue


jobs = JobManager()
