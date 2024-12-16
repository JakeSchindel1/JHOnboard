// app/success/page.tsx

"use client"

import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useWindowSize } from 'react-use';

// Dynamically import Confetti to avoid SSR issues
const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

export default function SuccessPage() {
  const router = useRouter();
  const { width, height } = useWindowSize();
  const [isConfettiActive, setIsConfettiActive] = useState(true);

  // Custom colors for confetti (teal and green shades)
  const colors = [
    '#14B8A6', // teal-500
    '#0D9488', // teal-600
    '#0F766E', // teal-700
    '#22C55E', // green-500
    '#16A34A', // green-600
    '#15803D', // green-700
  ];

  // Stop confetti after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConfettiActive(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      {isConfettiActive && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={200}
          colors={colors}
          recycle={true}
        />
      )}
      
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <Image
            src="/images/JourneyHouseLogo.png"
            alt="Journey House Logo"
            width={200}
            height={80}
            className="mx-auto"
            priority
          />
        </div>
        
        <h1 className="text-3xl font-bold text-teal-600 mb-4">
          Form Submitted Successfully!
        </h1>
        
        <p className="text-gray-600 mb-8">
          Thank you for completing the onboarding process. Your information has been successfully submitted.
        </p>

        <Button
          onClick={() => router.push('/')}
          className="w-full bg-teal-600 hover:bg-teal-700"
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
}