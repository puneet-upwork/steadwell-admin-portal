export type Admin = {
  id: string;
  email: string;
  display_name: string;
};

export type OrgFeature = {
  key: string;
  description: string;
  enabled: boolean;
};

export type OrgChannel = {
  slug: string;
  name: string;
  enabled: boolean;
  join_url?: string;
  configured?: boolean;
  bot_username?: string;
  phone_number?: string;
  liff_url?: string;
};

export type ChannelInput = {
  enabled: boolean;
  bot_username?: string;
  bot_token?: string;
  webhook_secret?: string;
  phone_number?: string;
  api_token?: string;
  liff_url?: string;
  channel_secret?: string;
  channel_access_token?: string;
};

export type Organization = {
  id: string;
  slug: string;
  name: string;
  legal_name: string | null;
  status: string;
  category: string;
  subcategory: string | null;
  seat_band: string | null;
  join_token: string;
  created_by_admin_id: string;
  user_count: number;
  features?: OrgFeature[];
  channels?: OrgChannel[];
};

export type FeatureDefinition = {
  key: string;
  description: string;
};

export type ChannelDefinition = {
  slug: string;
  name: string;
};

async function parse(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) {
    return null;
  }
  return JSON.parse(text) as unknown;
}

function errorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object") {
    const rec = data as { error?: unknown; errors?: unknown };
    if (Array.isArray(rec.errors) && rec.errors.length > 0) {
      return rec.errors.filter((e) => typeof e === "string").join("; ") || fallback;
    }
    if (typeof rec.error === "string" && rec.error) {
      return rec.error;
    }
  }
  return fallback;
}

export async function login(email: string, password: string): Promise<Admin> {
  const res = await fetch("/admin/v1/auth/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await parse(res);
  if (!res.ok) {
    throw new Error("Invalid email or password");
  }
  return data as Admin;
}

export async function logout(): Promise<void> {
  await fetch("/admin/v1/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

export async function me(): Promise<Admin | null> {
  const res = await fetch("/admin/v1/auth/me", { credentials: "include" });
  if (res.status === 401) {
    return null;
  }
  if (!res.ok) {
    throw new Error("session check failed");
  }
  return (await parse(res)) as Admin;
}

export async function listFeatures(): Promise<FeatureDefinition[]> {
  const res = await fetch("/admin/v1/features", { credentials: "include" });
  const data = await parse(res);
  if (!res.ok) {
    throw new Error(errorMessage(data, "Failed to load features"));
  }
  return data as FeatureDefinition[];
}

export async function listChannels(): Promise<ChannelDefinition[]> {
  const res = await fetch("/admin/v1/channels", { credentials: "include" });
  const data = await parse(res);
  if (!res.ok) {
    throw new Error(errorMessage(data, "Failed to load channels"));
  }
  return data as ChannelDefinition[];
}

export async function listOrganizations(params?: {
  q?: string;
  status?: string;
  category?: string;
}): Promise<Organization[]> {
  const qs = new URLSearchParams();
  if (params?.q) {
    qs.set("q", params.q);
  }
  if (params?.status) {
    qs.set("status", params.status);
  }
  if (params?.category) {
    qs.set("category", params.category);
  }
  const suffix = qs.toString() ? `?${qs}` : "";
  const res = await fetch(`/admin/v1/organizations${suffix}`, { credentials: "include" });
  const data = await parse(res);
  if (!res.ok) {
    throw new Error(errorMessage(data, "Failed to load organizations"));
  }
  return data as Organization[];
}

export async function getOrganization(id: string): Promise<Organization> {
  const res = await fetch(`/admin/v1/organizations/${id}`, { credentials: "include" });
  const data = await parse(res);
  if (!res.ok) {
    throw new Error(errorMessage(data, "Failed to load organization"));
  }
  return data as Organization;
}

export async function createOrganization(input: {
  name: string;
  legal_name?: string;
  status?: string;
  category?: string;
  subcategory?: string;
  seat_band?: string;
  features?: Record<string, boolean>;
  channels?: Record<string, ChannelInput>;
}): Promise<Organization> {
  const res = await fetch("/admin/v1/organizations", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parse(res);
  if (!res.ok) {
    throw new Error(errorMessage(data, "Failed to create organization"));
  }
  return data as Organization;
}

export async function updateOrganization(
  id: string,
  input: {
    name?: string;
    legal_name?: string;
    status?: string;
    category?: string;
    subcategory?: string;
    seat_band?: string;
  },
): Promise<Organization> {
  const res = await fetch(`/admin/v1/organizations/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parse(res);
  if (!res.ok) {
    throw new Error(errorMessage(data, "Failed to update organization"));
  }
  return data as Organization;
}

export async function putOrganizationFeatures(
  id: string,
  features: Record<string, boolean>,
): Promise<Organization> {
  const res = await fetch(`/admin/v1/organizations/${id}/features`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ features }),
  });
  const data = await parse(res);
  if (!res.ok) {
    throw new Error(errorMessage(data, "Failed to update features"));
  }
  return data as Organization;
}

export async function putOrganizationChannels(
  id: string,
  channels: Record<string, ChannelInput>,
): Promise<Organization> {
  const res = await fetch(`/admin/v1/organizations/${id}/channels`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ channels }),
  });
  const data = await parse(res);
  if (!res.ok) {
    throw new Error(errorMessage(data, "Failed to update channels"));
  }
  return data as Organization;
}

export async function softDeleteOrganization(id: string): Promise<void> {
  const res = await fetch(`/admin/v1/organizations/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  const data = await parse(res);
  if (!res.ok) {
    throw new Error(errorMessage(data, "Failed to delete organization"));
  }
}

export async function rotateJoinToken(id: string): Promise<Organization> {
  const res = await fetch(`/admin/v1/organizations/${id}/join-token/rotate`, {
    method: "POST",
    credentials: "include",
  });
  const data = await parse(res);
  if (!res.ok) {
    throw new Error(errorMessage(data, "Failed to regenerate join QR"));
  }
  return data as Organization;
}
