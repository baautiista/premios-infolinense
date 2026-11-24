export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export async function api<T = Record<string, unknown>>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api/admin${path}`, {
    method,
    credentials: "same-origin",
    headers: {
      "X-Premios-Admin": "1",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; message?: string };
  if (!res.ok || data.ok === false) throw new ApiError(res.status, data.error ?? "error", data.message ?? `Error ${res.status}`);
  return data as T;
}

export async function uploadImage(blob: Blob, kind: string): Promise<string> {
  const res = await fetch(`/api/admin/media?kind=${kind}`, {
    method: "POST",
    credentials: "same-origin",
    headers: { "X-Premios-Admin": "1", "Content-Type": blob.type },
    body: blob,
  });
  const data = (await res.json()) as { ok: boolean; url?: string; message?: string };
  if (!res.ok || !data.url) throw new Error(data.message ?? "No se pudo subir la imagen");
  return data.url;
}

/** Recorta una imagen centrada en un punto focal y la exporta en WebP (o JPEG si el navegador no admite WebP). */
export async function cropTo(img: HTMLImageElement, focus: { x: number; y: number }, width: number, height: number): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas no disponible");
  ctx.imageSmoothingQuality = "high";
  const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
  const sw = width / scale;
  const sh = height / scale;
  const sx = Math.min(Math.max(focus.x * img.naturalWidth - sw / 2, 0), img.naturalWidth - sw);
  const sy = Math.min(Math.max(focus.y * img.naturalHeight - sh / 2, 0), img.naturalHeight - sh);
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.86));
  if (blob && blob.type === "image/webp") return blob;
  const jpeg = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.88));
  if (!jpeg) throw new Error("No se pudo generar la imagen");
  return jpeg;
}
