
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from './types';

export function useProfileOperations() {
  const createAdminProfile = async (userId: string, email: string) => {
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
      
      return { success: true, profile: profileData };
    } catch (error) {
      console.error('Error in createAdminProfile:', error);
      return { error };
    }
  };

  const createParticipantProfile = async (userId: string, email: string, name: string, phone: string) => {
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
      
      return { 
        success: true, 
        profile: profile, 
        participant: participant 
      };
      
    } catch (error) {
      console.error('❌ Error in createParticipantProfile:', error);
      return { error };
    }
  };

  const createParticipantFromInvitation = async (userId: string, email: string, invitationToken: string) => {
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
        
        return { success: true, profile: profileData };
      })();

      const result = await Promise.race([registrationPromise, timeoutPromise]);
      return result;
    } catch (error) {
      console.error('Error in createParticipantFromInvitation:', error);
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
  };

  return {
    createAdminProfile,
    createParticipantProfile,
    createParticipantFromInvitation,
    updateParticipant,
  };
}
