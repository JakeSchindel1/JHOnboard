"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/components/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Lock, User, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (login(formData.username, formData.password)) {
      setIsLoginOpen(false);
      router.push('/onboarding');
    } else {
      setError('Invalid username or password');
    }
  };

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
                width={500}
                height={200}
                priority
                className="h-auto w-auto max-w-[500px]"
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

      {/* Login Dialog */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">Welcome Back</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <Input
                  id="username"
                  name="username"
                  placeholder="Enter username"
                  className="pl-10"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  className="pl-10"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
              Sign in
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}