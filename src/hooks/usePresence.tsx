import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function usePresence() {
  const { user } = useAuth();

  const updatePresence = useCallback(async (online: boolean) => {
    if (!user) return;
    
    await supabase
      .from('user_presence')
      .upsert({
        user_id: user.id,
        is_online: online,
        last_seen: new Date().toISOString(),
      }, { onConflict: 'user_id' });
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Set online
    updatePresence(true);

    // Heartbeat every 30 seconds
    const interval = setInterval(() => updatePresence(true), 30000);

    // Set offline on page close
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliability
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_presence?user_id=eq.${user.id}`;
      const body = JSON.stringify({ is_online: false, last_seen: new Date().toISOString() });
      navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence(false);
      } else {
        updatePresence(true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      updatePresence(false);
    };
  }, [user, updatePresence]);
}
