import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const fieldClass =
  'w-full rounded-2xl border-[1.5px] border-[#C9AE8E] bg-white px-4 py-3 text-lg outline-none focus:border-tomato';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from} replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto flex max-w-md flex-col gap-6 px-5 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <img src="/mascot.png" alt="" width={112} height={112} className="h-28 w-28 object-contain" />
        <h1 className="text-4xl tracking-[-0.03em]">Entrar</h1>
        <p className="text-cacau">Bem-vindo de volta à cozinha.</p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-card border border-line bg-paper p-7">
        <label className="flex flex-col gap-1.5 font-semibold">
          E-mail
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${fieldClass} font-normal`}
          />
        </label>
        <label className="flex flex-col gap-1.5 font-semibold">
          Senha
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${fieldClass} font-normal`}
          />
        </label>
        <p role="alert" className={error ? 'rounded-xl bg-[#FBE3DD] px-4 py-3 text-chili' : 'sr-only'}>
          {error}
        </p>
        <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="text-center text-cacau">
        Ainda não tem conta?{' '}
        <Link to="/register" state={{ from }} className="font-semibold text-tomato underline">
          Criar conta
        </Link>
      </p>
    </section>
  );
}
