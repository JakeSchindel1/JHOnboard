import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Shield, Contact } from "lucide-react";
import { OnboardingPageProps } from '@/types';

export default function OnboardingPage3({
  formData,
  handleInputChange,
  handleSelectChange,
}: OnboardingPageProps) {
  const {
    firstName = '',
    lastName = '',
    phone = '',
    relationship = '',
    otherRelationship = ''
  } = formData.emergencyContact || {};

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

    handleInputChange({
      ...e,
      target: {
        ...e.target,
        name: 'emergencyContact.phone',
        value: value
      }
    });
  };

  const handleInsuranceTypeChange = (value: string) => {
    handleSelectChange('insuranceType', value);
    if (value === 'uninsured') {
      handleSelectChange('policyNumber', '');
    }
  };

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
            {/* Insurance Type */}
            <div className="space-y-2">
              <Label htmlFor="insuranceType" className="text-base font-medium">
                Insurance Type
              </Label>
              <Select 
                value={formData.insuranceType || 'uninsured'}
                onValueChange={handleInsuranceTypeChange}
              >
                <SelectTrigger id="insuranceType" className="bg-white">
                  <SelectValue placeholder="Select insurance type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uninsured">No Insurance</SelectItem>
                  <SelectItem value="private">Private Insurance</SelectItem>
                  <SelectItem value="medicare">Medicare</SelectItem>
                  <SelectItem value="medicaid">Medicaid</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">Type of health insurance coverage</p>
            </div>

            {/* Policy Number */}
            {formData.insuranceType && formData.insuranceType !== 'uninsured' && (
              <div className="space-y-2">
                <Label htmlFor="policyNumber" className="text-base font-medium">
                  Policy Number
                </Label>
                <Input
                  id="policyNumber"
                  name="policyNumber"
                  value={formData.policyNumber || ''}
                  onChange={handleInputChange}
                  className="bg-white"
                  placeholder="Enter your policy number"
                />
                <p className="text-sm text-gray-500">Your insurance policy number</p>
              </div>
            )}
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
                name="emergencyContact.firstName"
                value={firstName}
                onChange={handleInputChange}
                className="bg-white"
                placeholder="First name"
                required
              />
              <p className="text-sm text-gray-500">Emergency contact's first name</p>
            </div>

            {/* Contact Last Name */}
            <div className="space-y-2">
              <Label htmlFor="emergencyContactLastName" className="text-base font-medium">
                Last Name
              </Label>
              <Input
                id="emergencyContactLastName"
                name="emergencyContact.lastName"
                value={lastName}
                onChange={handleInputChange}
                className="bg-white"
                placeholder="Last name"
                required
              />
              <p className="text-sm text-gray-500">Emergency contact's last name</p>
            </div>

            {/* Contact Phone */}
            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone" className="text-base font-medium">
                Contact Phone
              </Label>
              <Input
                id="emergencyContactPhone"
                name="emergencyContact.phone"
                type="tel"
                value={phone}
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
                value={relationship}
                onValueChange={(value) => handleSelectChange('emergencyContact.relationship', value)}
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
            {relationship === 'other' && (
              <div className="space-y-2">
                <Label htmlFor="otherRelationship" className="text-base font-medium">
                  Specify Relationship
                </Label>
                <Input
                  id="otherRelationship"
                  name="emergencyContact.otherRelationship"
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