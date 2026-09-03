import { Navigate } from "react-router-dom";
export function AdminGuard({ children }) {
  const isAuthed =
    localStorage.getItem("admin_authed") === "true" ||
    sessionStorage.getItem("admin_authed") === "true";

  if (!isAuthed) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}


