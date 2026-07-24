export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function uploadsEnabled(): Promise<boolean> {
  try {
    const res = await fetch('/api/uploads/status');
    if (!res.ok) return false;
    return Boolean(((await res.json()) as { enabled?: boolean }).enabled);
  } catch {
    return false;
  }
}

type Signature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  allowedFormats: string;
  signature: string;
};

/** Envia a foto direto ao Cloudinary (com assinatura do nosso servidor) e devolve a URL segura. */
export async function uploadPhoto(file: File): Promise<string> {
  if (!PHOTO_TYPES.includes(file.type)) throw new Error('Use uma foto JPG, PNG ou WebP.');
  if (file.size > MAX_PHOTO_BYTES) throw new Error('A foto pode ter no máximo 5 MB.');

  const sigRes = await fetch('/api/uploads/signature');
  if (!sigRes.ok) {
    const data = (await sigRes.json().catch(() => ({}))) as { message?: string };
    throw new Error(data.message ?? 'Não foi possível preparar o envio da foto.');
  }
  const s = (await sigRes.json()) as Signature;

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', s.apiKey);
  form.append('timestamp', String(s.timestamp));
  form.append('folder', s.folder);
  form.append('allowed_formats', s.allowedFormats);
  form.append('signature', s.signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${s.cloudName}/image/upload`, { method: 'POST', body: form });
  const data = (await res.json().catch(() => ({}))) as { secure_url?: string; error?: { message?: string } };
  if (!res.ok || !data.secure_url) throw new Error(data.error?.message ?? 'Não foi possível enviar a foto.');
  return data.secure_url;
}
