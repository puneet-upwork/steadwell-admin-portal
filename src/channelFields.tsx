import { ToggleRow } from "./ui";

export type ChannelCreds = {
  enabled: boolean;
  configured?: boolean;
  bot_username: string;
  bot_token: string;
  webhook_secret: string;
  phone_number: string;
  api_token: string;
  liff_url: string;
  channel_secret: string;
  channel_access_token: string;
};

export function emptyChannelCreds(enabled = false): ChannelCreds {
  return {
    enabled,
    configured: false,
    bot_username: "",
    bot_token: "",
    webhook_secret: "",
    phone_number: "",
    api_token: "",
    liff_url: "",
    channel_secret: "",
    channel_access_token: "",
  };
}

export function validateChannelCreds(slug: string, c: ChannelCreds, isEdit: boolean): string[] {
  if (!c.enabled) {
    return [];
  }
  const keepSecrets = isEdit && Boolean(c.configured);
  const errs: string[] = [];
  if (slug === "telegram") {
    if (!c.bot_username.trim()) {
      errs.push("Bot username is required");
    }
    if (!keepSecrets && !c.bot_token.trim()) {
      errs.push("Bot token is required");
    }
  }
  if (slug === "whatsapp") {
    if (!c.phone_number.trim()) {
      errs.push("Phone number is required");
    }
    if (!keepSecrets && !c.api_token.trim()) {
      errs.push("API token is required");
    }
  }
  if (slug === "line") {
    if (!c.liff_url.trim()) {
      errs.push("LIFF URL is required");
    }
    if (!keepSecrets && !c.channel_secret.trim()) {
      errs.push("Channel secret is required");
    }
    if (!keepSecrets && !c.channel_access_token.trim()) {
      errs.push("Channel access token is required");
    }
  }
  return errs;
}

export function channelPayload(c: ChannelCreds) {
  return {
    enabled: c.enabled,
    bot_username: c.bot_username || undefined,
    bot_token: c.bot_token || undefined,
    webhook_secret: c.webhook_secret || undefined,
    phone_number: c.phone_number || undefined,
    api_token: c.api_token || undefined,
    liff_url: c.liff_url || undefined,
    channel_secret: c.channel_secret || undefined,
    channel_access_token: c.channel_access_token || undefined,
  };
}

export function ChannelCredsFields({
  slug,
  name,
  value,
  isEdit,
  errors,
  onChange,
}: {
  slug: string;
  name: string;
  value: ChannelCreds;
  isEdit: boolean;
  errors: string[];
  onChange: (next: ChannelCreds) => void;
}) {
  const secretHint = isEdit && value.configured ? "Leave blank to keep the saved secret." : undefined;
  return (
    <div className="space-y-3">
      <ToggleRow
        label={name}
        description={`Enable ${name} for this org’s join QR`}
        on={value.enabled}
        onToggle={() => onChange({ ...value, enabled: !value.enabled })}
      />
      {value.enabled ? (
        <div className="ml-1 space-y-3 rounded-xl border border-sand bg-cream/40 p-4">
          {slug === "telegram" ? (
            <>
              <SecretField
                name={`${slug}-bot-username`}
                label="Bot username"
                value={value.bot_username}
                secret={false}
                onChange={(bot_username) => onChange({ ...value, bot_username })}
              />
              <SecretField
                name={`${slug}-bot-token`}
                label="Bot token"
                value={value.bot_token}
                hint={secretHint}
                onChange={(bot_token) => onChange({ ...value, bot_token })}
              />
              <SecretField
                name={`${slug}-webhook-secret`}
                label="Webhook secret"
                value={value.webhook_secret}
                hint={secretHint ?? "Optional"}
                onChange={(webhook_secret) => onChange({ ...value, webhook_secret })}
              />
            </>
          ) : null}
          {slug === "whatsapp" ? (
            <>
              <SecretField
                name={`${slug}-phone-number`}
                label="Phone number"
                value={value.phone_number}
                secret={false}
                onChange={(phone_number) => onChange({ ...value, phone_number })}
              />
              <SecretField
                name={`${slug}-api-token`}
                label="API token"
                value={value.api_token}
                hint={secretHint}
                onChange={(api_token) => onChange({ ...value, api_token })}
              />
            </>
          ) : null}
          {slug === "line" ? (
            <>
              <SecretField
                name={`${slug}-liff-url`}
                label="LIFF URL"
                value={value.liff_url}
                secret={false}
                onChange={(liff_url) => onChange({ ...value, liff_url })}
              />
              <SecretField
                name={`${slug}-channel-secret`}
                label="Channel secret"
                value={value.channel_secret}
                hint={secretHint}
                onChange={(channel_secret) => onChange({ ...value, channel_secret })}
              />
              <SecretField
                name={`${slug}-channel-access-token`}
                label="Channel access token"
                value={value.channel_access_token}
                hint={secretHint}
                onChange={(channel_access_token) => onChange({ ...value, channel_access_token })}
              />
            </>
          ) : null}
          {errors.length > 0 ? (
            <ul className="text-xs text-red-800">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function SecretField({
  name,
  label,
  value,
  onChange,
  hint,
  secret = true,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  secret?: boolean;
}) {
  return (
    <label className="block text-sm font-semibold text-ink">
      {label}
      <input
        className="field"
        name={name}
        id={name}
        type={secret ? "password" : "text"}
        autoComplete="new-password"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        data-1p-ignore="true"
        data-lpignore="true"
        data-form-type="other"
        value={value}
        onChange={(ev) => onChange(ev.target.value)}
      />
      {hint ? <span className="mt-1 block text-xs font-normal text-ink-muted">{hint}</span> : null}
    </label>
  );
}
