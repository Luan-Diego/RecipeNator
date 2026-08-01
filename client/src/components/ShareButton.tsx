import { useEffect, useRef, useState } from 'react';

type Props = { title: string };

/** Botão "Compartilhar": copiar link, WhatsApp, menu de compartilhamento do aparelho e impressão. */
export default function ShareButton({ title }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const url = window.location.href;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copie o link da receita:', url);
    }
  }

  const item = 'block w-full rounded-xl px-3 py-2.5 text-left font-medium hover:bg-sand';

  return (
    <div ref={box} className="relative print:hidden">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-fit items-center gap-2 rounded-full border-[1.5px] border-espresso px-5 py-2.5 font-semibold"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2A1710" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4" />
        </svg>
        Compartilhar
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-[min(260px,86vw)] rounded-card border border-line bg-paper p-2 shadow-lg">
          <button type="button" onClick={() => void copy()} className={item}>
            {copied ? 'Link copiado!' : 'Copiar link'}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
            target="_blank"
            rel="noreferrer"
            className={item}
          >
            Enviar por WhatsApp
          </a>
          {canNativeShare && (
            <button
              type="button"
              onClick={() => void navigator.share({ title, url }).catch(() => undefined)}
              className={item}
            >
              Outros aplicativos…
            </button>
          )}
          <button type="button" onClick={() => window.print()} className={item}>
            Imprimir receita
          </button>
        </div>
      )}
    </div>
  );
}
