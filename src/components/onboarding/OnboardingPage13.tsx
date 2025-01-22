import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormData, OnboardingPageProps, SignatureType, Signature } from '@/types';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileCheck, ChevronLeft, ChevronRight } from "lucide-react";

const CRITICAL_RULES = [
  {
    title: "ALCOHOL",
    description: "There will be no possession, sales, or use of beverages containing alcohol within Journey House."
  },
  {
    title: "PRESCRIPTION DRUGS",
    description: "There will be no possession, sales, or use of any prescription drug within Journey House that has not been registered with staff for monitored self-administration."
  },
  {
    title: "ILLICIT DRUGS",
    description: "There will be no possession, sales, or use of any illicit drug within Journey House."
  },
  {
    title: "SEXUAL HARASSMENT AND ACTING OUT",
    description: "There will be no flirting, sexual remarks, sexual harassment, romantic involvement or sexual acting out with another resident or visitor."
  },
  {
    title: "VIOLENCE",
    description: "There will be no violence or threat of violence in Journey House or by any resident outside of Journey House. Violence or the threat of violence will result in immediate discharge."
  },
  {
    title: "USE OF DRUGS",
    description: "There will be NO use of mood-altering drugs within Journey House— either on or off the grounds. Using alcohol or other drugs will result in immediate discharge and the resident will be required to leave immediately."
  },
  {
    title: "PORNOGRAPHY",
    description: "Sexually explicit pictures, magazines, reading materials or movies are not allowed at Journey House. Staff will periodically complete room inspections, and sexually explicit materials will be confiscated and destroyed. Any resident found with child pornography or violent sexually explicit material will be subject to corrective discipline up to and including discharge, and materials may be turned over to police."
  }
];

const generateSignatureId = () => `JH-CRIT-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

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

interface OnboardingCriticalRulesPageProps extends OnboardingPageProps {}

export default function OnboardingCriticalRulesPage({
  formData,
  handleInputChange,
  handleSelectChange,
}: OnboardingCriticalRulesPageProps) {
  const criticalRulesSignature = getSignature(formData.signatures, 'critical_rules');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewedSlides, setViewedSlides] = useState(new Set());
  const [hasReadContent, setHasReadContent] = useState(Boolean(criticalRulesSignature?.agreed));

  useEffect(() => {
    if (currentSlide === 0) {
      setViewedSlides(new Set([0]));
    }
  }, []);

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentSlide < CRITICAL_RULES.length) {
      setCurrentSlide(prev => prev + 1);
      setViewedSlides(prev => new Set(prev.add(currentSlide + 1)));
    }
  };

  const handlePrevious = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setHasReadContent(checked);
    const timestamp = new Date().toISOString();
    
    const updatedSignatures = updateSignature(formData.signatures, 'critical_rules', {
      agreed: checked,
      signatureTimestamp: checked ? timestamp : '',
      signatureId: checked ? generateSignatureId() : ''
    });
    
    handleSelectChange('signatures', updatedSignatures);
  };

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedSignatures = updateSignature(formData.signatures, 'critical_rules', {
      signature: e.target.value,
      signatureTimestamp: e.target.value ? new Date().toISOString() : ''
    });
    
    handleSelectChange('signatures', updatedSignatures);
  };

  const handleWitnessSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedSignatures = updateSignature(formData.signatures, 'critical_rules', {
      witnessSignature: e.target.value,
      witnessTimestamp: e.target.value ? new Date().toISOString() : ''
    });
    
    handleSelectChange('signatures', updatedSignatures);
  };

  const hasViewedAllSlides = viewedSlides.size === CRITICAL_RULES.length + 1;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Critical Rules</h1>
        <p className="text-gray-600">Rules which result in immediate corrective discipline</p>
      </div>

      {currentSlide === 0 ? (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-800 font-bold">Important Notice</AlertTitle>
          <AlertDescription className="text-red-700">
            The Journey House, LLC has several critical rules which result in immediate corrective discipline up to, and including, immediate termination from the residence.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className="relative">
        <CardHeader className="bg-red-50 border-b border-red-100">
          <CardTitle className="flex items-center gap-2 text-red-900">
            {currentSlide > 0 && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-200 text-sm font-bold text-red-900">
                {currentSlide}
              </span>
            )}
            {currentSlide === 0 ? "Introduction" : CRITICAL_RULES[currentSlide - 1].title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pb-16 min-h-48">
          {currentSlide === 0 ? (
            <p className="text-gray-700">Please review each critical rule carefully. You must view all rules before signing the agreement.</p>
          ) : (
            <p className="text-gray-700">{CRITICAL_RULES[currentSlide - 1].description}</p>
          )}
        </CardContent>
        
        <div className="absolute bottom-4 left-0 right-0 flex justify-between px-6 bg-white">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          
          {currentSlide < CRITICAL_RULES.length ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : null}
        </div>
      </Card>

      <div className="flex justify-center gap-1">
        {Array.from({ length: CRITICAL_RULES.length + 1 }).map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full ${
              index === currentSlide
                ? 'bg-red-500'
                : viewedSlides.has(index)
                ? 'bg-red-200'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Agreement Section - Only shown after viewing all slides */}
      {currentSlide === CRITICAL_RULES.length && (
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
                  disabled={!hasViewedAllSlides}
                />
                <Label htmlFor="agreement" className="text-sm text-gray-700">
                  I have read and understand all Critical Rules and agree to comply with them
                </Label>
              </div>
              {!hasViewedAllSlides && (
                <p className="text-sm text-red-600 mt-2">
                  You must view all rules before agreeing
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label htmlFor="criticalRulesSignature">Resident Signature</Label>
                <Input
                  id="criticalRulesSignature"
                  name="criticalRulesSignature"
                  value={criticalRulesSignature?.signature || ''}
                  onChange={handleSignatureChange}
                  disabled={!hasReadContent}
                  placeholder="Type your full legal name"
                  className="bg-white"
                />
                {criticalRulesSignature?.signatureTimestamp && (
                  <p className="text-sm text-gray-500">
                    Signed: {new Date(criticalRulesSignature.signatureTimestamp).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <Label htmlFor="criticalRulesWitnessSignature">Witness Signature</Label>
                <Input
                  id="criticalRulesWitnessSignature"
                  name="criticalRulesWitnessSignature"
                  value={criticalRulesSignature?.witnessSignature || ''}
                  onChange={handleWitnessSignature}
                  disabled={!criticalRulesSignature?.signature}
                  placeholder="Witness full legal name"
                  className="bg-white"
                />
                {criticalRulesSignature?.witnessTimestamp && (
                  <p className="text-sm text-gray-500">
                    Witnessed: {new Date(criticalRulesSignature.witnessTimestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {criticalRulesSignature?.signatureId && (
              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-sm text-gray-500">Document ID: {criticalRulesSignature.signatureId}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}