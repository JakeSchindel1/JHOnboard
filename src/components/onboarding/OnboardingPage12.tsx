import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Info, FileCheck } from "lucide-react";
import { FormData, OnboardingPageProps } from '@/types';

interface OnboardingEthicsPageProps extends OnboardingPageProps {}

const generateSignatureId = () => `JH-ETHICS-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

export default function OnboardingEthicsPage({
  formData,
  handleSelectChange,
}: OnboardingEthicsPageProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Find existing ethics signature if it exists
  const ethicsSignature = formData.signatures.find(s => s.signatureType === 'ethics');
  const hasReadContent = Boolean(ethicsSignature?.agreed);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    if (Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) < 1) {
      setHasScrolledToBottom(true);
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    const currentSignatures = formData.signatures.filter(s => s.signatureType !== 'ethics');
    
    if (checked) {
      const newSignature = {
        signatureType: 'ethics' as const,
        signature: '',
        signatureTimestamp: new Date().toISOString(),
        signatureId: generateSignatureId(),
        witnessSignature: '',
        witnessTimestamp: undefined,
        witnessSignatureId: undefined,
        agreed: true
      };
      handleSelectChange('signatures', [...currentSignatures, newSignature]);
    } else {
      handleSelectChange('signatures', currentSignatures);
    }
  };

  const handleSignatureChange = (value: string) => {
    const updatedSignatures = formData.signatures.map(sig => {
      if (sig.signatureType === 'ethics') {
        return {
          ...sig,
          signature: value,
          signatureTimestamp: new Date().toISOString()
        };
      }
      return sig;
    });
    handleSelectChange('signatures', updatedSignatures);
  };

  const handleWitnessSignature = (value: string) => {
    const updatedSignatures = formData.signatures.map(sig => {
      if (sig.signatureType === 'ethics') {
        return {
          ...sig,
          witnessSignature: value,
          witnessTimestamp: value ? new Date().toISOString() : undefined
        };
      }
      return sig;
    });
    handleSelectChange('signatures', updatedSignatures);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Code of Ethics and Values</h1>
        <p className="text-gray-600">Journey House Foundation's guiding principles</p>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Core Values and Ethics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea 
            ref={scrollRef}
            className="h-96"
            onScrollCapture={handleScroll}
          >
            <div className="space-y-6 p-6 text-sm text-gray-700 leading-relaxed">
              {/* Values Section */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Values</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>Stewardship: We lead by example and use resources wisely</li>
                  <li>Mutual Support: We help each other through teamwork</li>
                  <li>Assist: as best we can, those who seek services</li>
                  <li>Empowerment: We entrust our success to our recovery</li>
                  <li>Responsibility: We are accountable to the recovery community</li>
                  <li>Preparation: We keep up to date of the latest information and trends related to recovery</li>
                  <li>Acceptance: We accept all members of the recovery community</li>
                  <li>Authenticity: We are members of the recovery community</li>
                  <li>Inclusivity: We commit to represent all voices; we open our doors to all</li>
                  <li>Compassion: We treat each other with respect and understanding</li>
                  <li>Respect: We are respectful of the diversity- culture, gender, social status, and values- of our community</li>
                </ol>
              </div>

              {/* Ethics Section */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Code of Ethics</h3>
                <p className="mb-4">Journey House is committed to protecting participants' confidentiality and doing no harm - especially when contacting new members of the community who may have little recovery capital.</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>We are stewards of the public trust</li>
                  <li>We use our resources wisely and we lead by example</li>
                  <li>We believe in the concept of mutual support. We help each other through teamwork, and we assist those seeking services</li>
                  <li>We are empowered by entrusting our success to our community; we raise leaders and empower others</li>
                  <li>We are responsible and accountable to the recovery community</li>
                  <li>We keep up to date on the latest information and trends related to recovery community. We are prepared</li>
                  <li>We accept all members of the recovery community</li>
                  <li>We are members of the recovery community, and we commit to authentic representation of all voices in that community</li>
                  <li>We treat each other with compassion, respect, and understanding</li>
                  <li>We are respectful of the diversity of our community, which we define as culture, gender, social status, and values of our community</li>
                  <li>We always respect the Journey House mission and have no competition with each other</li>
                  <li>We DO NOT take advantage of others' weaknesses</li>
                </ol>
              </div>
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center gap-3">
              <Checkbox
                id="agreement"
                checked={hasReadContent}
                onCheckedChange={(checked) => handleCheckboxChange(checked as boolean)}
                disabled={!hasScrolledToBottom}
              />
              <Label htmlFor="agreement" className="text-sm text-gray-700">
                I have read and understand the Journey House Code of Ethics and Values
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signature Section */}
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
              <Label htmlFor="signature">Resident Signature</Label>
              <Input
                id="signature"
                value={ethicsSignature?.signature || ''}
                onChange={(e) => handleSignatureChange(e.target.value)}
                disabled={!hasReadContent}
                placeholder="Type your full legal name"
                className="bg-white"
              />
              {ethicsSignature?.signatureTimestamp && (
                <p className="text-sm text-gray-500">
                  Signed: {new Date(ethicsSignature.signatureTimestamp).toLocaleString()}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <Label htmlFor="witnessSignature">Witness Signature</Label>
              <Input
                id="witnessSignature"
                value={ethicsSignature?.witnessSignature || ''}
                onChange={(e) => handleWitnessSignature(e.target.value)}
                disabled={!ethicsSignature?.signature}
                placeholder="Witness full legal name"
                className="bg-white"
              />
              {ethicsSignature?.witnessTimestamp && (
                <p className="text-sm text-gray-500">
                  Witnessed: {new Date(ethicsSignature.witnessTimestamp).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {ethicsSignature?.signatureId && (
            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-gray-500">Document ID: {ethicsSignature.signatureId}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}