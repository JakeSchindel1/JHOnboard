import { createClient } from '@supabase/supabase-js';

// Define hardcoded fallbacks - ONLY FOR STATIC RENDERING
// These will only be used during static build time and won't expose credentials in the final bundle
const FALLBACK_SUPABASE_URL = 'https://fallback-url-for-build-time-only.supabase.co';
const FALLBACK_SUPABASE_KEY = 'fallback-key-for-build-time-only';

// Function to determine if we're in a production environment
const isProd = () => {
  return process.env.NODE_ENV === 'production';
};

// Function to determine if we're in a build/static render context
const isStaticBuild = () => {
  return typeof window === 'undefined' && process.env.NEXT_PHASE === 'phase-production-build';
};

// Get actual Supabase URL and anon key from environment variables
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// During static build, if values are empty, use fallbacks 
// This is only for build-time rendering and won't expose in client
if ((isStaticBuild() || !supabaseUrl) && !isProd()) {
  console.log('Using fallback Supabase credentials for static build or missing env variables');
  supabaseUrl = FALLBACK_SUPABASE_URL;
  supabaseAnonKey = FALLBACK_SUPABASE_KEY;
}

// Create a client only if we have URL and key, otherwise null
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: typeof window !== 'undefined', // Only persist in browser
      }
    })
  : null;

// If supabase client couldn't be created but we need one for client-side, 
// create a dummy/mock client that returns empty values
const createDummyClient = () => {
  // Return a mock client with the same API shape but no-op functions
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: null, error: { message: 'Auth not available' } }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      resetPasswordForEmail: async () => ({ error: null }),
      updateUser: async () => ({ error: { message: 'Auth not available' } }),
    },
    // Add other APIs as needed
  };
};

// Type for the user profile in your database
export type Profile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
};

// You can add more helper functions here later as needed
export const getUser = async () => {
  if (!supabase) {
    console.warn('Supabase client not initialized, returning null user');
    return null;
  }
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const getSession = async () => {
  if (!supabase) {
    console.warn('Supabase client not initialized, returning null session');
    return null;
  }
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

// Helper function to get a valid client for components
export const getSupabaseClient = () => {
  if (typeof window === 'undefined') {
    // We're in a server context
    return supabase || null;
  }
  
  // We're in a browser context
  if (!supabase) {
    console.warn('No Supabase client available, using dummy client');
    // Use a dummy client for components that expect a client
    return createDummyClient();
  }
  
  return supabase;
}; 