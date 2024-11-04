import React, { useState, useCallback } from 'react';
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
  handleVehicleToggle: (hasNoVehicle: boolean) => void;
}

export default function OnboardingPage2({
  formData = {},
  handleInputChange,
  handleSelectChange,
  handleVehicleToggle
}: OnboardingPage2Props) {
  const [showSSN, setShowSSN] = useState(false);
  
  // Derive noCar state from form data
  const noCar = formData.vehicleMake === 'null' && 
                formData.vehicleModel === 'null' && 
                formData.vehicleTagNumber === 'null';

  const {
    socialSecurityNumber = '',
    sex = '',
    email = '',
    driversLicenseNumber = '',
    vehicleTagNumber = '',
    vehicleMake = '',
    vehicleModel = ''
  } = formData;

  // Memoized handler for SSN formatting
  const handleSSNChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d]/g, '').slice(0, 9);
    
    if (value.length > 5) {
      value = `${value.slice(0, 3)}-${value.slice(3, 5)}-${value.slice(5)}`;
    } else if (value.length > 3) {
      value = `${value.slice(0, 3)}-${value.slice(3)}`;
    }

    handleInputChange({
      target: {
        name: 'socialSecurityNumber',
        value
      }
    } as React.ChangeEvent<HTMLInputElement>);
  }, [handleInputChange]);

  // Memoized handler for showing/hiding SSN
  const toggleSSNVisibility = useCallback(() => {
    setShowSSN(prev => !prev);
  }, []);

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
                  onClick={toggleSSNVisibility}
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
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Car className="h-5 w-5 text-green-500" />
              Vehicle Information
            </CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="no-car" className="text-sm font-medium">
                No Vehicle
              </Label>
              <button
                id="no-car"
                type="button"
                role="switch"
                aria-checked={noCar}
                onClick={() => handleVehicleToggle(!noCar)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                  noCar ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    noCar ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
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
                value={vehicleMake === 'null' ? '' : vehicleMake}
                onChange={handleInputChange}
                className={`bg-white ${noCar ? 'opacity-50' : ''}`}
                placeholder="e.g., Toyota"
                disabled={noCar}
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
                value={vehicleModel === 'null' ? '' : vehicleModel}
                onChange={handleInputChange}
                className={`bg-white ${noCar ? 'opacity-50' : ''}`}
                placeholder="e.g., Camry"
                disabled={noCar}
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
                value={vehicleTagNumber === 'null' ? '' : vehicleTagNumber}
                onChange={handleInputChange}
                className={`bg-white ${noCar ? 'opacity-50' : ''}`}
                placeholder="e.g., ABC-1234"
                disabled={noCar}
              />
              <p className="text-sm text-gray-500">Your vehicle&apos;s license plate number</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}