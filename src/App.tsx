import { Navigate, Route, Routes } from "react-router-dom";

import { LoginPage } from "./LoginPage";
import { OrganizationDetailPage } from "./OrganizationDetailPage";
import { OrganizationNewPage } from "./OrganizationNewPage";
import { OrganizationsPage } from "./OrganizationsPage";
import { RequireAuth } from "./RequireAuth";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/organizations" element={<OrganizationsPage />} />
        <Route path="/organizations/new" element={<OrganizationNewPage />} />
        <Route path="/organizations/:id" element={<OrganizationDetailPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/organizations" replace />} />
    </Routes>
  );
}
