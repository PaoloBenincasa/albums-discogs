import { useState, useEffect } from 'react';
import { supabase } from '../services/api';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) {
                    console.error('Errore nel recupero della sessione:', error);
                    setUser(null);
                } else {
                    setUser(session?.user ?? null);
                }
            } catch (error) {
                console.error('Errore imprevisto durante il recupero della sessione:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            try {
                setUser(session?.user ?? null);
            } catch (error) {
                console.error('Errore durante il cambiamento dello stato di autenticazione:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        });

        return () => subscription?.unsubscribe();
    }, []);

    return { user, loading };
};