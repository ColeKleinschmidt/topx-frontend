import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { authStatusAPI } from "../backend/apis.js";

export function RequireAuth({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;
    authStatusAPI()
      .then((resp) => {
        if (!mounted) return;
        setAuthenticated(!!resp.authenticated);
      })
      .catch(() => setAuthenticated(false))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  if (loading) return null; // or a spinner
  if (!authenticated) return <Navigate to="/" replace />;
  return children;
}

export function RedirectIfAuth({ children, redirectTo = "/myLists" }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;
    authStatusAPI()
      .then((resp) => {
        if (!mounted) return;
        setAuthenticated(!!resp.authenticated);
      })
      .catch(() => setAuthenticated(false))
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  if (loading) return null;
  if (authenticated) return <Navigate to={redirectTo} replace />;
  return children;
}
