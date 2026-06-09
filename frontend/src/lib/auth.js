import { useEffect, useState } from 'react';

/**
 * useCurrentUser — fetches /api/me. Returns { user, loading }. If the
 * request 401s, user is null. AppLayout uses this to gate the shell and
 * redirect to /login.
 */
export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/me', { credentials: 'include' })
      .then(r => (r.ok ? r.json() : { data: null }))
      .then(j => { if (!cancelled) setUser(j?.data || null); })
      .catch(() => { if (!cancelled) setUser(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { user, loading };
}

export async function logout() {
  await fetch('/api/logout', { method: 'POST', credentials: 'include' });
}

export const isAgent   = (u) => u?.role === 'agent';
export const isManager = (u) => u?.role === 'admin' || u?.role === 'manager';
