import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  getOrganization,
  putOrganizationChannels,
  putOrganizationFeatures,
  softDeleteOrganization,
  updateOrganization,
  type Organization,
} from "./api";
import {
  ChannelCredsFields,
  channelPayload,
  emptyChannelCreds,
  validateChannelCreds,
  type ChannelCreds,
} from "./channelFields";
import { JoinQrBlock } from "./JoinQrBlock";
import {
  CATEGORIES,
  ConfirmDialog,
  FloatingAlert,
  SEAT_BANDS,
  SUBCATEGORIES,
  ToggleRow,
  featureLabel,
  StatusPill,
} from "./ui";

export function OrganizationDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [org, setOrg] = useState<Organization | null>(null);
  const [name, setName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [status, setStatus] = useState("active");
  const [category, setCategory] = useState("b2c");
  const [subcategory, setSubcategory] = useState("");
  const [seatBand, setSeatBand] = useState("");
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [channels, setChannels] = useState<Record<string, ChannelCreds>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }
    setLoading(true);
    getOrganization(id)
      .then((row) => {
        setOrg(row);
        setName(row.name);
        setLegalName(row.legal_name ?? "");
        setStatus(row.status);
        setCategory(row.category || "b2c");
        setSubcategory(row.subcategory ?? "");
        setSeatBand(row.seat_band ?? "");
        const fmap: Record<string, boolean> = {};
        for (const f of row.features ?? []) {
          fmap[f.key] = f.enabled;
        }
        setFeatures(fmap);
        const cmap: Record<string, ChannelCreds> = {};
        for (const ch of row.channels ?? []) {
          cmap[ch.slug] = {
            ...emptyChannelCreds(ch.enabled),
            configured: ch.configured,
            bot_username: ch.bot_username ?? "",
            phone_number: ch.phone_number ?? "",
            liff_url: ch.liff_url ?? "",
          };
        }
        setChannels(cmap);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  function onCategoryChange(next: string) {
    setCategory(next);
    const options = SUBCATEGORIES[next] ?? [];
    const stillValid = options.some((o) => o.value === subcategory);
    if (!stillValid) {
      setSubcategory(options[0]?.value ?? "");
    }
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!org) {
      return;
    }
    const nextErrors: Record<string, string[]> = {};
    let hasErr = false;
    for (const [slug, creds] of Object.entries(channels)) {
      const errs = validateChannelCreds(slug, creds, true);
      if (errs.length) {
        nextErrors[slug] = errs;
        hasErr = true;
      }
    }
    setFieldErrors(nextErrors);
    if (hasErr) {
      setError("Fill required bot credentials for each enabled channel.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await updateOrganization(org.id, {
        name,
        legal_name: legalName,
        status,
        category,
        subcategory,
        seat_band: seatBand,
      });
      const payload: Record<string, ReturnType<typeof channelPayload>> = {};
      for (const [slug, creds] of Object.entries(channels)) {
        payload[slug] = channelPayload(creds);
      }
      await putOrganizationChannels(org.id, payload);
      await putOrganizationFeatures(org.id, features);
      navigate("/organizations", { replace: true, state: { flash: "Organization updated successfully" } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the organization");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!org) {
      return;
    }
    setConfirmDelete(true);
  }

  async function confirmSoftDelete() {
    if (!org) {
      return;
    }
    setBusy(true);
    try {
      await softDeleteOrganization(org.id);
      navigate("/organizations", { replace: true, state: { flash: "Organization deleted successfully" } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setBusy(false);
      setConfirmDelete(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-ink-muted">Loading…</p>;
  }
  if (!org) {
    return (
      <div>
        <p className="text-sm text-red-700">{error || "Organization not found"}</p>
        <Link className="mt-3 inline-block text-sm text-ink-muted hover:text-ink" to="/organizations">
          ← Organizations
        </Link>
      </div>
    );
  }

  const subcategoryOptions = SUBCATEGORIES[category] ?? [];

  return (
    <div className="space-y-8">
      <div>
        <Link className="text-sm text-ink-muted hover:text-ink" to="/organizations">
          ← Organizations
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-semibold tracking-tight">{org.name}</h1>
          <StatusPill status={org.status} />
        </div>
        <p className="mt-1 font-mono text-xs text-ink-muted">{org.slug}</p>
        <p className="mt-1 text-sm text-ink-muted">{org.user_count.toLocaleString()} users</p>
      </div>

      <FloatingAlert message={error} onDismiss={() => setError("")} />

      <form className="space-y-8" onSubmit={(e) => void onSave(e)}>
        <div className="rounded-2xl border border-sand bg-cream-card p-6 shadow-lift">
          <h2 className="font-display text-xl font-semibold tracking-tight">Basics</h2>
          <div className="mt-4 space-y-4">
            <label className="block text-sm font-semibold text-ink">
              Name
              <input className="field" value={name} onChange={(ev) => setName(ev.target.value)} required />
            </label>
            <label className="block text-sm font-semibold text-ink">
              Legal name
              <input className="field" value={legalName} onChange={(ev) => setLegalName(ev.target.value)} />
            </label>
            <fieldset>
              <legend className="text-sm font-semibold text-ink">Status</legend>
              <div className="mt-2 flex gap-2">
                {(["active", "draft"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`rounded-lg px-3 py-2 text-sm font-semibold capitalize ${
                      status === s ? "bg-ink text-cream" : "border border-sand text-ink-muted hover:text-ink"
                    }`}
                    onClick={() => setStatus(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="text-sm font-semibold text-ink">Category</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                      category === c.value ? "bg-ink text-cream" : "border border-sand text-ink-muted hover:text-ink"
                    }`}
                    onClick={() => onCategoryChange(c.value)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="block text-sm font-semibold text-ink">
              Subcategory
              <select
                className="field"
                value={subcategory}
                onChange={(ev) => setSubcategory(ev.target.value)}
              >
                {subcategoryOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-ink">
              Contract (seat band)
              <select className="field" value={seatBand} onChange={(ev) => setSeatBand(ev.target.value)}>
                <option value="">Not set</option>
                {SEAT_BANDS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-sand bg-cream-card p-6 shadow-lift">
          <h2 className="font-display text-xl font-semibold tracking-tight">Channels</h2>
          <div className="mt-4 space-y-3">
            {(org.channels ?? []).map((ch) => (
              <ChannelCredsFields
                key={ch.slug}
                slug={ch.slug}
                name={ch.name}
                value={channels[ch.slug] ?? emptyChannelCreds(ch.enabled)}
                isEdit
                errors={fieldErrors[ch.slug] ?? []}
                onChange={(next) => setChannels((prev) => ({ ...prev, [ch.slug]: next }))}
              />
            ))}
          </div>
        </div>

        <JoinQrBlock
          org={org}
          channelsBySlug={channels}
          onUpdated={(next) => {
            setOrg(next);
            setChannels((prev) => {
              const cmap: Record<string, ChannelCreds> = { ...prev };
              for (const ch of next.channels ?? []) {
                cmap[ch.slug] = {
                  ...(cmap[ch.slug] ?? emptyChannelCreds(ch.enabled)),
                  configured: ch.configured,
                  bot_username: ch.bot_username ?? cmap[ch.slug]?.bot_username ?? "",
                  phone_number: ch.phone_number ?? cmap[ch.slug]?.phone_number ?? "",
                  liff_url: ch.liff_url ?? cmap[ch.slug]?.liff_url ?? "",
                  enabled: cmap[ch.slug]?.enabled ?? ch.enabled,
                };
              }
              return cmap;
            });
          }}
        />

        <div className="rounded-2xl border border-sand bg-cream-card p-6 shadow-lift">
          <h2 className="font-display text-xl font-semibold tracking-tight">Features</h2>
          <div className="mt-4 space-y-3">
            {(org.features ?? []).map((f) => (
              <ToggleRow
                key={f.key}
                label={featureLabel(f.key)}
                description={f.description}
                on={features[f.key] ?? false}
                onToggle={() => setFeatures((prev) => ({ ...prev, [f.key]: !prev[f.key] }))}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            className="rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white hover:bg-sage-hover disabled:opacity-60"
            type="submit"
            disabled={busy || !name.trim()}
          >
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-red-200 bg-red-50/40 p-6">
        <h2 className="text-sm font-semibold text-red-900">Danger zone</h2>
        <button
          className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60"
          type="button"
          disabled={busy}
          onClick={() => void onDelete()}
        >
          Delete organization
        </button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete organization?"
        body={`Delete “${org.name}”? It will no longer appear in Admin, and its users will be disabled.`}
        confirmLabel="Delete"
        danger
        busy={busy}
        onCancel={() => {
          if (!busy) {
            setConfirmDelete(false);
          }
        }}
        onConfirm={() => void confirmSoftDelete()}
      />
    </div>
  );
}
