import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// For server components and API routes
export const getServerAuthUser = async () => {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
};

// For direct server actions
export const getAuthUser = async (cookieStore: any) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      auth: {
        persistSession: false
      }
    }
  );
  
  // Set cookies manually before making auth call
  const accessToken = cookieStore.get('sb-access-token')?.value;
  const refreshToken = cookieStore.get('sb-refresh-token')?.value;
  
  if (accessToken && refreshToken) {
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
  }
  
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}; 