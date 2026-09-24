import { useState } from "react";

import { rotateJoinToken, type Organization } from "./api";
import { encodeQR } from "./qr";

export function JoinQrBlock({
  org,
  enabledBySlug,
  onUpdated,
}: {
  org: Organization;
  /** Live enable map from the form (updates QR as toggles change). */
  enabledBySlug: Record<string, boolean>;
  onUpdated?: (org: Organization) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const enabled = (org.channels ?? []).filter((ch) => enabledBySlug[ch.slug]);

  async function regenerate() {
    if (!window.confirm("Regenerate join QR? The old channel links and QRs will stop assigning new users.")) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      const next = await rotateJoinToken(org.id);
      onUpdated?.(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Regenerate failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-sand bg-cream-card p-6 shadow-lift">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-tight">Join QR</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Updates as you toggle channels above. Save to persist which channels are enabled.
          </p>
        </div>
        <button
          className="rounded-lg border border-sand px-3 py-2 text-sm font-medium text-ink hover:bg-cream disabled:opacity-60"
          type="button"
          disabled={busy}
          onClick={() => void regenerate()}
        >
          {busy ? "Regenerating…" : "Regenerate token"}
        </button>
      </div>
      {error ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
      ) : null}

      {enabled.length === 0 ? (
        <p className="mt-5 text-sm text-ink-muted">Enable a channel above to show its join QR.</p>
      ) : (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {enabled.map((ch) => (
            <ChannelQrCard key={ch.slug} name={ch.name} slug={ch.slug} joinUrl={ch.join_url ?? ""} orgSlug={org.slug} />
          ))}
        </div>
      )}
    </div>
  );
}

function ChannelQrCard({
  name,
  slug,
  joinUrl,
  orgSlug,
}: {
  name: string;
  slug: string;
  joinUrl: string;
  orgSlug: string;
}) {
  const [copied, setCopied] = useState(false);
  const configured = Boolean(joinUrl);
  const svgMarkup = configured
    ? encodeQR(joinUrl, "svg", { ecc: "medium", scale: 5, border: 2 })
    : "";
  const qrSrc = configured
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`
    : "";

  async function copyUrl() {
    if (!joinUrl) {
      return;
    }
    await navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function downloadSvg() {
    if (!svgMarkup) {
      return;
    }
    const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${orgSlug}-${slug}-join-qr.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-xl border border-sand bg-cream/40 p-4">
      <h3 className="text-sm font-semibold text-ink">{name}</h3>
      {!configured ? (
        <p className="mt-3 text-xs leading-relaxed text-ink-muted">
          Channel enabled, but join URL is not configured. Set{" "}
          {slug === "telegram"
            ? "TELEGRAM_BOT_USERNAME"
            : slug === "whatsapp"
              ? "WHATSAPP_BUSINESS_NUMBER"
              : "LINE_LIFF_URL"}{" "}
          on the API and restart.
        </p>
      ) : (
        <>
          <img
            className="mt-3 h-36 w-36 rounded-lg border border-sand bg-white p-2"
            src={qrSrc}
            alt={`${name} join QR`}
          />
          <p className="mt-3 break-all font-mono text-[11px] text-ink-muted">{joinUrl}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="rounded-lg border border-sand px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-cream"
              type="button"
              onClick={() => void copyUrl()}
            >
              {copied ? "Copied" : "Copy link"}
            </button>
            <button
              className="rounded-lg border border-sand px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-cream"
              type="button"
              onClick={downloadSvg}
            >
              Download QR
            </button>
          </div>
        </>
      )}
    </div>
  );
}
