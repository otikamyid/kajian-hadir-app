
import { User, Session } from '@supabase/supabase-js';
import { Tables } from '@/integrations/supabase/types';

export type Profile = Tables<'profiles'>;

export interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any; user?: User }>;
  signOut: () => Promise<{ error: any }>;
  createAdminProfile: (userId: string, email: string) => Promise<{ error?: any; success?: boolean; profile?: Profile }>;
  createParticipantProfile: (userId: string, email: string, name: string, phone: string) => Promise<{ error?: any; success?: boolean; profile?: Profile; participant?: any }>;
  createParticipantFromInvitation: (userId: string, email: string, invitationToken: string) => Promise<{ error?: any; success?: boolean; profile?: Profile }>;
  updateParticipant: (participantId: string, name: string, phone: string) => Promise<{ error?: any; success?: boolean; data?: any }>;
}
