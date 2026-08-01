import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collectionsApi, type CollectionSummary } from '../services/collections';
import { optimizeImage } from '../utils/image';
import { fieldClass } from './Login';

const tints = ['#F8DFB4', '#F3C9B8', '#F6D3C4', '#F2D9B6'];

export default function Collections() {
  const [items, setItems] = useState<CollectionSummary[] | null>(null);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    collectionsApi
      .list()
      .then((r) => !cancelled && setItems(r))
      .catch(() => !cancelled && setError('Não consegui carregar suas coleções.'));
    return () => {
      cancelled = true;
    };
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError('');
    try {
      const created = await collectionsApi.create(name.trim());
      setItems((prev) => [created, ...(prev ?? [])]);
      setName('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-10">
      <div className="eyebrow">Sua cozinha</div>
      <h1 className="mt-1.5 text-5xl leading-[1.05] tracking-[-0.03em] sm:text-6xl">Coleções</h1>
      <p className="mt-3 max-w-xl text-lg text-cacau">
        Agrupe receitas do seu jeito: jantares de semana, doces de festa, o que testar no fim de semana.
      </p>

      <form onSubmit={create} className="mt-8 flex max-w-xl flex-wrap gap-3">
        <label htmlFor="nome-colecao" className="sr-only">
          Nome da coleção
        </label>
        <input
          id="nome-colecao"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          placeholder="Nome da nova coleção"
          className={`${fieldClass} min-w-0 flex-[1_1_240px]`}
        />
        <button type="submit" disabled={busy || !name.trim()} className="btn-primary disabled:opacity-40">
          Criar coleção
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-3 text-chili">
          {error}
        </p>
      )}

      <div className="mt-10" aria-live="polite">
        {items === null && !error && <p className="text-lg text-cacau">Carregando…</p>}
        {items !== null && items.length === 0 && (
          <div className="rounded-card bg-sand p-8 text-lg text-roast">
            Você ainda não tem coleções. Crie uma acima e depois use o botão <strong>Salvar em coleção</strong> na página
            de qualquer receita.
          </div>
        )}
        {items !== null && items.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
            {items.map((c) => (
              <Link key={c.id} to={`/collections/${c.id}`} className="overflow-hidden rounded-card border border-line bg-paper">
                <div className="grid aspect-[16/9] grid-cols-3 gap-0.5 bg-line">
                  {[0, 1, 2].map((i) => {
                    const cover = c.covers[i];
                    return cover ? (
                      <img key={i} src={optimizeImage(cover)} alt="" loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <div key={i} style={{ backgroundColor: tints[(i + c.name.length) % tints.length] }} />
                    );
                  })}
                </div>
                <div className="p-5">
                  <h2 className="text-2xl leading-tight">{c.name}</h2>
                  <p className="mt-1 text-cacau">
                    {c.count} {c.count === 1 ? 'receita' : 'receitas'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
