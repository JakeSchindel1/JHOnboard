// app/page.tsx
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/components/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Lock, User } from "lucide-react";

export default function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const { login } = useAuth();
  const router = useRouter();

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="flex flex-col items-center space-y-8 max-w-md w-full">
        <div className="w-64">
          <Image
            src="/images/JourneyHouseLogo.png"
            alt="Journey House Logo"
            width={200}
            height={80}
            priority
            className="h-auto w-auto max-w-[200px]"
          />
        </div>

        <Button 
          size="lg" 
          className="w-full max-w-sm text-lg py-6"
          onClick={() => setIsLoginOpen(true)}
        >
          New Intake
        </Button>
      </div>

      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Login Required</DialogTitle>
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
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}