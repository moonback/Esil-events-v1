import { supabase } from './supabaseClient';
import { User, Session } from '@supabase/supabase-js';

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

export const refreshSession = async () => {
  const { data: { session }, error } = await supabase.auth.refreshSession();
  if (error) throw error;
  return session;
};

export const signIn = async (email: string, password: string): Promise<{ user: User | null; session: Session | null }> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const register = async (email: string, password: string): Promise<{ user: User | null; session: Session | null }> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  if (data.user) {
    // Créer un profil administrateur pour le nouvel utilisateur
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ id: data.user.id, role: 'admin' }]);

    if (profileError) throw profileError;
  }

  return data;
};

export const isAdmin = async (): Promise<boolean> => {
  const session = await getSession();
  if (!session?.user) return false;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();
    
  if (error || !data) return false;
  return data.role === 'admin';
};
