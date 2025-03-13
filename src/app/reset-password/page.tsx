'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if we have the necessary hash params from the password reset email
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    if (!hashParams.get('access_token')) {
      setError('Invalid or expired reset link. Please request a new password reset.');
    }
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
      
      const { error } = await supabaseClient.auth.updateUser({ password });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Redirect after successful password reset
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error resetting password:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Reset Your Password</h1>

      {success ? (
        <div className="bg-green-100 text-green-700 p-4 rounded mb-4">
          <p>Password updated successfully!</p>
          <p className="mt-2">You will be redirected to the login page shortly...</p>
        </div>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
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
              minLength={6}
            />
            <p className="text-xs text-gray-500">
              Password must be at least 6 characters
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
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  );
} 