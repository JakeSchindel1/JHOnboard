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
  // Track if we've already redirected to password reset
  const [hasRedirectedToPasswordReset, setHasRedirectedToPasswordReset] = useState(false);
  // Keep track of sign-in source to prevent redirect loops
  const [signInSource, setSignInSource] = useState<string | null>(null);
  const router = useRouter();

  // Use the getSupabaseClient helper instead of direct access
  // This will never be null because the helper returns a dummy client if needed
  const supabaseClient = getSupabaseClient() as NonNullable<ReturnType<typeof getSupabaseClient>>;

  // Function to check if a user needs to set password
  const checkIfNeedsPasswordReset = (user: User): boolean => {
    // Extract URL parameters to see if this is a password reset flow
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      // If we're already on the reset password page, don't redirect again
      if (window.location.pathname === '/reset-password') {
        return false;
      }
      
      // If URL contains password reset tokens, don't redirect again
      if (urlParams.has('token') || urlParams.has('invite') || hashParams.has('access_token')) {
        return false;
      }
    }
    
    // Check if user metadata indicates they came from an invite or password reset
    const userMetadata = user.user_metadata || {};
    
    // If session already contains a sign-in event, user has authenticated before
    if (user.last_sign_in_at && signInSource !== 'manual_login') {
      return false;
    }
    
    // Check for invite specific flags in metadata
    const isInvitedUser = Boolean(
      userMetadata.invited ||
      userMetadata.invitation_sent_at
    );
    
    // If this is a brand new account created within last hour
    const userCreatedAt = new Date(user.created_at);
    const now = new Date();
    const minutesSinceCreation = (now.getTime() - userCreatedAt.getTime()) / (1000 * 60);
    
    // Only redirect very new accounts (within 60 minutes) that:
    // 1. Have never signed in before, OR
    // 2. Are clearly invite-based accounts 
    return (minutesSinceCreation < 60 && !user.last_sign_in_at) || isInvitedUser;
  }

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
        if (session?.user && !hasRedirectedToPasswordReset) {
          const needsPasswordReset = checkIfNeedsPasswordReset(session.user);
          
          setIsNewUser(needsPasswordReset);
          
          if (needsPasswordReset) {
            console.log('New user detected - redirecting to password setup');
            setHasRedirectedToPasswordReset(true);
            router.push('/reset-password');
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
        
        // Only handle certain events that might require password reset
        if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
          // Only check for password reset needs if we haven't already redirected
          if (!hasRedirectedToPasswordReset) {
            const needsPasswordReset = checkIfNeedsPasswordReset(session.user);
            
            setIsNewUser(needsPasswordReset);
            
            if (needsPasswordReset) {
              console.log('User needs to set password - redirecting to password setup');
              setHasRedirectedToPasswordReset(true);
              router.push('/reset-password');
            }
          }
        } else if (event === 'SIGNED_OUT') {
          // Reset flags when user signs out
          setIsNewUser(false);
          setHasRedirectedToPasswordReset(false);
          setSignInSource(null);
        }
        
        setLoading(false);
      }
    );

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [supabaseClient, router, hasRedirectedToPasswordReset]);

  // Sign in with email and password
  const login = async (email: string, password: string) => {
    try {
      // Set source to track this was a manual login
      setSignInSource('manual_login');
      
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
      // Reset flags
      setIsNewUser(false);
      setHasRedirectedToPasswordReset(false);
      setSignInSource(null);
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