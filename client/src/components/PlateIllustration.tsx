export type PlateVariant = 'mix' | 'bowl' | 'pizza';

type Props = {
  variant: PlateVariant;
  c1: string;
  c2: string;
  c3: string;
};

/** Prato visto de cima, em formas chapadas. Fica no lugar da foto até a receita ter uma. */
export default function PlateIllustration({ variant, c1, c2, c3 }: Props) {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      <circle cx="100" cy="100" r="96" fill="#FFFAF3" stroke="#E9D5B8" strokeWidth="2" />
      <circle cx="100" cy="100" r="76" fill="#F6E9D6" />
      {variant === 'mix' && (
        <g>
          <ellipse cx="102" cy="104" rx="46" ry="40" fill={c1} />
          <ellipse cx="86" cy="92" rx="24" ry="15" fill={c2} transform="rotate(-24 86 92)" />
          <circle cx="128" cy="84" r="8" fill={c3} />
          <circle cx="70" cy="128" r="7" fill={c3} />
          <circle cx="130" cy="130" r="6" fill={c3} />
        </g>
      )}
      {variant === 'bowl' && (
        <g>
          <circle cx="100" cy="100" r="66" fill={c1} />
          <circle cx="100" cy="100" r="54" fill={c2} />
          <path d="M60 104C75 80 100 128 140 96" stroke={c1} strokeWidth="7" fill="none" strokeLinecap="round" />
          <circle cx="116" cy="82" r="9" fill={c3} />
          <circle cx="84" cy="118" r="7" fill={c3} />
        </g>
      )}
      {variant === 'pizza' && (
        <g>
          <circle cx="100" cy="100" r="68" fill={c1} />
          <circle cx="100" cy="100" r="58" fill={c2} />
          <circle cx="80" cy="82" r="9" fill={c3} />
          <circle cx="118" cy="78" r="8" fill={c3} />
          <circle cx="122" cy="116" r="9" fill={c3} />
          <circle cx="84" cy="120" r="8" fill={c3} />
          <path d="M100 42V158M42 100H158M59 59L141 141M141 59L59 141" stroke={c1} strokeWidth="2.5" opacity="0.7" />
        </g>
      )}
    </svg>
  );
}
