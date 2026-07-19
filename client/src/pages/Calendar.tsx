import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventParts, foodEvents, monthName, parseDate, recipesLink, toIso, upcomingEvents, type FoodEvent } from '../data/events';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const container = 'mx-auto max-w-7xl px-5 sm:px-10';

export default function Calendar() {
  const today = useMemo(() => new Date(), []);
  const todayIso = toIso(today);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<number | null>(null);

  const monthEvents = useMemo(
    () =>
      foodEvents.filter((e) => {
        const d = parseDate(e.date);
        return d.year === year && d.month === month;
      }),
    [year, month],
  );
  const eventsByDay = useMemo(() => {
    const map = new Map<number, FoodEvent[]>();
    monthEvents.forEach((e) => {
      const day = parseDate(e.date).day;
      map.set(day, [...(map.get(day) ?? []), e]);
    });
    return map;
  }, [monthEvents]);

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function go(delta: number) {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
    setSelected(null);
  }

  const next = upcomingEvents(1, today)[0];
  const shown = selected ? (eventsByDay.get(selected) ?? []) : monthEvents;

  return (
    <section className={`${container} py-14`}>
      <div className="eyebrow">Calendário gastronômico</div>
      <h1 className="mt-1.5 text-5xl leading-[1.05] tracking-[-0.03em] sm:text-6xl">Cada data tem um prato para contar</h1>

      <div className="mt-10 flex flex-wrap items-start gap-10">
        {/* GRADE DO MÊS */}
        <div className="min-w-0 flex-[1_1_420px] max-w-xl rounded-card border border-line bg-paper p-6">
          <div className="flex items-center justify-between gap-3">
            <button type="button" aria-label="Mês anterior" onClick={() => go(-1)} className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-espresso text-xl">
              ‹
            </button>
            <h2 className="text-center text-2xl tracking-[-0.02em]" aria-live="polite">
              {monthName(month)} de {year}
            </h2>
            <button type="button" aria-label="Próximo mês" onClick={() => go(1)} className="flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-espresso text-xl">
              ›
            </button>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-1.5 text-center text-[13px] font-bold uppercase tracking-[0.08em] text-cacau">
            {WEEKDAYS.map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1.5">
            {cells.map((day, i) => {
              if (day === null) return <div key={`e${i}`} />;
              const hasEvent = eventsByDay.has(day);
              const isToday = toIso(new Date(year, month, day)) === todayIso;
              const base = 'flex aspect-square min-h-11 items-center justify-center rounded-full text-[15px] font-semibold';
              const ring = isToday ? 'ring-2 ring-tomato ring-offset-2 ring-offset-paper' : '';
              if (!hasEvent) {
                return (
                  <div key={day} className={`${base} ${ring} text-cacau`}>
                    {day}
                  </div>
                );
              }
              const active = selected === day;
              return (
                <button
                  key={day}
                  type="button"
                  aria-pressed={active}
                  aria-label={`Dia ${day}: ${(eventsByDay.get(day) ?? []).map((e) => e.title).join(', ')}`}
                  onClick={() => setSelected(active ? null : day)}
                  className={`${base} ${ring} ${active ? 'bg-espresso text-cream' : 'bg-saffron text-espresso'}`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-cacau">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-saffron" /> Data com receitas
            </span>
            <button
              type="button"
              onClick={() => {
                setYear(today.getFullYear());
                setMonth(today.getMonth());
                setSelected(null);
              }}
              className="ml-auto font-semibold text-tomato underline"
            >
              Ir para hoje
            </button>
          </div>
        </div>

        {/* DATAS DO MÊS */}
        <div className="min-w-0 flex-[1_1_380px] flex flex-col gap-5" aria-live="polite">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-3xl tracking-[-0.02em]">
              {selected ? `Dia ${selected} de ${monthName(month).toLowerCase()}` : `Datas de ${monthName(month).toLowerCase()}`}
            </h2>
            {selected && (
              <button type="button" onClick={() => setSelected(null)} className="font-semibold text-tomato underline">
                Ver o mês todo
              </button>
            )}
          </div>

          {shown.length === 0 && (
            <div className="flex flex-col items-start gap-4 rounded-card bg-sand p-7">
              <p className="text-lg text-roast">Nenhuma data cadastrada neste mês.</p>
              {next && (
                <button
                  type="button"
                  onClick={() => {
                    const d = parseDate(next.date);
                    setYear(d.year);
                    setMonth(d.month);
                    setSelected(null);
                  }}
                  className="btn-dark"
                >
                  Ir para a próxima data: {next.title}
                </button>
              )}
            </div>
          )}

          {shown.map((e) => {
            const { day, monthShort } = eventParts(e);
            const past = e.date < todayIso;
            return (
              <article key={e.id} className={`flex flex-wrap gap-5 rounded-card border p-6 ${past ? 'border-line bg-paper' : 'border-roast bg-espresso text-cream'}`}>
                <div className="flex w-20 shrink-0 flex-col items-center">
                  <span className={`font-display text-[52px] font-semibold leading-none tracking-[-0.04em] ${past ? 'text-caramel' : 'text-saffron'}`}>{day}</span>
                  <span className={`text-sm font-bold uppercase tracking-[0.14em] ${past ? 'text-cacau' : 'text-[#E9C9A5]'}`}>{monthShort}</span>
                </div>
                <div className="flex min-w-0 flex-[1_1_220px] flex-col gap-2">
                  {past && <span className="w-fit rounded-full bg-sand px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-roast">Já passou</span>}
                  <h3 className="text-2xl tracking-[-0.02em]">{e.title}</h3>
                  <div className={`text-sm font-semibold uppercase tracking-[0.08em] ${past ? 'text-caramel' : 'text-[#E9C9A5]'}`}>{e.origin}</div>
                  <p className={past ? 'text-cacau' : 'text-[#E9C9A5]'}>{e.text}</p>
                  {e.note && <p className={`text-sm ${past ? 'text-cacau' : 'text-[#E9C9A5]'}`}>{e.note}</p>}
                  <Link to={recipesLink(e.filter)} className={`mt-1 w-fit font-semibold ${past ? 'text-tomato' : 'text-saffron'}`}>
                    Ver receitas da data →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
