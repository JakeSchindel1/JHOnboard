'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@/components/contexts/AuthContext';
import Image from 'next/image';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isInviteMode, setIsInviteMode] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isNewUserSetup, setIsNewUserSetup] = useState(false);
  const router = useRouter();
  const { user, isNewUser } = useAuth();

  useEffect(() => {
    // First, check if this is a logged-in user who needs to set their password
    if (user && isNewUser) {
      console.log('New user detected, showing password setup form');
      setIsNewUserSetup(true);
      return;
    }

    // Otherwise, check URL parameters for tokens
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const queryParams = new URLSearchParams(window.location.search);
    
    // Check for both access_token (password reset) and token (invite)
    const accessToken = hashParams.get('access_token');
    const inviteToken = queryParams.get('token') || queryParams.get('invite');
    
    if (accessToken) {
      // This is a password reset
      setToken(accessToken);
      setIsInviteMode(false);
    } else if (inviteToken) {
      // This is an invite link
      setToken(inviteToken);
      setIsInviteMode(true);
    } else if (!isNewUserSetup) {
      // No tokens and not a new user setup - show error
      setError('Invalid or expired link. Please request a new link from your administrator.');
    }
  }, [user, isNewUser]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Use the helper function to get a valid client
      const supabaseClient = getSupabaseClient();
      
      // Only continue if we have a valid client
      if (!supabaseClient) {
        throw new Error('Authentication service unavailable');
      }
      
      let result;
      
      if (isNewUserSetup) {
        // For new users who are already logged in and just need to set password
        result = await supabaseClient.auth.updateUser({ password });
      } else if (isInviteMode && token) {
        // For invite links, we're actually just setting a new password
        // Using more permissive typing with "as any" since the token handling
        // might vary between Supabase versions
        result = await (supabaseClient.auth as any).updateUser(
          { password },
          { emailRedirectTo: window.location.origin }
        );
      } else {
        // For password reset
        result = await supabaseClient.auth.updateUser({ password });
      }

      if (result.error) {
        throw new Error(result.error.message);
      } else {
        setSuccess(true);
        
        // On success, show success message, then redirect to appropriate page
        setTimeout(() => {
          if (isNewUserSetup) {
            // After setting password, direct to onboarding
            router.push('/onboarding');
          } else {
            // For normal resets/invites, go to login
            router.push('/');
          }
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error setting password:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Determine appropriate title based on mode
  const getPageTitle = () => {
    if (isNewUserSetup) return 'Create Your Password';
    if (isInviteMode) return 'Set Your Password';
    return 'Reset Your Password';
  };

  // Determine appropriate button text
  const getButtonText = () => {
    if (loading) return 'Processing...';
    if (isNewUserSetup) return 'Create Password';
    if (isInviteMode) return 'Create Password';
    return 'Reset Password';
  };

  // Determine success message
  const getSuccessMessage = () => {
    if (isNewUserSetup) return 'Password created successfully!';
    if (isInviteMode) return 'Password created successfully!';
    return 'Password updated successfully!';
  };

  // Determine redirect message
  const getRedirectMessage = () => {
    if (isNewUserSetup) return 'You will be redirected to the onboarding form shortly...';
    return 'You will be redirected to the login page shortly...';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="mb-6 flex justify-center">
          <Image
            src="/images/JourneyHouseLogo.png" 
            alt="Journey House Logo"
            width={180}
            height={70}
            priority
            className="h-auto w-auto max-w-[180px]"
          />
        </div>

        <h1 className="text-2xl font-bold mb-6 text-center">
          {getPageTitle()}
        </h1>

        {success ? (
          <div className="bg-green-100 text-green-700 p-4 rounded mb-4">
            <p>{getSuccessMessage()}</p>
            <p className="mt-2">{getRedirectMessage()}</p>
          </div>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="password" className="block font-medium">
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
                minLength={8}
                autoComplete="new-password"
              />
              <p className="text-xs text-gray-500">
                Password must be at least 8 characters
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block font-medium">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
            >
              {getButtonText()}
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 