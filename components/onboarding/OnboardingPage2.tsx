import React, { useState, useCallback } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, UserCircle, Car } from "lucide-react";

interface HealthStatus {
  pregnant?: boolean;
  developmentallyDisabled?: boolean;
  coOccurringDisorder?: boolean;
  docSupervision?: boolean;
  felon?: boolean;
  physicallyHandicapped?: boolean;
  postPartum?: boolean;
  primaryFemaleCaregiver?: boolean;
  recentlyIncarcerated?: boolean;
  sexOffender?: boolean;
  lgbtq?: boolean;
  veteran?: boolean;
  insulinDependent?: boolean;
  historyOfSeizures?: boolean;
  others?: string[];
  [key: string]: boolean | string[] | undefined;
}

interface FormData {
  socialSecurityNumber?: string;
  sex?: string;
  email?: string;
  driversLicenseNumber?: string;
  vehicleTagNumber?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  race?: string;
  ethnicity?: string;
  householdIncome?: string;
  employmentStatus?: string;
  healthStatus: HealthStatus;
}

interface OnboardingPage2Props {
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleVehicleToggle: (hasNoVehicle: boolean) => void;
  handleHealthStatusChange?: (updates: Partial<FormData['healthStatus']>) => void;
}

export default function OnboardingPage2({
  formData = { healthStatus: {} },
  handleInputChange,
  handleSelectChange,
  handleVehicleToggle,
  handleHealthStatusChange = () => {}
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
              <Label htmlFor="race" className="text-base font-medium">Race</Label>
              <Select 
                value={formData.race} 
                onValueChange={(value) => handleSelectChange('race', value)}
              >
                <SelectTrigger id="race" className="bg-white">
                  <SelectValue placeholder="Select race" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="american-indian">American Indian or Alaska Native</SelectItem>
                  <SelectItem value="asian">Asian</SelectItem>
                  <SelectItem value="black">Black or African American</SelectItem>
                  <SelectItem value="pacific-islander">Native Hawaiian or Pacific Islander</SelectItem>
                  <SelectItem value="white">White</SelectItem>
                  <SelectItem value="multiple">Multiple Races</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ethnicity */}
            <div className="space-y-2">
              <Label htmlFor="ethnicity" className="text-base font-medium">Ethnicity</Label>
              <Select 
                value={formData.ethnicity} 
                onValueChange={(value) => handleSelectChange('ethnicity', value)}
              >
                <SelectTrigger id="ethnicity" className="bg-white">
                  <SelectValue placeholder="Select ethnicity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hispanic">Hispanic or Latino</SelectItem>
                  <SelectItem value="non-hispanic">Not Hispanic or Latino</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Household Income */}
            <div className="space-y-2">
              <Label htmlFor="householdIncome" className="text-base font-medium">Household Income</Label>
              <Select 
                value={formData.householdIncome} 
                onValueChange={(value) => handleSelectChange('householdIncome', value)}
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
              <Label htmlFor="employmentStatus" className="text-base font-medium">Employment Status</Label>
              <Select 
                value={formData.employmentStatus} 
                onValueChange={(value) => handleSelectChange('employmentStatus', value)}
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
                  <SelectItem value="other">Other</SelectItem>
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
                    checked={formData.healthStatus?.[id as keyof HealthStatus] as boolean || false}
                    onChange={(e) => {
                      handleHealthStatusChange({
                        [id]: e.target.checked
                      });
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor={id} className="text-sm">
                    {label}
                  </Label>
                </div>
              ))}
            </div>

            {/* Other Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Other</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const newOthers = [...(formData.healthStatus.others || []), ''];
                    handleHealthStatusChange({ others: newOthers });
                  }}
                  className="text-sm"
                >
                  Add Another
                </Button>
              </div>
              
              <div className="space-y-2">
                {(formData.healthStatus.others || []).map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const newOthers = [...(formData.healthStatus.others || [])];
                        newOthers[index] = e.target.value;
                        handleHealthStatusChange({ others: newOthers });
                      }}
                      placeholder="Specify other condition or status"
                      className="bg-white flex-1"
                    />
                    <Button 
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const newOthers = [...(formData.healthStatus.others || [])];
                        newOthers.splice(index, 1);
                        handleHealthStatusChange({ others: newOthers });
                      }}
                      className="shrink-0"
                    >
                      ×
                    </Button>
                  </div>
                ))}
                {!(formData.healthStatus.others || []).length && (
                  <Input
                    placeholder="Specify other condition or status"
                    className="bg-white"
                    onChange={(e) => {
                      handleHealthStatusChange({ 
                        others: [e.target.value]
                      });
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}