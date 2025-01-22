import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileCheck, ClipboardCheck, Home, Clock, UserCheck, Car, Heart, Book } from "lucide-react";
import { OnboardingPageProps, SignatureType, Signature } from '@/types';

interface OnboardingHouseRulesPageProps extends OnboardingPageProps {}

const generateSignatureId = () => `JH-HOUSE-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

const getSignature = (signatures: Signature[], type: SignatureType) => {
  return signatures.find(sig => sig.signatureType === type);
};

const updateSignature = (
  currentSignatures: Signature[],
  type: SignatureType,
  updates: Partial<Signature>
): Signature[] => {
  const existingIndex = currentSignatures.findIndex(sig => sig.signatureType === type);
  const updatedSignatures = [...currentSignatures];
  
  if (existingIndex === -1) {
    updatedSignatures.push({
      signatureType: type,
      signature: '',
      signatureTimestamp: '',
      signatureId: generateSignatureId(),
      ...updates
    } as Signature);
  } else {
    updatedSignatures[existingIndex] = {
      ...updatedSignatures[existingIndex],
      ...updates
    };
  }
  
  return updatedSignatures;
};

const HOUSE_RULES = {
  "Personal Conduct": {
    icon: UserCheck,
    rules: [
      "Always remain drug free",
      "Be subject to random alcohol and drug screening",
      "Refrain from having any sexual relations while on the premises of Journey House",
      "Smoke only outside and only in designated smoking area"
    ]
  },
  "Daily Responsibilities": {
    icon: Clock,
    rules: [
      "Follow the house schedule",
      "Perform chores as volunteered or assigned",
      "Clean sleeping area and bedroom daily"
    ]
  },
  "Program Requirements": {
    icon: Book,
    rules: [
      "Attend AA/NA meetings as required by current phase in residency",
      "Attending all in-house meetings",
      "Locate employment or regular volunteer commitment"
    ]
  },
  "Health & Safety": {
    icon: Heart,
    rules: [
      "See a physician or psychiatrist if required by staff"
    ]
  },
  "Vehicle & Property": {
    icon: Car,
    rules: [
      "Keep your personal car in the designated parking space and provide a copy of valid insurance and license"
    ]
  }
};

export default function OnboardingHouseRulesPage({
  formData,
  handleInputChange,
  handleSelectChange,
}: OnboardingHouseRulesPageProps) {
  const houseRulesSignature = getSignature(formData.signatures, 'house_rules');
  const [hasReadContent, setHasReadContent] = useState(Boolean(houseRulesSignature?.agreed));
  const [verifiedCategories, setVerifiedCategories] = useState<Set<string>>(new Set());
  
  const allCategoriesVerified = verifiedCategories.size === Object.keys(HOUSE_RULES).length;

  const handleCheckboxChange = (checked: boolean) => {
    setHasReadContent(checked);
    const timestamp = new Date().toISOString();
    
    const updatedSignatures = updateSignature(formData.signatures, 'house_rules', {
      agreed: checked,
      signatureTimestamp: checked ? timestamp : '',
      signatureId: checked ? generateSignatureId() : ''
    });
    
    handleSelectChange('signatures', updatedSignatures);
  };

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedSignatures = updateSignature(formData.signatures, 'house_rules', {
      signature: e.target.value,
      signatureTimestamp: e.target.value ? new Date().toISOString() : ''
    });
    
    handleSelectChange('signatures', updatedSignatures);
  };

  const handleWitnessSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedSignatures = updateSignature(formData.signatures, 'house_rules', {
      witnessSignature: e.target.value,
      witnessTimestamp: e.target.value ? new Date().toISOString() : ''
    });
    
    handleSelectChange('signatures', updatedSignatures);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">House Rules</h1>
        <p className="text-gray-600">Every resident will comply with these rules</p>
      </div>

      <div className="grid gap-4">
        {Object.entries(HOUSE_RULES).map(([category, { icon: Icon, rules }]) => (
          <Card key={category}>
            <CardHeader className="border-b bg-blue-50">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-900">
                  <Icon className="h-5 w-5 text-blue-500" />
                  {category}
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`verify-${category}`}
                    checked={verifiedCategories.has(category)}
                    onCheckedChange={(checked) => {
                      setVerifiedCategories(prev => {
                        const newSet = new Set(prev);
                        if (checked) {
                          newSet.add(category);
                        } else {
                          newSet.delete(category);
                        }
                        return newSet;
                      });
                    }}
                  />
                  <Label htmlFor={`verify-${category}`} className="text-sm text-blue-800">
                    Mark as reviewed
                  </Label>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {rules.map((rule, index) => (
                  <div key={index} className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="h-2 w-2 mt-2 shrink-0 rounded-full bg-blue-400" />
                    <p className="text-gray-700">{rule}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-emerald-500" />
            Acknowledgment and Agreement
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <Checkbox
                id="agreement"
                checked={hasReadContent}
                onCheckedChange={handleCheckboxChange}
                disabled={!allCategoriesVerified}
              />
              <div className="space-y-1">
                <Label htmlFor="agreement" className="text-sm text-gray-700">
                  I have read and understand all House Rules and agree to comply with them
                </Label>
                {!allCategoriesVerified && (
                  <p className="text-sm text-red-500">
                    Please review and verify all categories before agreeing
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label htmlFor="houseRulesSignature">Resident Signature</Label>
              <Input
                id="houseRulesSignature"
                name="houseRulesSignature"
                value={houseRulesSignature?.signature || ''}
                onChange={handleSignatureChange}
                disabled={!hasReadContent}
                placeholder="Type your full legal name"
                className="bg-white"
              />
              {houseRulesSignature?.signatureTimestamp && (
                <p className="text-sm text-gray-500">
                  Signed: {new Date(houseRulesSignature.signatureTimestamp).toLocaleString()}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <Label htmlFor="houseRulesWitnessSignature">Witness Signature</Label>
              <Input
                id="houseRulesWitnessSignature"
                name="houseRulesWitnessSignature"
                value={houseRulesSignature?.witnessSignature || ''}
                onChange={handleWitnessSignature}
                disabled={!houseRulesSignature?.signature}
                placeholder="Witness full legal name"
                className="bg-white"
              />
              {houseRulesSignature?.witnessTimestamp && (
                <p className="text-sm text-gray-500">
                  Witnessed: {new Date(houseRulesSignature.witnessTimestamp).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {houseRulesSignature?.signatureId && (
            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-gray-500">Document ID: {houseRulesSignature.signatureId}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}