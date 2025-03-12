import { useState, useEffect } from 'react';
import { supabase } from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      console.log('useAuth: Sessione recuperata', session);
      console.log('useAuth: Utente recuperato', session?.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      console.log('useAuth: Stato di autenticazione cambiato', session);
      console.log('useAuth: Utente recuperato', session?.user);
    });

    return () => subscription?.unsubscribe();
  }, []);

  console.log('useAuth: Stato attuale', { user, loading });
  return { user, loading };
};