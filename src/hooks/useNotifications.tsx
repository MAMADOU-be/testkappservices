import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';
import { useToast } from './use-toast';

export function useAdminNotifications() {
  const { user } = useAuth();
  const { hasAnyRole } = useProfile();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const isStaff = hasAnyRole(['admin', 'employee']);

  // Create audio element for notification sound
  useEffect(() => {
    // Create a simple beep using AudioContext
    audioRef.current = null; // Will use AudioContext instead
  }, []);

  const playNotificationSound = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn('Could not play notification sound:', e);
    }
  }, []);

  const loadUnreadCount = useCallback(async () => {
    if (!user || !isStaff) return;
    const { count } = await supabase
      .from('admin_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);
    setUnreadCount(count || 0);
  }, [user, isStaff]);

  const markAllAsRead = useCallback(async () => {
    if (!user || !isStaff) return;
    await supabase
      .from('admin_notifications')
      .update({ is_read: true })
      .eq('is_read', false);
    setUnreadCount(0);
  }, [user, isStaff]);

  useEffect(() => {
    if (!user || !isStaff) return;

    // Load initial unread count
    loadUnreadCount();

    // Listen for new notifications
    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'admin_notifications' },
        (payload) => {
          const notification = payload.new as { title: string; message: string };
          playNotificationSound();
          toast({
            title: `🔔 ${notification.title}`,
            description: notification.message,
          });
          setUnreadCount(prev => prev + 1);
        }
      )
      // Listen for new service requests
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'service_requests' },
        (payload) => {
          const req = payload.new as { first_name: string; last_name: string };
          playNotificationSound();
          toast({
            title: '🏠 Nouvelle demande de service',
            description: `${req.first_name} ${req.last_name} a envoyé une demande`,
          });
          loadUnreadCount();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'job_applications' },
        (payload) => {
          const app = payload.new as { first_name: string; last_name: string };
          playNotificationSound();
          toast({
            title: '💼 Nouvelle candidature',
            description: `${app.first_name} ${app.last_name} a postulé`,
          });
          loadUnreadCount();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'contact_messages' },
        (payload) => {
          const msg = payload.new as { first_name: string; last_name: string };
          playNotificationSound();
          toast({
            title: '✉️ Nouveau message de contact',
            description: `${msg.first_name} ${msg.last_name} a envoyé un message`,
          });
          loadUnreadCount();
        }
      )
      // Listen for profile updates
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
          const profile = payload.new as { display_name: string | null };
          playNotificationSound();
          toast({
            title: '👤 Profil modifié',
            description: `${profile.display_name || 'Utilisateur'} a mis à jour son profil`,
          });
          loadUnreadCount();
        }
      )
      // Listen for role changes
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_roles' },
        () => {
          playNotificationSound();
          toast({
            title: '🔑 Changement de rôle',
            description: 'Un rôle utilisateur a été modifié',
          });
          loadUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isStaff, playNotificationSound, toast, loadUnreadCount]);

  return { unreadCount, markAllAsRead, loadUnreadCount };
}
