"use client";  // Add this at the top!

// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, getSupabaseClient } from '@/lib/supabase';
import { User, Session, createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

// Define the shape of our auth context
type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  isNewUser: boolean;
};

// Create the context with undefined as default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This is the provider component that wraps your app
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const router = useRouter();

  // Use the getSupabaseClient helper instead of direct access
  // This will never be null because the helper returns a dummy client if needed
  const supabaseClient = getSupabaseClient() as NonNullable<ReturnType<typeof getSupabaseClient>>;

  // Check for session when the component mounts
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      setLoading(true);
      
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check if this is a new user who hasn't set their password
        // Supabase doesn't provide a direct way to check this, but we can use metadata
        // Users created through invites often have certain patterns
        if (session?.user) {
          // Check if user was created through invite
          const userCreatedAt = new Date(session.user.created_at);
          const now = new Date();
          const lastPasswordUpdate = session.user.last_sign_in_at 
            ? new Date(session.user.last_sign_in_at) 
            : null;
            
          // If user was created very recently (within last few hours) and:
          // 1. Either has never signed in, or
          // 2. Just signed in for the first time
          // Then consider them a new user who needs to set password
          const isRecentlyCreated = now.getTime() - userCreatedAt.getTime() < 24 * 60 * 60 * 1000; // 24 hours
          const isFirstSignIn = !lastPasswordUpdate || 
                              (lastPasswordUpdate.getTime() - userCreatedAt.getTime() < 5 * 60 * 1000); // Within 5 minutes of creation
                              
          if (isRecentlyCreated && isFirstSignIn) {
            console.log('New user detected - should set password');
            setIsNewUser(true);
            // Redirect to password setup page
            router.push('/reset-password');
          } else {
            setIsNewUser(false);
          }
        }
      } catch (error) {
        console.error("Error retrieving session:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Set up auth listener for future changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle sign in event specifically
        if (event === 'SIGNED_IN' && session?.user) {
          // Similar logic as above to detect new users
          const userCreatedAt = new Date(session.user.created_at);
          const now = new Date();
          const timeSinceCreation = now.getTime() - userCreatedAt.getTime();
          
          // If this is a very recent account (created in last few hours)
          if (timeSinceCreation < 24 * 60 * 60 * 1000) {
            console.log('New sign-in for recently created account - checking if password needs to be set');
            setIsNewUser(true);
            // Redirect to password setup page
            router.push('/reset-password');
          } else {
            setIsNewUser(false);
          }
        }
        
        setLoading(false);
      }
    );

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [supabaseClient, router]);

  // Sign in with email and password
  const login = async (email: string, password: string) => {
    try {
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
      await supabaseClient.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
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
    isNewUser,
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