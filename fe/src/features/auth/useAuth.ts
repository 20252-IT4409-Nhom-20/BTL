import { useEffect, useState } from 'react';
import { AUTH_CHANGE_EVENT, getUser, type StoredUser } from '@/lib/auth-client';
import { logout as doLogout } from '@/features/auth/api';

export function useAuth() {
  const [user, setUserState] = useState<StoredUser | null>(() => getUser());

  useEffect(() => {
    const sync = () => setUserState(getUser());
    window.addEventListener(AUTH_CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    logout: doLogout,
  };
}
