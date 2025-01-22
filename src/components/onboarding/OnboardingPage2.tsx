import React, { useState, useCallback } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, UserCircle, Car } from "lucide-react";
import { OnboardingPage2Props, HealthStatus } from '@/types';

const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-base font-medium">
    {children} <span className="text-red-500">*</span>
  </span>
);

export default function OnboardingPage2({
  formData,
  handleInputChange,
  handleSelectChange,
  handleVehicleToggle,
  handleHealthStatusChange
}: OnboardingPage2Props) {
  const [showSSN, setShowSSN] = useState(false);
  
  const noCar = !formData.vehicle || (
    !formData.vehicle.make && 
    !formData.vehicle.model && 
    !formData.vehicle.tagNumber
  );

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

  const toggleSSNVisibility = useCallback(() => {
    setShowSSN(prev => !prev);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">PERSONAL DETAILS</h2>
        <p className="text-sm text-gray-600">Fields marked with <span className="text-red-500">*</span> are required</p>
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
              <Label htmlFor="socialSecurityNumber">
                <RequiredLabel>Social Security Number</RequiredLabel>
              </Label>
              <div className="relative">
                <Input
                  id="socialSecurityNumber"
                  name="socialSecurityNumber"
                  type={showSSN ? "text" : "password"}
                  value={formData.socialSecurityNumber}
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
              <Label htmlFor="sex">
                <RequiredLabel>Sex</RequiredLabel>
              </Label>
              <Select 
                value={formData.sex} 
                onValueChange={(value) => handleSelectChange('sex', value)}
                required
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
              <Label htmlFor="driversLicenseNumber">
                <RequiredLabel>Driver's License Number</RequiredLabel>
              </Label>
              <Input
                id="driversLicenseNumber"
                name="driversLicenseNumber"
                value={formData.driversLicenseNumber}
                onChange={handleInputChange}
                className="bg-white"
                required
              />
              <p className="text-sm text-gray-500">Your current driver's license number</p>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                <RequiredLabel>Email Address</RequiredLabel>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
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
              <Label htmlFor="vehicle.make" className="text-base font-medium">
                Vehicle Make
              </Label>
              <Input
                id="vehicle.make"
                name="vehicle.make"
                value={formData.vehicle?.make || ''}
                onChange={handleInputChange}
                className={`bg-white ${noCar ? 'opacity-50' : ''}`}
                placeholder="e.g., Toyota"
                disabled={noCar}
              />
              <p className="text-sm text-gray-500">Brand of your vehicle</p>
            </div>

            {/* Vehicle Model */}
            <div className="space-y-2">
              <Label htmlFor="vehicle.model" className="text-base font-medium">
                Vehicle Model
              </Label>
              <Input
                id="vehicle.model"
                name="vehicle.model"
                value={formData.vehicle?.model || ''}
                onChange={handleInputChange}
                className={`bg-white ${noCar ? 'opacity-50' : ''}`}
                placeholder="e.g., Camry"
                disabled={noCar}
              />
              <p className="text-sm text-gray-500">Model of your vehicle</p>
            </div>

            {/* Vehicle Tag */}
            <div className="space-y-2">
              <Label htmlFor="vehicle.tagNumber" className="text-base font-medium">
                License Plate Number
              </Label>
              <Input
                id="vehicle.tagNumber"
                name="vehicle.tagNumber"
                value={formData.vehicle?.tagNumber || ''}
                onChange={handleInputChange}
                className={`bg-white ${noCar ? 'opacity-50' : ''}`}
                placeholder="e.g., ABC-1234"
                disabled={noCar}
              />
              <p className="text-sm text-gray-500">Your vehicle's license plate number</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demographics & Health Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserCircle className="h-5 w-5 text-purple-500" />
            Demographics & Health Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Race */}
            <div className="space-y-2">
              <Label htmlFor="race">
                <RequiredLabel>Race</RequiredLabel>
              </Label>
              <Select 
                value={formData.healthStatus.race} 
                onValueChange={(value) => handleHealthStatusChange({ race: value })}
                required
              >
                <SelectTrigger id="race" className="bg-white">
                  <SelectValue placeholder="Select race" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="american-indian-alaska-native">American Indian or Alaska Native</SelectItem>
                  <SelectItem value="asian">Asian</SelectItem>
                  <SelectItem value="black-african-american">Black or African American</SelectItem>
                  <SelectItem value="native-hawaiian-pacific-islander">Native Hawaiian or Pacific Islander</SelectItem>
                  <SelectItem value="white">White</SelectItem>
                  <SelectItem value="multiple-races">Multiple Races</SelectItem>
                  <SelectItem value="other-race">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ethnicity */}
            <div className="space-y-2">
              <Label htmlFor="ethnicity">
                <RequiredLabel>Ethnicity</RequiredLabel>
              </Label>
              <Select 
                value={formData.healthStatus.ethnicity} 
                onValueChange={(value) => handleHealthStatusChange({ ethnicity: value })}
                required
              >
                <SelectTrigger id="ethnicity" className="bg-white">
                  <SelectValue placeholder="Select ethnicity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hispanic-latino">Hispanic or Latino</SelectItem>
                  <SelectItem value="not-hispanic-latino">Not Hispanic or Latino</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Household Income */}
            <div className="space-y-2">
              <Label htmlFor="householdIncome">
                <RequiredLabel>Household Income</RequiredLabel>
              </Label>
              <Select 
                value={formData.healthStatus.householdIncome} 
                onValueChange={(value) => handleHealthStatusChange({ householdIncome: value })}
                required
              >
                <SelectTrigger id="householdIncome" className="bg-white">
                  <SelectValue placeholder="Select income range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under-15k">Under $15,000</SelectItem>
                  <SelectItem value="15k-30k">$15,000 - $29,999</SelectItem>
                  <SelectItem value="30k-45k">$30,000 - $44,999</SelectItem>
                  <SelectItem value="45k-60k">$45,000 - $59,999</SelectItem>
                  <SelectItem value="60k-75k">$60,000 - $74,999</SelectItem>
                  <SelectItem value="75k-plus">$75,000 or more</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Employment Status */}
            <div className="space-y-2">
              <Label htmlFor="employmentStatus">
                <RequiredLabel>Employment Status</RequiredLabel>
              </Label>
              <Select 
                value={formData.healthStatus.employmentStatus} 
                onValueChange={(value) => handleHealthStatusChange({ employmentStatus: value })}
                required
              >
                <SelectTrigger id="employmentStatus" className="bg-white">
                  <SelectValue placeholder="Select employment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="unemployed">Unemployed</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="other-employment">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Health Status Checkboxes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Health & Status Information</h3>
            <p className="text-sm text-gray-500">Select all that apply to you</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { id: 'pregnant', label: 'Pregnant' },
                { id: 'developmentallyDisabled', label: 'Developmentally Disabled' },
                { id: 'coOccurringDisorder', label: 'Co-Occurring Disorder' },
                { id: 'docSupervision', label: 'DOC Supervision' },
                { id: 'felon', label: 'Felon' },
                { id: 'physicallyHandicapped', label: 'Physically Handicapped' },
                { id: 'postPartum', label: 'Post-Partum' },
                { id: 'primaryFemaleCaregiver', label: 'Primary Female Caregiver' },
                { id: 'recentlyIncarcerated', label: 'Recently Incarcerated' },
                { id: 'sexOffender', label: 'Sex Offender' },
                { id: 'lgbtq', label: 'LGBTQ' },
                { id: 'veteran', label: 'Veteran' },
                { id: 'insulinDependent', label: 'Insulin Dependent' },
                { id: 'historyOfSeizures', label: 'History of Seizures' }
              ].map(({ id, label }) => (
                <div key={id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={id}
                    checked={formData.healthStatus[id as keyof HealthStatus] as boolean || false}
                    onChange={(e) => {
                      if (handleHealthStatusChange) {
                        handleHealthStatusChange({
                          [id]: e.target.checked
                        });
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor={id} className="text-sm">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}