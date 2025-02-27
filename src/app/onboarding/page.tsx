"use client";

import { useAuth } from '@/contexts/AuthContext';
import OnboardingForm from '@/components/onboarding/OnboardingForm';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // If loading, show loading state
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="flex justify-end px-8 mb-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {user?.email}
          </span>
          <button 
            onClick={logout}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Log out
          </button>
        </div>
      </div>
      <OnboardingForm />
    </div>
  );
}