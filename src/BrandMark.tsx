type BrandMarkProps = {
  inverted?: boolean;
};

export function BrandMark({ inverted = false }: BrandMarkProps) {
  const mark = inverted ? "bg-cream/15 text-cream" : "bg-sage text-cream";
  const word = inverted ? "text-cream" : "text-ink";
  const sub = inverted ? "text-cream/65" : "text-ink-muted";

  return (
    <div className="flex items-center gap-3">
      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${mark}`} aria-hidden>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path
            d="M12 3.5c-2.4 3.2-4 5.9-4 8.4a4 4 0 1 0 8 0c0-2.5-1.6-5.2-4-8.4Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M12 14.2v4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
      <span className="leading-tight">
        <span className={`block font-display text-[17px] font-semibold tracking-tight ${word}`}>
          Steadwell
        </span>
        <span className={`block text-[11px] font-medium uppercase tracking-[0.16em] ${sub}`}>
          Admin
        </span>
      </span>
    </div>
  );
}
