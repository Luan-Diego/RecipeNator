import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-5 py-24 text-center">
      <img src="/mascot.png" alt="" width={200} height={200} className="h-48 w-48 object-contain" />
      <h1 className="text-5xl tracking-[-0.03em]">Essa página queimou no forno</h1>
      <p className="text-lg text-cacau">Não encontramos o que você procurava. Que tal voltar para a cozinha?</p>
      <Link to="/" className="btn-primary">
        Voltar para a Home
      </Link>
    </section>
  );
}
