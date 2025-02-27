"use client";

import OnboardingForm from '@/components/onboarding/OnboardingForm';
import ProtectedRoute from '@/components/layouts/ProtectedRoute';

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <OnboardingForm />
    </ProtectedRoute>
  );
}