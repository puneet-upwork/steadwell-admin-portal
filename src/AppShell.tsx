import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { logout, type Admin } from "./api";
import { BrandMark } from "./BrandMark";

export function AppShell({ admin }: { admin: Admin }) {
  const navigate = useNavigate();
  const name = admin.display_name.trim() || admin.email;

  async function onLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-[15.5rem] shrink-0 flex-col bg-ink text-cream">
        <div className="px-5 py-5">
          <BrandMark inverted />
        </div>
        <nav className="flex-1 px-3 py-2">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-cream/40">
            Manage
          </p>
          <NavLink
            to="/organizations"
            end
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition ${
                isActive ? "bg-cream/10 text-cream" : "text-cream/70 hover:bg-cream/10 hover:text-cream"
              }`
            }
          >
            <BuildingIcon />
            Organizations
          </NavLink>
        </nav>
        <div className="border-t border-cream/10 p-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage text-xs font-semibold text-cream">
              {initials(name)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-cream">{name}</span>
              <span className="block truncate text-xs text-cream/50">{admin.email}</span>
            </span>
          </div>
          <button
            className="mt-3 w-full rounded-lg px-2 py-1.5 text-left text-sm text-cream/70 transition hover:bg-cream/10 hover:text-cream"
            type="button"
            onClick={() => void onLogout()}
          >
            Log out
          </button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center border-b border-sand bg-cream-card/80 px-8 backdrop-blur">
          <p className="text-sm text-ink-muted">Staff console</p>
        </header>
        <main className="flex-1 px-8 py-8">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" aria-hidden>
      <path
        d="M4 20V9.5L12 4l8 5.5V20M9 20v-6h6v6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function initials(name: string): string {
  const parts = name.split(/[\s@._-]+/).filter(Boolean);
  const letters = (parts[0]?.[0] ?? "S") + (parts[1]?.[0] ?? "");
  return letters.toUpperCase();
}
