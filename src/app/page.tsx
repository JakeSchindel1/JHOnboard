"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/components/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { LoginModal } from '@/components/login/LoginModal';
import { ArrowRight, LogOut, FileText, Plus, Users, Settings } from "lucide-react";

export default function Hub() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { user, isNewUser, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Handle logout button click
  const handleLogout = async () => {
    await logout();
  };

  // Handle navigation to different sections
  const handleNewIntake = () => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    router.push('/onboarding');
  };

  const handleViewApplications = () => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    router.push('/admin/applications');
  };

  const handleManageLegalText = () => {
    if (!user) {
      setIsLoginOpen(true);
      return;
    }
    router.push('/admin/legal-management');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      {/* Sign Out Button - Only shown when user is logged in */}
      {user && (
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
      )}
      
      {/* Main Content */}
      <main className="min-h-screen flex flex-col items-center justify-center p-4 relative">
        <div className={`flex flex-col items-center space-y-12 max-w-6xl w-full transition-all duration-1000 ${
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
            <h1 className="text-4xl font-bold text-gray-800">Journey House Administration Hub</h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Manage participant intakes, view applications, and maintain legal documentation
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-3 gap-6 w-full max-w-4xl">
            {/* New Intake Card */}
            <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer" onClick={handleNewIntake}>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-teal-100 rounded-full w-fit group-hover:bg-teal-200 transition-colors">
                  <Plus className="h-8 w-8 text-teal-600" />
                </div>
                <CardTitle className="text-xl">Start New Intake</CardTitle>
                <CardDescription>Begin a new participant onboarding process</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-teal-600 hover:bg-teal-700 group-hover:scale-105 transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNewIntake();
                  }}
                >
                  Begin Intake
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* View Applications Card */}
            <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer" onClick={handleViewApplications}>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit group-hover:bg-blue-200 transition-colors">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">View Applications</CardTitle>
                <CardDescription>Review submitted participant applications and generate PDFs</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 group-hover:scale-105 transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewApplications();
                  }}
                >
                  View Applications
                  <Users className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Legal Text Management Card */}
            <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer" onClick={handleManageLegalText}>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-amber-100 rounded-full w-fit group-hover:bg-amber-200 transition-colors">
                  <Settings className="h-8 w-8 text-amber-600" />
                </div>
                <CardTitle className="text-xl">Manage Legal Text</CardTitle>
                <CardDescription>Edit and version control legal agreements and forms</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full border-amber-600 text-amber-600 hover:bg-amber-50 group-hover:scale-105 transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleManageLegalText();
                  }}
                >
                  Manage Legal Text
                  <Settings className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <div className="text-center max-w-2xl">
            <p className="text-gray-600">
              {user ? (
                <>Welcome back! Choose an option above to get started.</>
              ) : (
                <>Please sign in to access the administration tools.</>
              )}
            </p>
          </div>
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