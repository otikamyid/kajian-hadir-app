
import React, { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type Participant = Tables<'participants'>;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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

    const fetchProfile = async (userId: string) => {
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
        
        if (mounted) {
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error in fetchProfile:', error);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('Signing in with email:', email);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Sign in error:', error);
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string) => {
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
    return { error };
  };

  const createParticipantProfile = async (userId: string, email: string, name: string, phone: string, role: 'admin' | 'participant' = 'participant') => {
    try {
      console.log('Creating participant profile:', { userId, email, name, phone, role });
      
      let participantId = null;
      
      // Only create participant entry for participant role
      if (role === 'participant') {
        console.log('Creating participant entry for participant role');
        const { data: participant, error: participantError } = await supabase
          .from('participants')
          .insert({
            name: name,
            email: email,
            phone: phone,
            qr_code: `QR_${email.replace('@', '_').replace('.', '_')}_${userId.substring(0, 8)}`
          })
          .select()
          .single();

        if (participantError) {
          console.error('Error creating participant:', participantError);
          throw participantError;
        }
        
        console.log('Participant created:', participant);
        participantId = participant.id;
      } else {
        console.log('Skipping participant creation for admin role');
      }

      // Create/update profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert({ 
          id: userId,
          email: email,
          role: role,
          participant_id: participantId
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

      if (profileError) {
        console.error('Error creating profile:', profileError);
        throw profileError;
      }
      
      console.log('Profile created/updated successfully:', profileData);
      
      // Update local state immediately
      setProfile(profileData);
      
      return { success: true, profile: profileData };
    } catch (error) {
      console.error('Error in createParticipantProfile:', error);
      return { error };
    }
  };

  const updateParticipant = async (participantId: string, name: string, phone: string) => {
    try {
      console.log('Updating participant:', { participantId, name, phone });
      
      const { data, error } = await supabase
        .from('participants')
        .update({
          name: name,
          phone: phone,
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
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      setProfile(null);
    }
    return { error };
  };

  return {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    createParticipantProfile,
    updateParticipant,
  };
}
