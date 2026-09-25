import { FormEvent, ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { listOrganizations, softDeleteOrganization, type Organization } from "./api";
import { CATEGORIES, ConfirmDialog, FloatingAlert, StatusPill, categoryLabel, seatBandLabel } from "./ui";

export function OrganizationsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [busyId, setBusyId] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Organization | null>(null);

  async function refresh(nextQ = q, nextStatus = status, nextCategory = category) {
    setError("");
    const rows = await listOrganizations({
      q: nextQ.trim() || undefined,
      status: nextStatus || undefined,
      category: nextCategory || undefined,
    });
    setOrgs(rows);
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listOrganizations()
      .then((rows) => {
        if (!cancelled) {
          setOrgs(rows);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const flash = (location.state as { flash?: string } | null)?.flash;
    if (!flash) {
      return;
    }
    setSuccess(flash);
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, location.state, navigate]);

  async function onSearch(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await refresh(q, status, category);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function onStatusChip(next: string) {
    setStatus(next);
    setLoading(true);
    try {
      await refresh(q, next, category);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function onCategoryChip(next: string) {
    setCategory(next);
    setLoading(true);
    try {
      await refresh(q, status, next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(org: Organization) {
    setPendingDelete(org);
  }

  async function confirmDelete() {
    if (!pendingDelete) {
      return;
    }
    const org = pendingDelete;
    setBusyId(org.id);
    setError("");
    try {
      await softDeleteOrganization(org.id);
      setPendingDelete(null);
      await refresh();
      setSuccess("Organization deleted successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Organizations</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Customers you create and issue a join QR for.
          </p>
        </div>
        <Link
          className="inline-flex items-center rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sage-hover"
          to="/organizations/new"
        >
          + New organization
        </Link>
      </div>

      <form className="mt-6 flex flex-wrap items-center gap-3" onSubmit={(e) => void onSearch(e)}>
        <input
          className="field !mt-0 max-w-xs"
          placeholder="Search"
          value={q}
          onChange={(ev) => setQ(ev.target.value)}
        />
        <button
          className="rounded-lg border border-sand bg-cream-card px-3 py-2.5 text-sm font-medium text-ink hover:bg-cream"
          type="submit"
        >
          Search
        </button>
        <div className="flex flex-wrap gap-2">
          <Chip active={status === ""} onClick={() => void onStatusChip("")}>
            All
          </Chip>
          <Chip active={status === "active"} onClick={() => void onStatusChip("active")}>
            Active
          </Chip>
          <Chip active={status === "draft"} onClick={() => void onStatusChip("draft")}>
            Draft
          </Chip>
        </div>
        <div className="flex flex-wrap gap-2">
          <Chip active={category === ""} onClick={() => void onCategoryChip("")}>
            Any category
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip
              key={c.value}
              active={category === c.value}
              onClick={() => void onCategoryChip(c.value)}
            >
              {c.label}
            </Chip>
          ))}
        </div>
      </form>

      <FloatingAlert message={error} onDismiss={() => setError("")} />
      <FloatingAlert message={success} tone="success" onDismiss={() => setSuccess("")} />

      <div className="mt-6 overflow-hidden rounded-2xl border border-sand bg-cream-card shadow-lift">
        {loading ? (
          <p className="px-6 py-10 text-sm text-ink-muted">Loading organizations…</p>
        ) : orgs.length === 0 ? (
          <div className="px-8 py-16 text-center">
            <h2 className="font-display text-xl font-semibold">No organizations yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
              Create a customer organization to generate its join token and QR.
            </p>
            <Link
              className="mt-6 inline-flex items-center rounded-lg bg-sage px-4 py-2 text-sm font-semibold text-white hover:bg-sage-hover"
              to="/organizations/new"
            >
              + New organization
            </Link>
          </div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-sand bg-cream/80 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              <tr>
                <th className="px-5 py-3">Organization</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Contract</th>
                <th className="px-5 py-3">Users</th>
                <th className="px-5 py-3">Status</th>
                <th className="w-14 px-3 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => (
                <tr
                  key={org.id}
                  className="cursor-pointer border-b border-sand/70 last:border-0 hover:bg-cream/70"
                  onClick={() => navigate(`/organizations/${org.id}`)}
                >
                  <td className="px-5 py-4">
                    <span className="font-medium text-ink">{org.name}</span>
                    {org.legal_name ? (
                      <p className="mt-0.5 text-xs text-ink-muted">{org.legal_name}</p>
                    ) : null}
                  </td>
                  <td className="px-5 py-4 text-ink">{categoryLabel(org.category)}</td>
                  <td className="px-5 py-4 text-ink-muted">{seatBandLabel(org.seat_band)}</td>
                  <td className="px-5 py-4 tabular-nums text-ink">{org.user_count.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <StatusPill status={org.status} />
                  </td>
                  <td className="px-3 py-4">
                    <button
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-700 hover:bg-red-50 disabled:opacity-50"
                      type="button"
                      aria-label={`Delete ${org.name}`}
                      title="Delete"
                      disabled={busyId === org.id}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        void onDelete(org);
                      }}
                    >
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete organization?"
        body={
          pendingDelete
            ? `Delete “${pendingDelete.name}”? It will no longer appear in Admin, and its users will be disabled.`
            : ""
        }
        confirmLabel="Delete"
        danger
        busy={Boolean(pendingDelete && busyId === pendingDelete.id)}
        onCancel={() => {
          if (!busyId) {
            setPendingDelete(null);
          }
        }}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        active ? "bg-ink text-cream" : "border border-sand bg-cream-card text-ink-muted hover:text-ink"
      }`}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M5 7h14M10 11v6M14 11v6M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
