import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import type { ChildProfile } from '../components/ProfilesCard';

interface UseProfilesResult {
  profiles: ChildProfile[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  addProfile: (profile: { name: string; age?: number; avatarUrl?: string }) => Promise<void>;
  editProfile: (id: string, profile: { name: string; age?: number; avatarUrl?: string }) => Promise<void>;
}

/**
 * useProfiles fetches child profiles for the current user from Supabase.
 * Returns profiles, loading, error, and a refetch function.
 */
export function useProfiles(): UseProfilesResult {
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: supaError } = await supabase
        .from('child_profiles')
        .select('id, name, age, avatar_url');
      if (supaError) throw supaError;
      setProfiles(
        (data || []).map((row: any) => ({
          id: row.id,
          name: row.name,
          age: row.age,
          avatarUrl: row.avatar_url || undefined,
        }))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to load profiles');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addProfile = useCallback(async (profile: { name: string; age?: number; avatarUrl?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: supaError } = await supabase.from('child_profiles').insert([
        {
          name: profile.name,
          age: profile.age,
          avatar_url: profile.avatarUrl,
        },
      ]);
      if (supaError) throw supaError;
      await fetchProfiles();
    } catch (err: any) {
      setError(err.message || 'Failed to add profile');
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfiles]);

  const editProfile = useCallback(async (id: string, profile: { name: string; age?: number; avatarUrl?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: supaError } = await supabase.from('child_profiles').update({
        name: profile.name,
        age: profile.age,
        avatar_url: profile.avatarUrl,
      }).eq('id', id);
      if (supaError) throw supaError;
      await fetchProfiles();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfiles]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return { profiles, isLoading, error, refetch: fetchProfiles, addProfile, editProfile };
}
