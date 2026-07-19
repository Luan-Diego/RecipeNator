const STAR = 'M12 2l3 6.5 7 .9-5.2 4.8 1.4 7L12 17.8 5.8 21.2l1.4-7L2 9.4l7-.9z';

/** Estrelas somente de leitura (aceita notas quebradas, como 4,3, arredondando para a estrela mais próxima). */
export function Stars({ value, size = 20 }: { value: number; size?: number }) {
  const filled = Math.round(value);
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`Nota ${value.toFixed(1).replace('.', ',')} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
          <path d={STAR} fill={n <= filled ? '#E0702B' : 'none'} stroke="#E0702B" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      ))}
    </span>
  );
}

/** Escolha de nota de 1 a 5 com botões de rádio (funciona com teclado e leitor de tela). */
export function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1 font-semibold">Sua nota</legend>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <label
            key={n}
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full focus-within:ring-2 focus-within:ring-tomato"
          >
            <input
              type="radio"
              name="rating"
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              className="sr-only"
            />
            <span className="sr-only">{n} {n === 1 ? 'estrela' : 'estrelas'}</span>
            <svg width="32" height="32" viewBox="0 0 24 24" aria-hidden="true">
              <path d={STAR} fill={n <= value ? '#E0702B' : 'none'} stroke="#E0702B" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
