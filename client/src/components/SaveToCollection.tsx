import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collectionsApi, type CollectionSummary } from '../services/collections';
import { fieldClass } from '../pages/Login';

/** Botão "Salvar em coleção": abre uma lista com as coleções do usuário e permite criar uma nova. */
export default function SaveToCollection({ recipeId }: { recipeId: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CollectionSummary[] | null>(null);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setError('');
    collectionsApi
      .list()
      .then((r) => !cancelled && setItems(r))
      .catch(() => !cancelled && setError('Não consegui carregar suas coleções.'));
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      cancelled = true;
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  function toggleOpen() {
    if (!user) {
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }
    setOpen((o) => !o);
  }

  async function toggleIn(c: CollectionSummary) {
    const has = c.recipeIds.includes(recipeId);
    setError('');
    try {
      if (has) await collectionsApi.removeRecipe(c.id, recipeId);
      else await collectionsApi.addRecipe(c.id, recipeId);
      setItems((prev) =>
        prev
          ? prev.map((x) =>
              x.id === c.id
                ? {
                    ...x,
                    recipeIds: has ? x.recipeIds.filter((id) => id !== recipeId) : [...x.recipeIds, recipeId],
                    count: x.count + (has ? -1 : 1),
                  }
                : x,
            )
          : prev,
      );
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function createAndSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError('');
    try {
      const created = await collectionsApi.create(name.trim());
      await collectionsApi.addRecipe(created.id, recipeId);
      setItems((prev) => [{ ...created, recipeIds: [recipeId], count: 1 }, ...(prev ?? [])]);
      setName('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={toggleOpen}
        className="flex w-fit items-center gap-2 rounded-full border-[1.5px] border-espresso px-5 py-2.5 font-semibold"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2A1710" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5V20l-8-4-8 4z" />
        </svg>
        Salvar em coleção
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-[min(340px,86vw)] rounded-card border border-line bg-paper p-5 shadow-lg">
          <p className="font-display text-xl font-semibold">Suas coleções</p>

          {items === null && !error && <p className="mt-3 text-cacau">Carregando…</p>}
          {items !== null && items.length === 0 && (
            <p className="mt-3 text-cacau">Você ainda não criou nenhuma. Crie a primeira abaixo.</p>
          )}
          {items !== null && items.length > 0 && (
            <ul className="mt-3 max-h-56 divide-y divide-line overflow-auto">
              {items.map((c) => (
                <li key={c.id}>
                  <label className="flex cursor-pointer items-center gap-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={c.recipeIds.includes(recipeId)}
                      onChange={() => void toggleIn(c)}
                      className="h-5 w-5 accent-tomato"
                    />
                    <span className="min-w-0 flex-1 truncate">{c.name}</span>
                    <span className="text-sm text-cacau">{c.count}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={createAndSave} className="mt-4 flex gap-2">
            <label htmlFor="nova-colecao" className="sr-only">
              Nome da nova coleção
            </label>
            <input
              id="nova-colecao"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              placeholder="Nova coleção…"
              className={`${fieldClass} min-w-0 flex-1 !py-2`}
            />
            <button type="submit" disabled={busy || !name.trim()} className="btn-dark disabled:opacity-40">
              Criar
            </button>
          </form>

          {error && (
            <p role="alert" className="mt-3 text-sm text-chili">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
