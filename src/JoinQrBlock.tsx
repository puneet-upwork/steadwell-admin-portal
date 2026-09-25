import { useState } from "react";

import { rotateJoinToken, type OrgChannel, type Organization } from "./api";
import { encodeQR } from "./qr";
import { ConfirmDialog, FloatingAlert } from "./ui";

export function JoinQrBlock({
  org,
  channelsBySlug,
  onUpdated,
}: {
  org: Organization;
  /** Live channel form values (QR appears as public bot fields are typed). */
  channelsBySlug: Record<string, { enabled: boolean; bot_username?: string; phone_number?: string; liff_url?: string }>;
  onUpdated?: (org: Organization) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmRotate, setConfirmRotate] = useState(false);
  const cards = (org.channels ?? [])
    .filter((ch) => channelsBySlug[ch.slug]?.enabled)
    .map((ch) => ({
      ch,
      joinUrl: liveJoinUrl(ch, org.join_token, channelsBySlug[ch.slug]),
    }))
    .filter((row) => row.joinUrl);

  async function confirmRegenerate() {
    setBusy(true);
    setError("");
    try {
      const next = await rotateJoinToken(org.id);
      onUpdated?.(next);
      setConfirmRotate(false);
      setSuccess("Join token regenerated successfully");
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
            Built from this org’s bot fields as you type. Nothing is shown until the public
            field is filled (Telegram username, WhatsApp number, or LINE LIFF URL).
          </p>
        </div>
        <button
          className="rounded-lg border border-sand px-3 py-2 text-sm font-medium text-ink hover:bg-cream disabled:opacity-60"
          type="button"
          disabled={busy}
          onClick={() => setConfirmRotate(true)}
        >
          {busy ? "Regenerating…" : "Regenerate token"}
        </button>
      </div>
      <FloatingAlert message={error} onDismiss={() => setError("")} />
      <FloatingAlert message={success} tone="success" onDismiss={() => setSuccess("")} />

      {cards.length === 0 ? (
        <p className="mt-5 text-sm text-ink-muted">
          Enable a channel and enter its public bot field to generate a join QR.
        </p>
      ) : (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {cards.map(({ ch, joinUrl }) => (
            <ChannelQrCard key={ch.slug} name={ch.name} slug={ch.slug} joinUrl={joinUrl} orgSlug={org.slug} />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmRotate}
        title="Regenerate join token?"
        body="The old channel links and QRs will stop assigning new users. Existing users are not moved."
        confirmLabel="Regenerate"
        danger
        busy={busy}
        onCancel={() => {
          if (!busy) {
            setConfirmRotate(false);
          }
        }}
        onConfirm={() => void confirmRegenerate()}
      />
    </div>
  );
}

function liveJoinUrl(
  ch: OrgChannel,
  token: string,
  live?: { bot_username?: string; phone_number?: string; liff_url?: string },
): string {
  const bot = (live?.bot_username ?? "").replace(/^@/, "").trim();
  const phone = (live?.phone_number ?? "").replace(/\D/g, "");
  const liff = (live?.liff_url ?? "").replace(/\/$/, "").trim();
  if (!token) {
    return "";
  }
  if (ch.slug === "telegram" && bot) {
    return `https://t.me/${bot}?start=${encodeURIComponent(token)}`;
  }
  if (ch.slug === "whatsapp" && phone) {
    return `https://wa.me/${phone}?text=${encodeURIComponent(token)}`;
  }
  if (ch.slug === "line" && liff) {
    const sep = liff.includes("?") ? "&" : "?";
    return `${liff}${sep}liff.state=${encodeURIComponent(token)}`;
  }
  return "";
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
  const svgMarkup = encodeQR(joinUrl, "svg", { ecc: "medium", scale: 5, border: 2 });
  const qrSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;

  async function copyUrl() {
    await navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function downloadSvg() {
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
    </div>
  );
}
