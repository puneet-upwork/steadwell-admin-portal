import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { AppShell } from "./AppShell";
import { BrandMark } from "./BrandMark";
import { me, type Admin } from "./api";

export function RequireAuth() {
  const [admin, setAdmin] = useState<Admin | null | undefined>(undefined);

  useEffect(() => {
    me()
      .then(setAdmin)
      .catch(() => setAdmin(null));
  }, []);

  if (admin === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <BrandMark />
          <div className="h-1 w-28 overflow-hidden rounded-full bg-sand">
            <div className="h-full w-1/2 animate-pulse bg-sage" />
          </div>
        </div>
      </div>
    );
  }
  if (!admin) {
    return <Navigate to="/login" replace />;
  }
  return <AppShell admin={admin} />;
}
