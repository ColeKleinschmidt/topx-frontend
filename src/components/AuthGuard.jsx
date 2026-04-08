import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { authStatusAPI } from "../backend/apis.js";

export function RequireAuth({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    // Check localStorage first as a fallback
    const localUser = localStorage.getItem("user");
    
    authStatusAPI()
      .then((resp) => {
        if (!mounted) return;
        setAuthenticated(!!resp.authenticated);
      })
      .catch(() => {
        // If authStatus fails but we have a user in localStorage, try to authenticate
        if (localUser) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      })
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
    
    // Check localStorage first as a fallback
    const localUser = localStorage.getItem("user");
    
    authStatusAPI()
      .then((resp) => {
        if (!mounted) return;
        setAuthenticated(!!resp.authenticated);
      })
      .catch(() => {
        // If authStatus fails but we have a user in localStorage, they're authenticated
        if (localUser) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      })
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  if (loading) return null;
  if (authenticated) return <Navigate to={redirectTo} replace />;
  return children;
}
