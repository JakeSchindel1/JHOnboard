import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UserPlus, FileText, X, FileCheck } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AuthorizedPerson {
  firstName: string;
  lastName: string;
  relationship: string;
  phone: string;
}

interface FormData {
  firstName?: string;
  lastName?: string;
  authorizedPeople?: AuthorizedPerson[];
  disclosureSignature?: string;
  disclosureSignatureDate?: string;
  disclosureWitnessSignature?: string;
  disclosureWitnessTimestamp?: string;
  disclosureSignatureId?: string;
  disclosureAgreed?: boolean;
  disclosureAgreementTimestamp?: string;
}

interface OnboardingPage7Props {
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleAuthorizedPeopleChange: (people: AuthorizedPerson[]) => void;
}

export default function OnboardingPage7({
  formData = {},
  handleInputChange,
  handleSelectChange,
  handleAuthorizedPeopleChange,
}: OnboardingPage7Props) {
  const [authorizedPeople, setAuthorizedPeople] = useState<AuthorizedPerson[]>(
    formData.authorizedPeople || [{ firstName: '', lastName: '', relationship: '', phone: '' }]
  );
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(Boolean(formData.disclosureAgreed));

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const reachedBottom = Math.abs(
      element.scrollHeight - element.clientHeight - element.scrollTop
    ) < 1;
    
    if (reachedBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handlePhoneChange = (index: number, value: string) => {
    let formattedValue = value.replace(/\D/g, '');
    formattedValue = formattedValue.slice(0, 10);
    
    if (formattedValue.length > 6) {
      formattedValue = `(${formattedValue.slice(0, 3)})${formattedValue.slice(3, 6)}-${formattedValue.slice(6)}`;
    } else if (formattedValue.length > 3) {
      formattedValue = `(${formattedValue.slice(0, 3)})${formattedValue.slice(3)}`;
    } else if (formattedValue.length > 0) {
      formattedValue = `(${formattedValue}`;
    }

    handlePersonChange(index, 'phone', formattedValue);
  };

  const handlePersonChange = (index: number, field: keyof AuthorizedPerson, value: string) => {
    const updatedPeople = authorizedPeople.map((person, i) => {
      if (i === index) {
        return { ...person, [field]: value };
      }
      return person;
    });
    setAuthorizedPeople(updatedPeople);
    handleAuthorizedPeopleChange(updatedPeople);
  };

  const addPerson = () => {
    setAuthorizedPeople([...authorizedPeople, { firstName: '', lastName: '', relationship: '', phone: '' }]);
  };

  const removePerson = (index: number) => {
    const updatedPeople = authorizedPeople.filter((_, i) => i !== index);
    setAuthorizedPeople(updatedPeople);
    handleAuthorizedPeopleChange(updatedPeople);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Disclosure Authorization</h2>
        <p className="text-sm text-gray-600">Please read carefully and complete all sections</p>
      </div>

      {/* Disclosure Text Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-blue-500" />
            Authorization Statement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea 
            className="h-[300px] rounded-md border"
            onScrollCapture={handleScroll}
          >
            <div className="p-6 space-y-4 text-sm leading-relaxed">
              <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
                <p className="text-base">
                  I, <span className="font-bold">{formData.firstName} {formData.lastName}</span>, hereby acknowledge and agree to the following terms regarding the disclosure of my information.
                </p>
              </div>

              <div>
                <p>
                  I authorize Journey House, LLC (&quot;Journey House&quot;) to disclose information about me to the persons listed below. These individuals have been authorized to speak with the staff of the recovery residence on my behalf.
                </p>
              </div>

              <div>
                <p className="font-medium mb-2">In the event of a discharge related to relapse, I understand and authorize Journey House to notify:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>My emergency contact</li>
                  <li>Individuals listed on my consent for release</li>
                  <li>Outpatient providers</li>
                  <li>Judicial system representatives</li>
                  <li>Department of Corrections</li>
                  <li>Public Defender&apos;s Office</li>
                  <li>Jail Diversion Program</li>
                  <li>Co-applicant who functions as financier</li>
                </ul>
              </div>

              <div>
                <p className="text-gray-600 italic">
                  When applicable, this authorization extends to private attorneys and case workers involved in family case plans.
                </p>
              </div>
            </div>
          </ScrollArea>

          <div className="flex items-center space-x-2 border-t pt-4">
            <Checkbox
              id="disclosureAgreement"
              checked={hasAgreed}
              onCheckedChange={(checked: boolean) => {
                setHasAgreed(checked);
                handleSelectChange('disclosureAgreed', checked.toString());
                if (checked) {
                  const now = new Date();
                  handleSelectChange('disclosureAgreementTimestamp', now.toISOString());
                }
              }}
              disabled={!hasScrolledToBottom}
            />
            <label
              htmlFor="disclosureAgreement"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have read and understand the above disclosure authorization
            </label>
          </div>
          {!hasScrolledToBottom && (
            <p className="text-sm text-amber-600">
              Please scroll through the entire document to enable the checkbox
            </p>
          )}
        </CardContent>
      </Card>

      {/* Authorized People Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="h-5 w-5 text-green-500" />
            Authorized People
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {authorizedPeople.map((person, index) => (
            <div key={index} className="relative border rounded-lg p-6 bg-gray-50">
              {authorizedPeople.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2"
                  onClick={() => removePerson(index)}
                >
                  <X className="h-4 w-4 text-gray-500" />
                </Button>
              )}
              <div className="grid md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor={`firstName-${index}`} className="text-base font-medium">
                    First Name
                  </Label>
                  <Input
                    id={`firstName-${index}`}
                    value={person.firstName}
                    onChange={(e) => handlePersonChange(index, 'firstName', e.target.value)}
                    className="bg-white"
                    placeholder="Enter first name"
                    required
                    disabled={!hasAgreed}
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor={`lastName-${index}`} className="text-base font-medium">
                    Last Name
                  </Label>
                  <Input
                    id={`lastName-${index}`}
                    value={person.lastName}
                    onChange={(e) => handlePersonChange(index, 'lastName', e.target.value)}
                    className="bg-white"
                    placeholder="Enter last name"
                    required
                    disabled={!hasAgreed}
                  />
                </div>

                {/* Relationship */}
                <div className="space-y-2">
                  <Label htmlFor={`relationship-${index}`} className="text-base font-medium">
                    Relationship
                  </Label>
                  <Select
                    value={person.relationship}
                    onValueChange={(value) => handlePersonChange(index, 'relationship', value)}
                    disabled={!hasAgreed}
                  >
                    <SelectTrigger id={`relationship-${index}`} className="bg-white">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="spouse">Spouse</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="grandparent">Grandparent</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                      <SelectItem value="attorney">Attorney</SelectItem>
                      <SelectItem value="caseworker">Case Worker</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor={`phone-${index}`} className="text-base font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id={`phone-${index}`}
                    value={person.phone}
                    onChange={(e) => handlePhoneChange(index, e.target.value)}
                    className="bg-white"
                    placeholder="(XXX)XXX-XXXX"
                    required
                    disabled={!hasAgreed}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={addPerson}
            disabled={!hasAgreed}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Another Person
          </Button>
        </CardContent>
      </Card>

      {/* Signature Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileCheck className="h-5 w-5 text-green-500" />
            Authorization & Signatures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resident Signature */}
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label htmlFor="disclosureSignature" className="text-base font-semibold block mb-2">
                  Resident Signature
                </Label>
                <Input
                  id="disclosureSignature"
                  name="disclosureSignature"
                  value={formData.disclosureSignature || ''}
                  onChange={(e) => {
                    handleInputChange(e);
                    if (e.target.name === 'disclosureSignature') {
                      const now = new Date();
                      const timestamp = now.toISOString();
                      const signatureId = `JH-DISC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                      handleSelectChange('disclosureSignatureDate', timestamp);
                      handleSelectChange('disclosureSignatureId', signatureId);
                    }
                  }}
                  required
                  placeholder="Type your full legal name to sign"
                  className="bg-white"
                  disabled={!hasAgreed}
                />
                <p className="text-sm text-gray-600 mt-2">
                  By typing your name above, you confirm that you understand and agree to this disclosure authorization.
                </p>
                {formData.disclosureSignatureDate && (
                  <div className="mt-3 text-sm text-gray-500">
                    <p>Signed on: {new Date(formData.disclosureSignatureDate).toLocaleString()}</p>
                    <p>Signature ID: {formData.disclosureSignatureId}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Witness Signature */}
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label htmlFor="disclosureWitnessSignature" className="text-base font-semibold block mb-2">
                  Witness Signature
                </Label>
                <Input
                  id="disclosureWitnessSignature"
                  name="disclosureWitnessSignature"
                  value={formData.disclosureWitnessSignature || ''}
                  onChange={(e) => {
                    handleInputChange(e);
                    if (e.target.name === 'disclosureWitnessSignature' && e.target.value) {
                      const now = new Date();
                      const timestamp = now.toISOString();
                      handleSelectChange('disclosureWitnessTimestamp', timestamp);
                    }
                  }}
                  required
                  disabled={!formData.disclosureSignature || !hasAgreed}
                  placeholder="Witness full legal name"
                  className="bg-white"
                />
                <p className="text-sm text-gray-600 mt-2">
                  As a witness, your signature verifies that you observed the resident sign this document.
                </p>
                {formData.disclosureWitnessTimestamp && (
                  <p className="mt-3 text-sm text-gray-500">
                    Witnessed on: {new Date(formData.disclosureWitnessTimestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 text-center space-y-2">
            <Separator className="my-4" />
            <p className="text-sm text-gray-500">
              This digital signature agreement is legally binding and includes a timestamp record of both signatures.
            </p>
            {formData.disclosureSignatureId && (
              <p className="text-sm font-medium">
                Document Reference Number: {formData.disclosureSignatureId}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}