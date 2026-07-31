import { createHash } from 'node:crypto';
import { cloudinary, UPLOAD_FOLDER } from '../config/cloudinary.js';

/**
 * Pede ao Cloudinary que busque a imagem de um endereço e a guarde na nossa conta.
 * Roda só no servidor (usa o API Secret, que nunca vai para o navegador).
 * Devolve o endereço final da foto no Cloudinary.
 */
export async function uploadFromUrl(remoteUrl: string, publicId: string): Promise<string> {
  if (!cloudinary) throw new Error('Preencha as três variáveis CLOUDINARY_* no server/.env.');

  const timestamp = String(Math.floor(Date.now() / 1000));
  // Assinatura: parâmetros em ordem alfabética (sem file/api_key) + segredo, em SHA-1
  const toSign = `folder=${UPLOAD_FOLDER}&public_id=${publicId}&timestamp=${timestamp}${cloudinary.apiSecret}`;
  const signature = createHash('sha1').update(toSign).digest('hex');

  const form = new FormData();
  form.set('file', remoteUrl);
  form.set('api_key', cloudinary.apiKey);
  form.set('timestamp', timestamp);
  form.set('folder', UPLOAD_FOLDER);
  form.set('public_id', publicId);
  form.set('signature', signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  });
  const data = (await res.json().catch(() => ({}))) as { secure_url?: string; error?: { message?: string } };
  if (!res.ok || !data.secure_url) {
    throw new Error(`Cloudinary recusou o envio: ${data.error?.message ?? res.status}`);
  }
  return data.secure_url;
}
