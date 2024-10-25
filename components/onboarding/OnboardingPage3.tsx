import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Shield, Contact } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormData {
  insured?: string;
  insuranceType?: string;
  policyNumber?: string;
  emergencyContactFirstName?: string;
  emergencyContactLastName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  otherRelationship?: string;
}

interface OnboardingPage3Props {
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

export default function OnboardingPage3({
  formData = {},
  handleInputChange,
  handleSelectChange,
  setCurrentPage
}: OnboardingPage3Props) {
  const {
    insured = '',
    insuranceType = '',
    policyNumber = '',
    emergencyContactFirstName = '',
    emergencyContactLastName = '',
    emergencyContactPhone = '',
    emergencyContactRelationship = '',
    otherRelationship = ''
  } = formData;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/\D/g, '');
    value = value.slice(0, 10);
    
    if (value.length > 6) {
      value = `(${value.slice(0, 3)})${value.slice(3, 6)}-${value.slice(6)}`;
    } else if (value.length > 3) {
      value = `(${value.slice(0, 3)})${value.slice(3)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }

    const newEvent = {
      ...e,
      target: {
        ...e.target,
        name: 'emergencyContactPhone',
        value: value
      }
    };

    handleInputChange(newEvent);
  };

  const isEmergencyContactComplete = () => {
    if (emergencyContactRelationship === 'other') {
      return (
        emergencyContactFirstName?.trim() &&
        emergencyContactLastName?.trim() &&
        emergencyContactPhone?.trim() &&
        emergencyContactRelationship?.trim() &&
        otherRelationship?.trim()
      );
    }
    return (
      emergencyContactFirstName?.trim() &&
      emergencyContactLastName?.trim() &&
      emergencyContactPhone?.trim() &&
      emergencyContactRelationship?.trim()
    );
  };

  const handleNextPage = () => {
    if (!isEmergencyContactComplete()) {
      alert('Please complete all emergency contact fields before proceeding.');
      return;
    }
    setCurrentPage(prev => prev + 1);
  };

  const isInsuranceFieldsDisabled = insured === 'no';

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">INSURANCE & EMERGENCY CONTACTS</h2>
        <p className="text-sm text-gray-600">Please complete all required fields</p>
      </div>

      {/* Insurance Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-blue-500" />
            Insurance Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Insurance Status */}
            <div className="space-y-2">
              <Label htmlFor="insured" className="text-base font-medium">Insurance Status</Label>
              <Select 
                value={insured} 
                onValueChange={(value) => handleSelectChange('insured', value)}
              >
                <SelectTrigger id="insured" className="bg-white">
                  <SelectValue placeholder="Select insurance status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">Indicate if you have insurance</p>
            </div>

            {/* Insurance Type */}
            <div className="space-y-2">
              <Label 
                htmlFor="insuranceType" 
                className={`text-base font-medium ${isInsuranceFieldsDisabled ? 'text-gray-400' : ''}`}
              >
                Insurance Type
              </Label>
              <Select 
                value={insuranceType} 
                onValueChange={(value) => handleSelectChange('insuranceType', value)}
                disabled={isInsuranceFieldsDisabled}
              >
                <SelectTrigger 
                  id="insuranceType" 
                  className={`bg-white ${isInsuranceFieldsDisabled ? 'opacity-50' : ''}`}
                >
                  <SelectValue placeholder="Select insurance type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="medicare">Medicare</SelectItem>
                  <SelectItem value="medicaid">Medicaid</SelectItem>
                </SelectContent>
              </Select>
              <p className={`text-sm ${isInsuranceFieldsDisabled ? 'text-gray-400' : 'text-gray-500'}`}>
                Type of insurance coverage
              </p>
            </div>

            {/* Policy Number */}
            <div className="space-y-2">
              <Label 
                htmlFor="policyNumber" 
                className={`text-base font-medium ${isInsuranceFieldsDisabled ? 'text-gray-400' : ''}`}
              >
                Policy Number
              </Label>
              <Input
                id="policyNumber"
                name="policyNumber"
                value={policyNumber}
                onChange={handleInputChange}
                className={`bg-white ${isInsuranceFieldsDisabled ? 'opacity-50' : ''}`}
                placeholder="Enter your policy number"
                required
                disabled={isInsuranceFieldsDisabled}
              />
              <p className={`text-sm ${isInsuranceFieldsDisabled ? 'text-gray-400' : 'text-gray-500'}`}>
                Your insurance policy number
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Contact className="h-5 w-5 text-green-500" />
            Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Contact First Name */}
            <div className="space-y-2">
              <Label htmlFor="emergencyContactFirstName" className="text-base font-medium">
                First Name
              </Label>
              <Input
                id="emergencyContactFirstName"
                name="emergencyContactFirstName"
                value={emergencyContactFirstName}
                onChange={handleInputChange}
                className="bg-white"
                placeholder="First name"
                required
              />
              <p className="text-sm text-gray-500">Emergency contact&apos;s first name</p>
            </div>

            {/* Contact Last Name */}
            <div className="space-y-2">
              <Label htmlFor="emergencyContactLastName" className="text-base font-medium">
                Last Name
              </Label>
              <Input
                id="emergencyContactLastName"
                name="emergencyContactLastName"
                value={emergencyContactLastName}
                onChange={handleInputChange}
                className="bg-white"
                placeholder="Last name"
                required
              />
              <p className="text-sm text-gray-500">Emergency contact&apos;s last name</p>
            </div>

            {/* Contact Phone */}
            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone" className="text-base font-medium">
                Contact Phone
              </Label>
              <Input
                id="emergencyContactPhone"
                name="emergencyContactPhone"
                type="tel"
                value={emergencyContactPhone}
                onChange={handlePhoneChange}
                className="bg-white"
                placeholder="(XXX)XXX-XXXX"
                required
              />
              <p className="text-sm text-gray-500">Phone number of emergency contact</p>
            </div>

            {/* Contact Relationship */}
            <div className="space-y-2">
              <Label htmlFor="emergencyContactRelationship" className="text-base font-medium">
                Relationship
              </Label>
              <Select 
                value={emergencyContactRelationship} 
                onValueChange={(value) => handleSelectChange('emergencyContactRelationship', value)}
              >
                <SelectTrigger id="emergencyContactRelationship" className="bg-white">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="spouse">Spouse</SelectItem>
                  <SelectItem value="sibling">Sibling</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="grandparent">Grandparent</SelectItem>
                  <SelectItem value="friend">Friend</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">Your relationship to the contact</p>
            </div>

            {/* Other Relationship (Conditional) */}
            {emergencyContactRelationship === 'other' && (
              <div className="space-y-2">
                <Label htmlFor="otherRelationship" className="text-base font-medium">
                  Specify Relationship
                </Label>
                <Input
                  id="otherRelationship"
                  name="otherRelationship"
                  value={otherRelationship}
                  onChange={handleInputChange}
                  className="bg-white"
                  placeholder="Please specify the relationship"
                  required
                />
                <p className="text-sm text-gray-500">Please specify your relationship to the contact</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}