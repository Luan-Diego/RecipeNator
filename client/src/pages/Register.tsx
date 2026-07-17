import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fieldClass } from './Login';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={from} replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('As senhas não são iguais.');
      return;
    }
    setBusy(true);
    try {
      await register(name, email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a conta.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto flex max-w-md flex-col gap-6 px-5 py-16">
      <div className="flex flex-col items-center gap-2 text-center">
        <img src="/mascot.png" alt="" width={112} height={112} className="h-28 w-28 object-contain" />
        <h1 className="text-4xl tracking-[-0.03em]">Criar conta</h1>
        <p className="text-cacau">Publique receitas, salve favoritas e planeje a semana.</p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-card border border-line bg-paper p-7">
        <label className="flex flex-col gap-1.5 font-semibold">
          Nome
          <input
            type="text"
            required
            minLength={2}
            maxLength={60}
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${fieldClass} font-normal`}
          />
        </label>
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
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${fieldClass} font-normal`}
          />
          <span className="text-sm font-normal text-cacau">Pelo menos 8 caracteres.</span>
        </label>
        <label className="flex flex-col gap-1.5 font-semibold">
          Repita a senha
          <input
            type="password"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={`${fieldClass} font-normal`}
          />
        </label>
        <p role="alert" className={error ? 'rounded-xl bg-[#FBE3DD] px-4 py-3 text-chili' : 'sr-only'}>
          {error}
        </p>
        <button type="submit" disabled={busy} className="btn-primary disabled:opacity-60">
          {busy ? 'Criando conta…' : 'Criar conta'}
        </button>
        <p className="text-sm text-cacau">
          O RecipeNator é um projeto de portfólio: contas e conteúdos podem ser apagados diariamente.
        </p>
      </form>

      <p className="text-center text-cacau">
        Já tem conta?{' '}
        <Link to="/login" state={{ from }} className="font-semibold text-tomato underline">
          Entrar
        </Link>
      </p>
    </section>
  );
}
