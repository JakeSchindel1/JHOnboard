import React, { useState, useRef, ChangeEvent } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Info, CheckCircle2, FileCheck, AlertTriangle } from "lucide-react";
import { OnboardingPageProps, Signature } from '@/types';

const Alert: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`rounded-lg border p-4 ${className}`}>
    {children}
  </div>
);

const AlertTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <h3 className={`font-medium mb-2 ${className}`}>{children}</h3>
);

const AlertDescription: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`text-sm ${className}`}>{children}</div>
);

const generateSignatureId = () => `JH-TREAT-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

export default function OnboardingPage8({
  formData,
  handleInputChange,
  handleSelectChange,
}: OnboardingPageProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const currentSignature = formData.signatures.find(s => s.signatureType === 'treatment');
  const [hasReadContent, setHasReadContent] = useState(Boolean(currentSignature?.agreed));
  const [mandatoryReportingAgreed, setMandatoryReportingAgreed] = useState(
    Boolean(formData.signatures.find(s => s.signatureType === 'treatment')?.agreed)
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    if (Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) < 1) {
      setHasScrolledToBottom(true);
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setHasReadContent(checked);
    
    const existingSignature = formData.signatures.find(s => s.signatureType === 'treatment');
    const updatedSignature: Signature = {
      signatureType: 'treatment',
      signature: existingSignature?.signature || '',
      signatureTimestamp: existingSignature?.signatureTimestamp || '',
      signatureId: existingSignature?.signatureId || generateSignatureId(),
      agreed: checked,
      witnessSignature: existingSignature?.witnessSignature,
      witnessTimestamp: existingSignature?.witnessTimestamp
    };

    handleSelectChange('signatures', [
      ...formData.signatures.filter(s => s.signatureType !== 'treatment'),
      updatedSignature
    ]);
  };

  const handleMandatoryReportingChange = (checked: boolean) => {
    setMandatoryReportingAgreed(checked);
    
    const existingSignature = formData.signatures.find(s => s.signatureType === 'treatment');
    if (existingSignature) {
      const updatedSignature: Signature = {
        ...existingSignature,
        agreed: checked && hasReadContent
      };

      handleSelectChange('signatures', [
        ...formData.signatures.filter(s => s.signatureType !== 'treatment'),
        updatedSignature
      ]);
    }
  };

  const handleSignatureChange = (signature: string) => {
    const now = new Date();
    const signatureId = generateSignatureId();
    
    const newSignature: Signature = {
      signatureType: 'treatment',
      signature,
      signatureTimestamp: now.toISOString(),
      signatureId,
      agreed: true,
      witnessSignature: currentSignature?.witnessSignature,
      witnessTimestamp: currentSignature?.witnessTimestamp
    };

    handleSelectChange('signatures', [
      ...formData.signatures.filter(s => s.signatureType !== 'treatment'),
      newSignature
    ]);
  };

  const handleWitnessSignature = (witnessSignature: string) => {
    if (!currentSignature) return;

    const now = new Date();
    const updatedSignature: Signature = {
      ...currentSignature,
      witnessSignature,
      witnessTimestamp: now.toISOString()
    };

    handleSelectChange('signatures', [
      ...formData.signatures.filter(s => s.signatureType !== 'treatment'),
      updatedSignature
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Treatment Services</h1>
        <p className="text-gray-600">Available mental health and recovery options</p>
      </div>

      <Alert className="bg-amber-50 border-amber-200">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <AlertTitle className="text-amber-800">Mandatory Reporting Notice</AlertTitle>
        <AlertDescription className="text-amber-700">
          Journey House is a Third Party mandatory reporting agency for DOC supervision and courts
        </AlertDescription>
        <div className="mt-4 flex items-center gap-3">
          <Checkbox
            id="mandatoryReporting"
            checked={mandatoryReportingAgreed}
            onCheckedChange={handleMandatoryReportingChange}
          />
          <Label htmlFor="mandatoryReporting" className="text-sm text-amber-800">
            I acknowledge that Journey House Foundation is required to report to:
          </Label>
        </div>
        <ul className="ml-8 mt-2 list-disc text-sm text-amber-700">
          <li>Judicial system representatives</li>
          <li>Department of Corrections</li>
        </ul>
      </Alert>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Important Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea 
            ref={scrollRef}
            className="h-64 p-6"
            onScrollCapture={handleScroll}
          >
            <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
              <p>
                Here at Journey House Foundation, we believe firmly that the foundation of recovery involves receiving recovery support services, mental health services, and healthy community engagement. These key components build the foundation for long-term recovery and the skills or resources needed throughout life.
              </p>
              <p>
                As a new participant in our program, we will assist you by providing referrals to an extensive list of licensed providers and treatment centers in the Richmond metro area that may serve as an option for your unique care needs. In the event that you are experiencing transportation barriers, we will assist with referrals for transportation until alternative transportation options are available.
              </p>
              <p>
                Most providers are located within five miles of our recovery center. While you can self-select your preferred provider, qualification depends on your insurance coverage. Our staff and peer navigators will help you schedule appointments and maintain your participant calendar.
              </p>
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center gap-3">
              <Checkbox
                id="agreement"
                checked={hasReadContent}
                onCheckedChange={handleCheckboxChange}
                disabled={!hasScrolledToBottom}
              />
              <Label htmlFor="agreement" className="text-sm text-gray-700">
                I have read and understand the treatment services information
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Potential Treatment Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ul className="space-y-2">
            {["Journey House Behavioral Health RVA", "Master Center for Addiction and Medicine", "Henrico Mental Health"].map((provider, index) => (
              <li key={index} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                <span className="text-gray-800">{provider}</span>
              </li>
            ))}
          </ul>
          <p className="text-gray-900 font-bold">
            Your choice of mental health or treatment option will be discussed and documented in your recovery plan and you will make a choice at that time.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-emerald-500" />
            Authorization
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label htmlFor="treatmentSignature">Resident Signature</Label>
              <Input
                id="treatmentSignature"
                value={currentSignature?.signature || ''}
                onChange={(e) => handleSignatureChange(e.target.value)}
                disabled={!hasReadContent || !mandatoryReportingAgreed}
                placeholder="Type your full legal name"
                className="bg-white"
              />
              <p className="text-sm text-gray-600">
                By typing your name above, you acknowledge understanding Journey House&apos;s treatment policies, including consent for medical care, mandatory reporting requirements, and emergency procedures.
              </p>
              {currentSignature?.signatureTimestamp && (
                <p className="text-sm text-gray-500">
                  Signed: {new Date(currentSignature.signatureTimestamp).toLocaleString()}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <Label htmlFor="treatmentWitnessSignature">Witness Signature</Label>
              <Input
                id="treatmentWitnessSignature"
                value={currentSignature?.witnessSignature || ''}
                onChange={(e) => handleWitnessSignature(e.target.value)}
                disabled={!currentSignature?.signature}
                placeholder="Witness full legal name"
                className="bg-white"
              />
              <p className="text-sm text-gray-600">
                As a witness, your signature verifies that you observed the resident sign this document.
              </p>
              {currentSignature?.witnessTimestamp && (
                <p className="text-sm text-gray-500">
                  Witnessed: {new Date(currentSignature.witnessTimestamp).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {currentSignature?.signatureId && (
            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-gray-500">Document ID: {currentSignature.signatureId}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}