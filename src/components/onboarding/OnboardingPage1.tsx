import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UserCircle, Home } from "lucide-react";
import { FormData, OnboardingPageProps } from '@/types';

const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-base font-medium">
    {children} <span className="text-red-500">*</span>
  </span>
);

export default function OnboardingPage1({
  formData,
  handleInputChange,
  handleSelectChange
}: OnboardingPageProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">RESIDENT INFORMATION</h2>
        <p className="text-sm text-gray-600">Fields marked with <span className="text-red-500">*</span> are required</p>
      </div>

      {/* Personal Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserCircle className="h-5 w-5 text-blue-500" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">
                <RequiredLabel>First Name</RequiredLabel>
              </Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="bg-white"
                placeholder="Enter your first name"
              />
              <p className="text-sm text-gray-500">
                Your legal first name
              </p>
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">
                <RequiredLabel>Last Name</RequiredLabel>
              </Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="bg-white"
                placeholder="Enter your last name"
              />
              <p className="text-sm text-gray-500">
                Your legal last name
              </p>
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">
                <RequiredLabel>Date of Birth</RequiredLabel>
              </Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
                className="bg-white"
              />
              <p className="text-sm text-gray-500">
                Your date of birth
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Housing Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Home className="h-5 w-5 text-green-500" />
            Housing Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Intake Date */}
            <div className="space-y-2">
              <Label htmlFor="intakeDate">
                <RequiredLabel>Intake Date</RequiredLabel>
              </Label>
              <Input
                id="intakeDate"
                name="intakeDate"
                type="date"
                value={formData.intakeDate}
                onChange={handleInputChange}
                required
                className="bg-white"
              />
              <p className="text-sm text-gray-500">
                Date of admission to Journey House
              </p>
            </div>

            {/* Housing Location */}
            <div className="space-y-2">
              <Label htmlFor="housingLocation">
                <RequiredLabel>Housing Location</RequiredLabel>
              </Label>
              <Select 
                value={formData.housingLocation} 
                onValueChange={(value) => handleSelectChange('housingLocation', value)}
                required
              >
                <SelectTrigger id="housingLocation" className="bg-white">
                  <SelectValue placeholder="Select housing location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hawthorne">Hawthorne</SelectItem>
                  <SelectItem value="cottage">Cottage</SelectItem>
                  <SelectItem value="packard">Packard</SelectItem>
                  <SelectItem value="pathfinder">Pathfinder</SelectItem>
                  <SelectItem value="sherwin">Sherwin</SelectItem>
                  <SelectItem value="colebrook">Colebrook</SelectItem>
                  <SelectItem value="broad_meadows">Broad Meadows</SelectItem>
                  <SelectItem value="lakeside">Lakeside</SelectItem>
                  <SelectItem value="sleepy_hollow">Sleepy Hollow</SelectItem>
                  <SelectItem value="stoneman">Stoneman</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                Select your assigned housing location
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}