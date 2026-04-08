import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { authStatusAPI } from "../backend/apis.js";

export function RequireAuth({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    // Check localStorage first
    const localUser = localStorage.getItem("user");
    
    // If we have localStorage user, authenticate immediately
    if (localUser) {
      setAuthenticated(true);
      setLoading(false);
      return;
    }
    
    // Otherwise check API
    authStatusAPI()
      .then((resp) => {
        if (!mounted) return;
        setAuthenticated(!!resp.authenticated);
      })
      .catch(() => {
        if (!mounted) return;
        setAuthenticated(false);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    
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
    
    // Check localStorage first
    const localUser = localStorage.getItem("user");
    
    // If we have localStorage user, authenticate immediately
    if (localUser) {
      setAuthenticated(true);
      setLoading(false);
      return;
    }
    
    // Otherwise check API
    authStatusAPI()
      .then((resp) => {
        if (!mounted) return;
        setAuthenticated(!!resp.authenticated);
      })
      .catch(() => {
        if (!mounted) return;
        setAuthenticated(false);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    
    return () => (mounted = false);
  }, []);

  if (loading) return null;
  if (authenticated) return <Navigate to={redirectTo} replace />;
  return children;
}
