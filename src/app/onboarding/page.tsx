"use client";

import React from 'react';
import OnboardingForm from '@/components/onboarding/OnboardingForm';
import ProtectedRoute from '@/components/layouts/ProtectedRoute';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/components/contexts/AuthContext';
import { LogOut } from "lucide-react";
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <ProtectedRoute>
      {/* Sign Out Button */}
      <div className="absolute top-4 right-4 z-10">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout}
          className="flex items-center gap-2 bg-white shadow-md hover:bg-gray-100"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
      
      <OnboardingForm />
    </ProtectedRoute>
  );
}