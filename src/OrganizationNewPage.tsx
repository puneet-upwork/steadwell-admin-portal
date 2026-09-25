import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  createOrganization,
  listChannels,
  listFeatures,
  type ChannelDefinition,
  type FeatureDefinition,
} from "./api";
import {
  ChannelCredsFields,
  channelPayload,
  emptyChannelCreds,
  validateChannelCreds,
  type ChannelCreds,
} from "./channelFields";
import {
  CATEGORIES,
  FloatingAlert,
  SEAT_BANDS,
  SUBCATEGORIES,
  ToggleRow,
  featureLabel,
} from "./ui";

export function OrganizationNewPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [status, setStatus] = useState("active");
  const [category, setCategory] = useState("b2c");
  const [subcategory, setSubcategory] = useState("consumer");
  const [seatBand, setSeatBand] = useState("");
  const [defs, setDefs] = useState<FeatureDefinition[]>([]);
  const [channelDefs, setChannelDefs] = useState<ChannelDefinition[]>([]);
  const [features, setFeatures] = useState<Record<string, boolean>>({ text_messages: true });
  const [channels, setChannels] = useState<Record<string, ChannelCreds>>({
    telegram: emptyChannelCreds(false),
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([listFeatures(), listChannels()])
      .then(([featRows, chanRows]) => {
        setDefs(featRows);
        setChannelDefs(chanRows);
        setFeatures((prev) => {
          const next = { ...prev };
          for (const row of featRows) {
            if (next[row.key] === undefined) {
              next[row.key] = row.key === "text_messages";
            }
          }
          return next;
        });
        setChannels((prev) => {
          const next = { ...prev };
          for (const row of chanRows) {
            if (next[row.slug] === undefined) {
              next[row.slug] = emptyChannelCreds(false);
            }
          }
          return next;
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load form data"));
  }, []);

  function onCategoryChange(next: string) {
    setCategory(next);
    const options = SUBCATEGORIES[next] ?? [];
    setSubcategory(options[0]?.value ?? "");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors: Record<string, string[]> = {};
    let hasErr = false;
    for (const [slug, creds] of Object.entries(channels)) {
      const errs = validateChannelCreds(slug, creds, false);
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
      const payload: Record<string, ReturnType<typeof channelPayload>> = {};
      for (const [slug, creds] of Object.entries(channels)) {
        payload[slug] = channelPayload(creds);
      }
      await createOrganization({
        name,
        legal_name: legalName || undefined,
        status,
        category,
        subcategory: subcategory || undefined,
        seat_band: seatBand || undefined,
        features,
        channels: payload,
      });
      navigate("/organizations", { replace: true, state: { flash: "Organization created successfully" } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  const subcategoryOptions = SUBCATEGORIES[category] ?? [];

  return (
    <div className="max-w-2xl">
      <Link className="text-sm text-ink-muted hover:text-ink" to="/organizations">
        ← Organizations
      </Link>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">New organization</h1>
      <p className="mt-1 text-sm text-ink-muted">Slug is generated from the name. Join QR is created on save.</p>

      <FloatingAlert message={error} onDismiss={() => setError("")} />

      <form className="mt-8 space-y-10" onSubmit={(e) => void onSubmit(e)}>
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">01 Basics</p>
          <div className="mt-4 space-y-4 rounded-2xl border border-sand bg-cream-card p-6 shadow-lift">
            <label className="block text-sm font-semibold text-ink">
              Organization name
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
          </div>
        </section>

        <section>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">02 Commercial</p>
          <div className="mt-4 space-y-4 rounded-2xl border border-sand bg-cream-card p-6 shadow-lift">
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
        </section>

        <section>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">03 Channels</p>
          <div className="mt-4 space-y-3 rounded-2xl border border-sand bg-cream-card p-6 shadow-lift">
            {channelDefs.length === 0 ? (
              <p className="text-sm text-ink-muted">Loading channels…</p>
            ) : (
              channelDefs.map((ch) => (
                <ChannelCredsFields
                  key={ch.slug}
                  slug={ch.slug}
                  name={ch.name}
                  value={channels[ch.slug] ?? emptyChannelCreds(false)}
                  isEdit={false}
                  errors={fieldErrors[ch.slug] ?? []}
                  onChange={(next) => setChannels((prev) => ({ ...prev, [ch.slug]: next }))}
                />
              ))
            )}
          </div>
        </section>

        <section>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">04 Features</p>
          <div className="mt-4 space-y-3 rounded-2xl border border-sand bg-cream-card p-6 shadow-lift">
            {defs.length === 0 ? (
              <p className="text-sm text-ink-muted">Loading features…</p>
            ) : (
              defs.map((f) => (
                <ToggleRow
                  key={f.key}
                  label={featureLabel(f.key)}
                  description={f.description}
                  on={features[f.key] ?? false}
                  onToggle={() => setFeatures((prev) => ({ ...prev, [f.key]: !prev[f.key] }))}
                />
              ))
            )}
          </div>
        </section>

        <div className="flex justify-end gap-2">
          <Link
            className="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:bg-cream"
            to="/organizations"
          >
            Cancel
          </Link>
          <button
            className="rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white hover:bg-sage-hover disabled:opacity-60"
            type="submit"
            disabled={busy || !name.trim()}
          >
            {busy ? "Creating…" : "Create organization"}
          </button>
        </div>
      </form>
    </div>
  );
}
