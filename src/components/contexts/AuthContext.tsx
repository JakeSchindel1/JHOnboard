"use client";  // Add this at the top!

// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session, createClient } from '@supabase/supabase-js';

// Define the shape of our auth context
type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
};

// Create the context with undefined as default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This is the provider component that wraps your app
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to get a valid Supabase client
  const getSupabaseClient = () => {
    return supabase || createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
  };

  // Check for session when the component mounts
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      setLoading(true);
      
      try {
        const supabaseClient = getSupabaseClient();
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error retrieving session:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Set up auth listener for future changes
    const supabaseClient = getSupabaseClient();
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const login = async (email: string, password: string) => {
    try {
      const supabaseClient = getSupabaseClient();
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });
      
      return { error: error ? error.message : null };
    } catch (error) {
      console.error('Login error:', error);
      return { error: 'An unexpected error occurred during login' };
    }
  };

  // Sign out
  const logout = async () => {
    try {
      const supabaseClient = getSupabaseClient();
      await supabaseClient.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const supabaseClient = getSupabaseClient();
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      return { error: error ? error.message : null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: 'An unexpected error occurred during password reset' };
    }
  };

  // Create the value object for the context
  const value = {
    user,
    session,
    loading,
    login,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};