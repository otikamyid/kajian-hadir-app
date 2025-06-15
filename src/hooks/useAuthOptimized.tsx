
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useNavigate } from 'react-router-dom';

type Profile = Tables<'profiles'>;

// Debounce function for profile fetching
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export function useAuthOptimized() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      console.log('Profile data fetched:', profileData);
      setProfile(profileData);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  }, []);

  // Debounced version of fetchProfile
  const debouncedFetchProfile = useMemo(
    () => debounce(fetchProfile, 300),
    [fetchProfile]
  );

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use debounced fetch to prevent rapid calls
          debouncedFetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, debouncedFetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    console.log('Signing in with email:', email);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Sign in error:', error);
    }
    
    return { error };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    console.log('Signing up with email:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    
    if (error) {
      console.error('Sign up error:', error);
      return { error };
    }
    
    console.log('Sign up success:', data);
    return { error, user: data.user };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      setProfile(null);
      navigate('/auth');
    }
    return { error };
  }, [navigate]);

  // Memoized profile creation functions to prevent recreating on every render
  const createAdminProfile = useCallback(async (userId: string, email: string) => {
    try {
      console.log('Creating admin profile:', { userId, email });
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert({ 
          id: userId,
          email: email,
          role: 'admin',
          participant_id: null
        }, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (profileError) {
        console.error('Error creating admin profile:', profileError);
        throw profileError;
      }
      
      console.log('Admin profile created successfully with role:', profileData.role);
      setProfile(profileData);
      
      return { success: true, profile: profileData };
    } catch (error) {
      console.error('Error in createAdminProfile:', error);
      return { error };
    }
  }, []);

  const createParticipantProfile = useCallback(async (userId: string, email: string, name: string, phone: string) => {
    try {
      console.log('=== Starting participant profile creation ===');
      console.log('Input data:', { userId, email, name, phone });

      // Step 1: Create participant entry first
      console.log('Step 1: Creating participant entry...');
      const participantData = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        qr_code: `QR_${email.replace('@', '_').replace('.', '_')}_${userId.substring(0, 8)}`
      };
      
      console.log('Participant data to insert:', participantData);
      
      const { data: participant, error: participantError } = await supabase
        .from('participants')
        .insert(participantData)
        .select()
        .single();

      if (participantError) {
        console.error('❌ Error creating participant:', participantError);
        throw new Error(`Failed to create participant: ${participantError.message}`);
      }
      
      console.log('✓ Participant created successfully:', participant);

      // Step 2: Create profile with participant_id
      console.log('Step 2: Creating profile with participant_id:', participant.id);
      const profileData = {
        id: userId,
        email: email.toLowerCase().trim(),
        role: 'participant' as const,
        participant_id: participant.id
      };
      
      console.log('Profile data to upsert:', profileData);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (profileError) {
        console.error('❌ Error creating profile:', profileError);
        // Cleanup: delete participant if profile creation fails
        console.log('Cleaning up participant due to profile error...');
        await supabase.from('participants').delete().eq('id', participant.id);
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }
      
      console.log('✓ Profile created successfully:', profile);
      console.log('=== Participant profile creation completed successfully ===');
      
      // Update local state
      setProfile(profile);
      
      return { 
        success: true, 
        profile: profile, 
        participant: participant 
      };
      
    } catch (error) {
      console.error('❌ Error in createParticipantProfile:', error);
      return { error };
    }
  }, []);

  const createParticipantFromInvitation = useCallback(async (userId: string, email: string, invitationToken: string) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout: Proses registrasi terlalu lama')), 30000);
    });

    try {
      console.log('Creating participant from invitation:', { userId, email, invitationToken });
      
      const registrationPromise = (async () => {
        // Get invitation details
        const { data: invitation, error: invitationError } = await supabase
          .from('participant_invitations')
          .select('*')
          .eq('token', invitationToken)
          .eq('email', email)
          .eq('used', false)
          .maybeSingle();

        if (invitationError || !invitation) {
          console.error('Invalid or expired invitation:', invitationError);
          throw new Error('Invalid or expired invitation');
        }

        // Create participant entry
        const { data: participant, error: participantError } = await supabase
          .from('participants')
          .insert({
            name: invitation.name,
            email: invitation.email,
            phone: invitation.phone,
            qr_code: `QR_${invitation.email.replace('@', '_').replace('.', '_')}_${userId.substring(0, 8)}`
          })
          .select()
          .single();

        if (participantError) {
          console.error('Error creating participant:', participantError);
          throw participantError;
        }

        console.log('Participant created from invitation:', participant);

        // Create profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .upsert({ 
            id: userId,
            email: invitation.email,
            role: 'participant',
            participant_id: participant.id
          }, {
            onConflict: 'id'
          })
          .select()
          .single();

        if (profileError) {
          console.error('Error creating profile:', profileError);
          throw profileError;
        }

        // Mark invitation as used
        await supabase
          .from('participant_invitations')
          .update({ used: true })
          .eq('id', invitation.id);

        console.log('Participant profile created from invitation:', profileData);
        setProfile(profileData);
        
        return { success: true, profile: profileData };
      })();

      const result = await Promise.race([registrationPromise, timeoutPromise]);
      return result;
    } catch (error) {
      console.error('Error in createParticipantFromInvitation:', error);
      return { error };
    }
  }, []);

  const updateParticipant = useCallback(async (participantId: string, name: string, phone: string) => {
    try {
      console.log('Updating participant:', { participantId, name, phone });
      
      const { data, error } = await supabase
        .from('participants')
        .update({
          name: name,
          phone: phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', participantId)
        .select()
        .single();

      if (error) {
        console.error('Error updating participant:', error);
        throw error;
      }
      
      console.log('Participant updated successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Error in updateParticipant:', error);
      return { error };
    }
  }, []);

  // Memoize the returned object to prevent unnecessary re-renders
  return useMemo(() => ({
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    createAdminProfile,
    createParticipantProfile,
    createParticipantFromInvitation,
    updateParticipant,
  }), [
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    createAdminProfile,
    createParticipantProfile,
    createParticipantFromInvitation,
    updateParticipant,
  ]);
}
