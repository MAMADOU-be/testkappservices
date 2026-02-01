import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ReferralStats {
  total: number;
  completed: number;
  pending: number;
}

interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string | null;
  referral_code: string;
  status: 'pending' | 'completed' | 'expired';
  referred_email: string | null;
  created_at: string;
  completed_at: string | null;
}

interface UseReferralReturn {
  referralCode: string | null;
  referralLink: string;
  stats: ReferralStats;
  referrals: Referral[];
  isLoading: boolean;
  generateCode: () => Promise<string | null>;
  copyToClipboard: (text: string) => Promise<boolean>;
  processReferral: (referralCode: string) => Promise<boolean>;
}

export const useReferral = (): UseReferralReturn => {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [stats, setStats] = useState<ReferralStats>({ total: 0, completed: 0, pending: 0 });
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const referralLink = referralCode 
    ? `${window.location.origin}/auth?ref=${referralCode}` 
    : '';

  const fetchReferralData = useCallback(async () => {
    if (!user) {
      setReferralCode(null);
      setStats({ total: 0, completed: 0, pending: 0 });
      setReferrals([]);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch or generate referral code
      const { data: codeData, error: codeError } = await supabase
        .rpc('ensure_referral_code', { _user_id: user.id });

      if (codeError) {
        console.error('Error fetching referral code:', codeError);
      } else {
        setReferralCode(codeData as string);
      }

      // Fetch stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_referral_stats', { _user_id: user.id });

      if (statsError) {
        console.error('Error fetching referral stats:', statsError);
      } else if (statsData) {
        const parsed = typeof statsData === 'string' ? JSON.parse(statsData) : statsData;
        setStats({
          total: parsed.total ?? 0,
          completed: parsed.completed ?? 0,
          pending: parsed.pending ?? 0,
        });
      }

      // Fetch referrals list
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (referralsError) {
        console.error('Error fetching referrals:', referralsError);
      } else {
        setReferrals(referralsData as Referral[]);
      }
    } catch (err) {
      console.error('Error in fetchReferralData:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReferralData();
  }, [fetchReferralData]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('referrals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referrals',
          filter: `referrer_id=eq.${user.id}`,
        },
        () => {
          fetchReferralData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchReferralData]);

  const generateCode = useCallback(async (): Promise<string | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .rpc('ensure_referral_code', { _user_id: user.id });

    if (error) {
      console.error('Error generating referral code:', error);
      return null;
    }

    const newCode = data as string;
    setReferralCode(newCode);
    return newCode;
  }, [user]);

  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      return false;
    }
  }, []);

  const processReferral = useCallback(async (code: string): Promise<boolean> => {
    if (!user) return false;

    const { data, error } = await supabase
      .rpc('process_referral', { 
        _referred_user_id: user.id, 
        _referral_code: code 
      });

    if (error) {
      console.error('Error processing referral:', error);
      return false;
    }

    return data as boolean;
  }, [user]);

  return {
    referralCode,
    referralLink,
    stats,
    referrals,
    isLoading,
    generateCode,
    copyToClipboard,
    processReferral,
  };
};
