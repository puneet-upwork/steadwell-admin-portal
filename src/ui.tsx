export function StatusPill({ status }: { status: string }) {
  const tone =
    status === "active"
      ? "bg-sage/10 text-sage"
      : status === "draft"
        ? "bg-amber-100 text-amber-900"
        : "bg-sand text-ink-muted";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${tone}`}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "active" ? "bg-sage" : status === "draft" ? "bg-amber-700" : "bg-ink-muted"
        }`}
      />
      {status}
    </span>
  );
}

export function featureLabel(key: string): string {
  const map: Record<string, string> = {
    text_messages: "Text",
    image_messages: "Image",
    audio_messages: "Audio",
    video_messages: "Video",
  };
  return map[key] ?? key;
}

export const CATEGORIES = [
  { value: "b2c", label: "B2C" },
  { value: "b2b", label: "B2B" },
  { value: "b2g", label: "B2G" },
] as const;

export const SUBCATEGORIES: Record<string, { value: string; label: string }[]> = {
  b2c: [{ value: "consumer", label: "Consumer" }],
  b2b: [
    { value: "b1_corporate_wellness", label: "B1 Corporate Wellness" },
    { value: "b2_white_label", label: "B2 White-label" },
    { value: "b3_third_party", label: "B3 Third-Party Integration" },
  ],
  b2g: [
    { value: "g1_direct_government", label: "G1 Direct Government Program" },
    { value: "g2_platform_integration", label: "G2 Platform Integration" },
  ],
};

export const SEAT_BANDS = [
  { value: "1-500", label: "1–500" },
  { value: "501-2000", label: "501–2,000" },
  { value: "2000-plus", label: "2,000+ negotiated" },
  { value: "custom", label: "Custom" },
] as const;

export function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value.toUpperCase();
}

export function subcategoryLabel(category: string, value: string | null): string {
  if (!value) {
    return "—";
  }
  const hit = (SUBCATEGORIES[category] ?? []).find((s) => s.value === value);
  return hit?.label ?? value;
}

export function seatBandLabel(value: string | null): string {
  if (!value) {
    return "—";
  }
  return SEAT_BANDS.find((s) => s.value === value)?.label ?? value;
}

export function ToggleRow({
  label,
  description,
  on,
  onToggle,
}: {
  label: string;
  description?: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 py-1">
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {description ? <span className="block text-xs text-ink-muted">{description}</span> : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        className={`relative h-7 w-12 rounded-full transition ${on ? "bg-sage" : "bg-sand"}`}
        onClick={onToggle}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
            on ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </label>
  );
}
