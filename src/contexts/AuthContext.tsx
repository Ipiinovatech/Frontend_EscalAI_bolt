import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserLanguage: (language: 'en' | 'es') => Promise<void>;
  signUp: (email: string, password: string, metadata: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setIsLoading(false);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          if (mounted) {
            setSession(newSession);
            setUser(newSession?.user ?? null);
            setIsLoading(false);

            if (event === 'SIGNED_IN' && newSession?.user) {
              try {
                const { data: profile, error: profileError } = await supabase
                  .from('profiles')
                  .select('*, client:clients(*)')
                  .eq('id', newSession.user.id)
                  .maybeSingle();

                if (profileError && profileError.code !== 'PGRST116') {
                  console.error('Error fetching profile:', profileError);
                  throw profileError;
                }

                if (!profile) {
                  let role = 'client_agent';
                  if (newSession.user.email === 'admin@example.com') {
                    role = 'platform_admin';
                  } else if (newSession.user.email === 'supervisor@example.com') {
                    role = 'client_supervisor';
                  }

                  // Create profile
                  const { error: createProfileError } = await supabase
                    .from('profiles')
                    .insert([{
                      id: newSession.user.id,
                      role,
                      name: newSession.user.email?.split('@')[0] || 'Usuario',
                      language: 'es'
                    }]);

                  if (createProfileError) {
                    console.error('Error creating profile:', createProfileError);
                    throw createProfileError;
                  }

                  // Get the role ID
                  const { data: roleData, error: roleError } = await supabase
                    .from('user_roles')
                    .select('id')
                    .eq('name', role)
                    .single();

                  if (roleError) {
                    console.error('Error fetching role:', roleError);
                    throw roleError;
                  }

                  // Assign role
                  const { error: assignError } = await supabase
                    .from('user_role_assignments')
                    .insert([{
                      user_id: newSession.user.id,
                      role_id: roleData.id
                    }]);

                  if (assignError) {
                    console.error('Error assigning role:', assignError);
                    throw assignError;
                  }
                }

                if (newSession.user.email === 'admin@example.com') {
                  navigate('/dashboard');
                } else {
                  navigate('/tickets');
                }
              } catch (error) {
                console.error('Error in profile handling:', error);
              }
            } else if (event === 'SIGNED_OUT') {
              navigate('/login');
            }
          }
        });

        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();
  }, [navigate]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        throw new Error(`Error de autenticación: ${error.message}`);
      }

      if (!data?.user) {
        throw new Error('No se recibió información del usuario');
      }

      // Verificar si el perfil existe
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error verificando perfil:', profileError);
        throw new Error(`Error verificando perfil: ${profileError.message}`);
      }

      if (!profile) {
        console.log('Creando perfil para usuario:', data.user.id);
        // Crear perfil si no existe
        const { error: createError } = await supabase
          .from('profiles')
          .insert([{
            id: data.user.id,
            role: email === 'admin@example.com' ? 'platform_admin' : 'client_agent',
            name: email.split('@')[0],
            language: 'es',
            status: 'active'
          }]);

        if (createError) {
          console.error('Error creando perfil:', createError);
          throw new Error(`Error creando perfil: ${createError.message}`);
        }

        // Obtener el ID del rol
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('id')
          .eq('name', email === 'admin@example.com' ? 'platform_admin' : 'client_agent')
          .single();

        if (roleError) {
          console.error('Error obteniendo rol:', roleError);
          throw new Error(`Error obteniendo rol: ${roleError.message}`);
        }

        // Asignar rol
        const { error: assignError } = await supabase
          .from('user_role_assignments')
          .insert([{
            user_id: data.user.id,
            role_id: roleData.id
          }]);

        if (assignError) {
          console.error('Error asignando rol:', assignError);
          throw new Error(`Error asignando rol: ${assignError.message}`);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserLanguage = async (language: 'en' | 'es') => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ language })
        .eq('id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating language:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in signup:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUserLanguage,
    signUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};