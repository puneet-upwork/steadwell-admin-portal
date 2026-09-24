import { FormEvent, ReactNode, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { listOrganizations, softDeleteOrganization, type Organization } from "./api";
import { CATEGORIES, StatusPill, categoryLabel, seatBandLabel } from "./ui";

export function OrganizationsPage() {
  const navigate = useNavigate();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [busyId, setBusyId] = useState("");

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
    if (!window.confirm(`Soft delete “${org.name}”? It leaves the listing but stays in the database.`)) {
      return;
    }
    setBusyId(org.id);
    setError("");
    try {
      await softDeleteOrganization(org.id);
      await refresh();
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

      {error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

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
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => (
                <tr key={org.id} className="border-b border-sand/70 last:border-0">
                  <td className="px-5 py-4">
                    <Link className="font-medium text-ink hover:text-sage" to={`/organizations/${org.id}`}>
                      {org.name}
                    </Link>
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
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-cream"
                        type="button"
                        onClick={() => navigate(`/organizations/${org.id}`)}
                      >
                        Open
                      </button>
                      <button
                        className="rounded-md px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                        type="button"
                        disabled={busyId === org.id}
                        onClick={() => void onDelete(org)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
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
