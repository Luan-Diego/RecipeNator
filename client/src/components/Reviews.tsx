import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reviewsApi, type Review, type ReviewSummary } from '../services/reviews';
import { fieldClass } from '../pages/Login';
import { StarPicker, Stars } from './Stars';

export default function Reviews({ slug }: { slug: string }) {
  const { user } = useAuth();
  const location = useLocation();
  const [items, setItems] = useState<Review[] | null>(null);
  const [summary, setSummary] = useState<ReviewSummary>({ avg: 0, count: 0 });
  const [loadError, setLoadError] = useState(false);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await reviewsApi.list(slug);
      setItems(data.items);
      setSummary(data.summary);
      setLoadError(false);
      const mine = data.items.find((r) => r.mine);
      if (mine) {
        setRating(mine.rating);
        setComment(mine.comment);
      }
    } catch {
      setLoadError(true);
    }
  }, [slug]);

  // Recarrega ao trocar de receita ou quando o usuário entra/sai (para marcar "a sua" avaliação)
  useEffect(() => {
    setItems(null);
    setRating(0);
    setComment('');
    void load();
  }, [load, user?.id]);

  const mine = items?.find((r) => r.mine);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      setError('Escolha uma nota de 1 a 5 estrelas.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      await reviewsApi.save(slug, rating, comment);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar sua avaliação.');
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    setBusy(true);
    try {
      await reviewsApi.remove(slug);
      setRating(0);
      setComment('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível remover sua avaliação.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-16 border-t border-line pt-12" aria-labelledby="avaliacoes-titulo">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="avaliacoes-titulo" className="text-3xl tracking-[-0.02em]">
          Avaliações e comentários
        </h2>
        {summary.count > 0 && (
          <div className="flex items-center gap-3">
            <Stars value={summary.avg} size={24} />
            <span className="font-semibold">
              {summary.avg.toFixed(1).replace('.', ',')} · {summary.count} {summary.count === 1 ? 'avaliação' : 'avaliações'}
            </span>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-start gap-10">
        <div className="min-w-0 flex-[1_1_340px] rounded-card border border-line bg-paper p-7">
          {user ? (
            <form onSubmit={onSubmit} className="flex flex-col gap-5">
              <StarPicker value={rating} onChange={setRating} />
              <label className="flex flex-col gap-1.5 font-semibold">
                Comentário (opcional)
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className={`${fieldClass} font-normal`}
                  placeholder="Como ficou? Alguma dica ou adaptação?"
                />
              </label>
              <p role="alert" className={error ? 'rounded-xl bg-[#FBE3DD] px-4 py-3 text-chili' : 'sr-only'}>
                {error}
              </p>
              <div className="flex flex-wrap gap-3">
                <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
                  {mine ? 'Atualizar avaliação' : 'Publicar avaliação'}
                </button>
                {mine && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void onDelete()}
                    className="btn border-[1.5px] border-espresso disabled:opacity-60"
                  >
                    Remover
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-start gap-4">
              <p className="text-lg text-cacau">Entre para avaliar esta receita e deixar um comentário.</p>
              <Link to="/login" state={{ from: location.pathname }} className="btn-dark">
                Entrar
              </Link>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-[2_1_480px]" aria-live="polite">
          {loadError && <p className="rounded-card bg-sand p-6 text-roast">Não consegui carregar as avaliações.</p>}
          {!loadError && items === null && <p className="text-cacau">Carregando avaliações…</p>}
          {items && items.length === 0 && <p className="text-lg text-cacau">Ainda não há avaliações. Seja a primeira pessoa a avaliar!</p>}
          {items && items.length > 0 && (
            <ul className="flex flex-col gap-4">
              {items.map((r) => (
                <li key={r.id} className="rounded-card border border-line bg-paper p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold">
                      {r.user.name}
                      {r.mine && <span className="ml-2 rounded-full bg-saffron px-2.5 py-0.5 text-xs font-bold">Você</span>}
                    </span>
                    <span className="text-sm text-cacau">{new Date(r.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="mt-1.5">
                    <Stars value={r.rating} size={18} />
                  </div>
                  {r.comment && <p className="mt-3 whitespace-pre-line">{r.comment}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
