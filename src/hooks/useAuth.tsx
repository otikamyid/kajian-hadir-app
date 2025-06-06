
import React, { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

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
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (mounted) {
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (mounted) {
            setProfile(profileData);
          }
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
    // Check if it's a demo account and create it if it doesn't exist
    if (email === 'admin@kajian.com' || email === 'peserta@kajian.com') {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // If user doesn't exist, create it
      if (signInError && signInError.message.includes('Invalid login credentials')) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              name: email === 'admin@kajian.com' ? 'Admin Demo' : 'Peserta Demo',
              phone: email === 'admin@kajian.com' ? '+628123456789' : '+628987654321'
            }
          }
        });
        
        if (signUpError) {
          return { error: signUpError };
        }
        
        // After signup, wait a bit then update profile with correct role
        setTimeout(async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Update profile
            await supabase
              .from('profiles')
              .upsert({ 
                id: user.id,
                email: email,
                role: email === 'admin@kajian.com' ? 'admin' : 'participant'
              }, {
                onConflict: 'id'
              });

            // Create participant entry
            await supabase
              .from('participants')
              .insert({
                name: email === 'admin@kajian.com' ? 'Admin Demo' : 'Peserta Demo',
                email: email,
                phone: email === 'admin@kajian.com' ? '+628123456789' : '+628987654321',
                qr_code: `QR_${email.replace('@', '_')}_${user.id.substring(0, 8)}`
              });
          }
        }, 1000);
        
        // Now try to sign in again
        return await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }
      
      return { error: signInError };
    }
    
    // Regular sign in for non-demo accounts
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
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
  };
}
