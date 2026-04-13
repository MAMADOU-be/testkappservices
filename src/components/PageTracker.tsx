import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCookieConsent } from '@/components/CookieConsent';

function getSessionId(): string {
  const key = 'analytics_session_id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

function isAnalyticsAllowed(): boolean {
  const consent = getCookieConsent();
  return consent?.analytics === true;
}

export function PageTracker() {
  const tracked = useRef(new Set<string>());
  const [allowed, setAllowed] = useState(isAnalyticsAllowed);

  // Listen for consent changes
  useEffect(() => {
    const handler = () => setAllowed(isAnalyticsAllowed());
    window.addEventListener('cookie-consent-changed', handler);
    return () => window.removeEventListener('cookie-consent-changed', handler);
  }, []);

  useEffect(() => {
    if (!allowed) return;

    const path = window.location.pathname + window.location.hash;
    if (tracked.current.has(path)) return;
    tracked.current.add(path);

    supabase.from('page_views').insert({
      page_path: path,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      language: navigator.language,
      session_id: getSessionId(),
    }).then(({ error }) => {
      if (error) console.warn('Analytics error:', error.message);
    });
  }, [allowed]);

  // Also track hash changes for SPA navigation
  useEffect(() => {
    if (!allowed) return;

    const handleHashChange = () => {
      const path = window.location.pathname + window.location.hash;
      if (tracked.current.has(path)) return;
      tracked.current.add(path);

      supabase.from('page_views').insert({
        page_path: path,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        language: navigator.language,
        session_id: getSessionId(),
      });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [allowed]);

  return null;
}
