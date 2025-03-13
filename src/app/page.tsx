"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/components/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { LoginModal } from '@/components/login/LoginModal';
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { user, isNewUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
    
    // Only redirect to onboarding if user is logged in AND not a new user who needs to set password
    if (user && !isNewUser) {
      console.log('User is authenticated and has set password - redirecting to onboarding');
      router.push('/onboarding');
    }
  }, [user, isNewUser, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      {/* Main Content */}
      <main className="min-h-screen flex flex-col items-center justify-center p-4 relative">
        <div className={`flex flex-col items-center space-y-12 max-w-4xl w-full transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          {/* Logo Section with Link */}
          <div className="flex justify-center items-center w-full">
            <Link 
              href="https://journeyhouserecovery.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer transition-transform duration-300 hover:scale-105"
            >
              <Image
                src="/images/JourneyHouseLogo.png"
                alt="Journey House Logo"
                width={250}
                height={100}
                priority
                className="h-auto w-auto max-w-[250px]"
              />
            </Link>
          </div>

          {/* Welcome Text */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-800">Journey House Participant Intake</h1>
            <p className="text-xl text-gray-600 max-w-2xl">
            A holistic, peer recovery program teaching individuals to live a recovery lifestyle and achieve a thriving life.
            </p>
          </div>

          {/* CTA Button */}
          <Button 
            size="lg" 
            className="w-full max-w-sm text-lg py-6 bg-teal-600 hover:bg-teal-700 transform hover:scale-105 transition-all duration-300 shadow-lg group"
            onClick={() => setIsLoginOpen(true)}
          >
            Begin New Intake
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </main>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
    </div>
  );
}