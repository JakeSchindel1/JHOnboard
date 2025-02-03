import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Contact, Plus, Trash2 } from "lucide-react";
import { OnboardingPageProps, Insurance } from '@/types';

const InsuranceEntry = ({
  insurance,
  onUpdate,
  onRemove,
  showRemove
}: {
  insurance: Insurance;
  onUpdate: (updates: Partial<Insurance>) => void;
  onRemove: () => void;
  showRemove: boolean;
}) => {
  const handleInsuranceTypeChange = (value: string) => {
    onUpdate({ 
      insuranceType: value,
      policyNumber: value === 'uninsured' ? '' : insurance.policyNumber 
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 relative border-b pb-6 last:border-b-0">
      {/* Insurance Type */}
      <div className="space-y-2">
        <Label htmlFor="insuranceType" className="text-base font-medium">
          Insurance Type
        </Label>
        <Select 
          value={insurance.insuranceType || 'uninsured'}
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
      {insurance.insuranceType && insurance.insuranceType !== 'uninsured' && (
        <div className="space-y-2">
          <Label htmlFor="policyNumber" className="text-base font-medium">
            Policy Number
          </Label>
          <div className="flex gap-2">
            <Input
              id="policyNumber"
              value={insurance.policyNumber || ''}
              onChange={(e) => onUpdate({ policyNumber: e.target.value })}
              className="bg-white"
              placeholder="Enter your policy number"
            />
            {showRemove && (
              <Button 
                type="button" 
                variant="destructive" 
                size="icon"
                onClick={onRemove}
                className="shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-500">Your insurance policy number</p>
        </div>
      )}
    </div>
  );
};

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

  // Initialize insurances array if it doesn't exist
  const insurances = Array.isArray(formData.insurances) ? formData.insurances : [{ insuranceType: 'uninsured' }];

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

  const updateInsurance = (index: number, updates: Partial<Insurance>) => {
    const newInsurances = [...insurances];
    newInsurances[index] = { ...newInsurances[index], ...updates };
    handleSelectChange('insurances', newInsurances);
  };

  const addInsurance = () => {
    handleSelectChange('insurances', [...insurances, { insuranceType: 'uninsured' }]);
  };

  const removeInsurance = (index: number) => {
    const newInsurances = insurances.filter((_, i) => i !== index);
    handleSelectChange('insurances', newInsurances);
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
          {insurances.map((insurance, index) => (
            <InsuranceEntry
              key={index}
              insurance={insurance}
              onUpdate={(updates) => updateInsurance(index, updates)}
              onRemove={() => removeInsurance(index)}
              showRemove={insurances.length > 1}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addInsurance}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Insurance
          </Button>
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
              <p className="text-sm text-gray-500">Emergency contact&apos;s first name</p>
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
              <p className="text-sm text-gray-500">Emergency contact&apos;s last name</p>
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