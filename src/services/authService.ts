import { supabase } from '../lib/supabase';
import { User, UserRole } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No user data returned');

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select(`
        *,
        client:clients(id, name)
      `)
      .eq('id', authData.user.id)
      .single();

    if (profileError) throw profileError;
    if (!profile) throw new Error('Profile not found');

    // Validate role based on email
    let role = profile.role as UserRole;
    if (email === 'ia@example.com') {
      role = UserRole.CLIENT;
    } else if (email === 'ejecutivo@example.com') {
      role = UserRole.AGENT;
    } else if (email === 'supervisor@example.com') {
      role = UserRole.SUPERVISOR;
    }

    return {
      id: authData.user.id,
      email: authData.user.email!,
      name: profile.name,
      role,
      client: profile.client,
      avatar_url: profile.avatar_url,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    };
  },

  async register(email: string, password: string, name: string, role: UserRole, clientId?: number): Promise<User> {
    // Validate role based on email
    let finalRole = role;
    if (email === 'ia@example.com') {
      finalRole = UserRole.CLIENT;
    } else if (email === 'ejecutivo@example.com') {
      finalRole = UserRole.AGENT;
    } else if (email === 'supervisor@example.com') {
      finalRole = UserRole.SUPERVISOR;
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No user data returned');

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        name,
        role: finalRole,
        client_id: clientId,
        avatar_url: null
      })
      .select(`
        *,
        client:clients(id, name)
      `)
      .single();

    if (profileError) throw profileError;
    if (!profile) throw new Error('Profile not created');

    return {
      id: authData.user.id,
      email: authData.user.email!,
      name: profile.name,
      role: finalRole,
      client: profile.client,
      avatar_url: profile.avatar_url,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    };
  },

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError) throw authError;
    if (!authUser) return null;

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select(`
        *,
        client:clients(id, name)
      `)
      .eq('id', authUser.id)
      .single();

    if (profileError) throw profileError;
    if (!profile) return null;

    // Validate role based on email
    let role = profile.role as UserRole;
    if (authUser.email === 'ia@example.com') {
      role = UserRole.CLIENT;
    } else if (authUser.email === 'ejecutivo@example.com') {
      role = UserRole.AGENT;
    } else if (authUser.email === 'supervisor@example.com') {
      role = UserRole.SUPERVISOR;
    }

    return {
      id: authUser.id,
      email: authUser.email!,
      name: profile.name,
      role,
      client: profile.client,
      avatar_url: profile.avatar_url,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    };
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select(`
        *,
        client:clients(id, name)
      `)
      .single();

    if (profileError) throw profileError;
    if (!profile) throw new Error('Profile not found');

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role as UserRole,
      client: profile.client,
      avatar_url: profile.avatar_url,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    };
  }
}; 