import { useEffect, useRef } from "react";

export function FloatingAlert({
  message,
  tone = "error",
  offsetSidebar = true,
  onDismiss,
}: {
  message: string;
  tone?: "error" | "success";
  offsetSidebar?: boolean;
  onDismiss: () => void;
}) {
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;
  useEffect(() => {
    if (!message) {
      return;
    }
    const id = window.setTimeout(() => onDismissRef.current(), 6000);
    return () => window.clearTimeout(id);
  }, [message]);
  if (!message) {
    return null;
  }
  const success = tone === "success";
  return (
    <div
      className={`fixed bottom-6 z-[60] flex w-[min(22rem,calc(100vw-2rem))] items-start gap-3 rounded-2xl px-4 py-3.5 text-white shadow-lg ${
        success ? "bg-[#22c55e]" : "bg-[#f87171]"
      } ${offsetSidebar ? "left-[calc(15.5rem+2rem)]" : "left-6"}`}
      role="status"
    >
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white">
        {success ? <CheckIcon /> : <ErrorIcon />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold leading-tight">{success ? "Success" : "Error"}</p>
        <p className="mt-0.5 text-sm leading-snug text-white/95">{message}</p>
      </div>
      <button
        type="button"
        className="shrink-0 rounded-md p-0.5 text-white/90 hover:bg-white/15"
        aria-label="Dismiss"
        onClick={onDismiss}
      >
        <CloseIcon />
      </button>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
      <path d="M3.5 8.2 6.4 11 12.5 4.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
      <path d="M4 8h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

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

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40 backdrop-blur-[1px]"
        aria-label="Dismiss"
        disabled={busy}
        onClick={onCancel}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-body"
        className="relative w-full max-w-md rounded-2xl border border-sand bg-cream-card p-6 shadow-lift"
      >
        <h2 id="confirm-dialog-title" className="font-display text-xl font-semibold tracking-tight text-ink">
          {title}
        </h2>
        <p id="confirm-dialog-body" className="mt-2 text-sm leading-relaxed text-ink-muted">
          {body}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:bg-cream disabled:opacity-60"
            disabled={busy}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
              danger ? "bg-red-700 hover:bg-red-800" : "bg-sage hover:bg-sage-hover"
            }`}
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
