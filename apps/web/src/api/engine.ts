export interface EngineToolStatus {
  ready: boolean;
  missing: string[];
  available: string[];
}

export interface EngineHealth {
  ok: boolean;
  device: string;
  cuda: boolean;
  modelPack?: string;
  modelsDir?: string;
  upscayl?: string;
  cutout: EngineToolStatus;
  enhance: EngineToolStatus;
  erase: EngineToolStatus;
}

export interface EngineEvent {
  status: string;
  percentage: number;
  message: string;
  error?: string;
}

function errorMessage(data: { detail?: string; error?: string }, fallback: string) {
  if (typeof data.detail === "string") return data.detail;
  if (typeof data.error === "string") return data.error;
  return fallback;
}

export async function engineHealth(): Promise<EngineHealth> {
  const response = await fetch("/api/engine/health");
  if (!response.ok) throw new Error("引擎没有响应");
  return response.json();
}

export async function runEngineJob(
  path: string,
  body: FormData,
  onProgress: (event: EngineEvent) => void
) {
  const response = await fetch(path, { method: "POST", body });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(errorMessage(data, "处理失败"));
  const id = String(data.id);

  await new Promise<void>((resolve, reject) => {
    const source = new EventSource(`/api/engine/jobs/${id}/events`);
    source.onmessage = (event) => {
      const payload = JSON.parse(event.data) as EngineEvent;
      onProgress(payload);
      if (payload.status === "completed") {
        source.close();
        resolve();
      } else if (payload.status === "failed") {
        source.close();
        reject(new Error(payload.error || "处理失败"));
      }
    };
    source.onerror = () => {
      source.close();
      reject(new Error("与引擎的连接中断"));
    };
  });

  const file = await fetch(`/api/engine/jobs/${id}/result`);
  if (!file.ok) {
    const err = await file.json().catch(() => ({}));
    throw new Error(errorMessage(err, "下载结果失败"));
  }
  return file.blob();
}
