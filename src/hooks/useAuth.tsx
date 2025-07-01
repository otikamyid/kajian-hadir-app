
import { useAuthState } from './auth/useAuthState';
import { useAuthOperations } from './auth/useAuthOperations';
import { useProfileOperations } from './auth/useProfileOperations';
import { UseAuthReturn } from './auth/types';

export function useAuth(): UseAuthReturn {
  const { user, session, profile, loading, setProfile } = useAuthState();
  const { signIn, signUp, signOut } = useAuthOperations();
  const { 
    createAdminProfile, 
    createParticipantProfile, 
    createParticipantFromInvitation, 
    updateParticipant 
  } = useProfileOperations();

  // Wrap profile operations to update local state
  const wrappedCreateAdminProfile = async (userId: string, email: string) => {
    const result = await createAdminProfile(userId, email);
    if ('success' in result && result.success && 'profile' in result && result.profile) {
      setProfile(result.profile);
    }
    return result;
  };

  const wrappedCreateParticipantProfile = async (userId: string, email: string, name: string, phone: string) => {
    const result = await createParticipantProfile(userId, email, name, phone);
    if ('success' in result && result.success && 'profile' in result && result.profile) {
      setProfile(result.profile);
    }
    return result;
  };

  const wrappedCreateParticipantFromInvitation = async (userId: string, email: string, invitationToken: string) => {
    const result = await createParticipantFromInvitation(userId, email, invitationToken);
    if ('success' in result && result.success && 'profile' in result && result.profile) {
      setProfile(result.profile);
    }
    return result;
  };

  const wrappedSignOut = async () => {
    const result = await signOut();
    if (!result.error) {
      setProfile(null);
    }
    return result;
  };

  return {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut: wrappedSignOut,
    createAdminProfile: wrappedCreateAdminProfile,
    createParticipantProfile: wrappedCreateParticipantProfile,
    createParticipantFromInvitation: wrappedCreateParticipantFromInvitation,
    updateParticipant,
  };
}
