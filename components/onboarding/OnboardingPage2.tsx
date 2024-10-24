import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, UserCircle, Car } from "lucide-react";

interface FormData {
  socialSecurityNumber?: string;
  sex?: string;
  email?: string;
  driversLicenseNumber?: string;
  vehicleTagNumber?: string;
  vehicleMake?: string;
  vehicleModel?: string;
}

interface OnboardingPage2Props {
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
}

export default function OnboardingPage2({
  formData = {},
  handleInputChange,
  handleSelectChange
}: OnboardingPage2Props) {
  const [showSSN, setShowSSN] = useState(false);

  const {
    socialSecurityNumber = '',
    sex = '',
    email = '',
    driversLicenseNumber = '',
    vehicleTagNumber = '',
    vehicleMake = '',
    vehicleModel = ''
  } = formData;

  const handleSSNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/[^\d]/g, '');
    value = value.slice(0, 9);
    
    if (value.length > 5) {
      value = `${value.slice(0, 3)}-${value.slice(3, 5)}-${value.slice(5)}`;
    } else if (value.length > 3) {
      value = `${value.slice(0, 3)}-${value.slice(3)}`;
    }

    const newEvent = {
      ...e,
      target: {
        ...e.target,
        name: 'socialSecurityNumber',
        value: value
      }
    };

    handleInputChange(newEvent);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">PERSONAL DETAILS</h2>
        <p className="text-sm text-gray-600">Please complete all required fields</p>
      </div>

      {/* Identification Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserCircle className="h-5 w-5 text-blue-500" />
            Identification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* SSN */}
            <div className="space-y-2">
              <Label htmlFor="socialSecurityNumber" className="text-base font-medium">
                Social Security Number
              </Label>
              <div className="relative">
                <Input
                  id="socialSecurityNumber"
                  name="socialSecurityNumber"
                  type={showSSN ? "text" : "password"}
                  value={socialSecurityNumber}
                  onChange={handleSSNChange}
                  placeholder="XXX-XX-XXXX"
                  className="pr-10 bg-white"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowSSN(!showSSN)}
                >
                  {showSSN ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-gray-500">Enter your 9-digit SSN</p>
            </div>

            {/* Sex */}
            <div className="space-y-2">
              <Label htmlFor="sex" className="text-base font-medium">Sex</Label>
              <Select 
                value={sex} 
                onValueChange={(value) => handleSelectChange('sex', value)}
              >
                <SelectTrigger id="sex" className="bg-white">
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">Select your biological sex</p>
            </div>

            {/* Driver's License */}
            <div className="space-y-2">
              <Label htmlFor="driversLicenseNumber" className="text-base font-medium">
                Driver&apos;s License Number
              </Label>
              <Input
                id="driversLicenseNumber"
                name="driversLicenseNumber"
                value={driversLicenseNumber}
                onChange={handleInputChange}
                className="bg-white"
                required
              />
              <p className="text-sm text-gray-500">Your current driver&apos;s license number</p>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={handleInputChange}
                className="bg-white"
                required
              />
              <p className="text-sm text-gray-500">Your primary email address</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Car className="h-5 w-5 text-green-500" />
            Vehicle Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Vehicle Make */}
            <div className="space-y-2">
              <Label htmlFor="vehicleMake" className="text-base font-medium">
                Vehicle Make
              </Label>
              <Input
                id="vehicleMake"
                name="vehicleMake"
                value={vehicleMake}
                onChange={handleInputChange}
                className="bg-white"
                placeholder="e.g., Toyota"
              />
              <p className="text-sm text-gray-500">Brand of your vehicle</p>
            </div>

            {/* Vehicle Model */}
            <div className="space-y-2">
              <Label htmlFor="vehicleModel" className="text-base font-medium">
                Vehicle Model
              </Label>
              <Input
                id="vehicleModel"
                name="vehicleModel"
                value={vehicleModel}
                onChange={handleInputChange}
                className="bg-white"
                placeholder="e.g., Camry"
              />
              <p className="text-sm text-gray-500">Model of your vehicle</p>
            </div>

            {/* Vehicle Tag */}
            <div className="space-y-2">
              <Label htmlFor="vehicleTagNumber" className="text-base font-medium">
                License Plate Number
              </Label>
              <Input
                id="vehicleTagNumber"
                name="vehicleTagNumber"
                value={vehicleTagNumber}
                onChange={handleInputChange}
                className="bg-white"
                placeholder="e.g., ABC-1234"
              />
              <p className="text-sm text-gray-500">Your vehicle&apos;s license plate number</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}