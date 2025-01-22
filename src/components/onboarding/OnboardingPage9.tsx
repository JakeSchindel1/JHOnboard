import React, { useState, useRef } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileCheck, ScrollText, DollarSign, Info } from "lucide-react";
import { OnboardingPageProps, Signature } from '@/types';

const generateSignatureId = () => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  return `JH-PRICE-${timestamp}-${randomString}`;
};

const PriceBox = ({ amount }: { amount: string }) => (
  <div className="bg-green-100 text-green-800 font-semibold px-3 py-1 rounded-md border border-green-200 shadow-sm hover:bg-green-50 transition-colors">
    {amount}
  </div>
);

const SubNote = ({ icon, text }: { icon: string; text: string }) => (
  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-md border border-gray-100 hover:bg-gray-100 transition-colors">
    <div className="flex-shrink-0 text-blue-500 font-medium w-6 text-center">{icon}</div>
    <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
  </div>
);

export default function PricingAgreement({
  formData,
  handleInputChange,
  handleSelectChange,
}: OnboardingPageProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const currentSignature = formData.signatures.find(s => s.signatureType === 'price_consent');
  const [agreed, setAgreed] = useState(Boolean(currentSignature?.agreed));

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const reachedBottom = Math.abs(
      element.scrollHeight - element.clientHeight - element.scrollTop
    ) < 1;
    
    if (reachedBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setAgreed(checked);
    
    const existingSignature = formData.signatures.find(s => s.signatureType === 'price_consent');
    const updatedSignature: Signature = {
      signatureType: 'price_consent',
      signature: existingSignature?.signature || '',
      signatureTimestamp: existingSignature?.signatureTimestamp || '',
      signatureId: existingSignature?.signatureId || '',
      agreed: checked
    };

    handleSelectChange('signatures', [
      ...formData.signatures.filter(s => s.signatureType !== 'price_consent'),
      updatedSignature
    ]);
  };

  const handleSignatureChange = (signature: string) => {
    const now = new Date();
    const signatureId = generateSignatureId();
    
    const newSignature: Signature = {
      signatureType: 'price_consent',
      signature,
      signatureTimestamp: now.toISOString(),
      signatureId,
      agreed: true,
      witnessSignature: currentSignature?.witnessSignature,
      witnessTimestamp: currentSignature?.witnessTimestamp
    };

    handleSelectChange('signatures', [
      ...formData.signatures.filter(s => s.signatureType !== 'price_consent'),
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
      ...formData.signatures.filter(s => s.signatureType !== 'price_consent'),
      updatedSignature
    ]);
  };

  const pricingItems = [
    { label: "Administrative 'Processing' Rate", amount: "$200.00/intake" },
    { label: "Daily Rate (only for prorated weeks)", amount: "$25.00/day" },
    { label: "Weekly rate", amount: "$175.00/week" },
    { label: "Drug Screens", amount: "$35.00/per test" },
    { label: "Transportation labor rate①", amount: "$15.00/half hour" },
    { label: "Afterhours Transportation Labor①", amount: "$20.00/half hour" },
    { label: "Transportation rate per mile①", amount: "$1.50/mile" },
    { label: "Sober Companion Labor per hour", amount: "$25.00/hr" },
    { label: "Sober Companion Labor with vehicle①", amount: "$35.00/hr" },
    { label: "Care Coordination with Peer", amount: "$40.00/hr" },
    { label: "PRS Led Group", amount: "$30.00/hr" },
    { label: "Staff Led Group", amount: "$40.00/hr" },
    { label: "RECCAP/S.M.A.R.T. Goals", amount: "$40.00/hr" },
    { label: "Intake Assessment", amount: "$40.00/hr" },
    { label: "New Recovery Plan", amount: "$40.00/plan" },
    { label: "Daily Transportation to Center", amount: "$25.00/day" },
    { label: "Sobriety Coordination", amount: "$40.00/hr" },
    { label: "Afterhours Staff Emergency Event②", amount: "$75.00/hr" },
    { label: "Funds handling fee③", amount: "$10.00/transaction" }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">JOURNEY HOUSE PRICING AGREEMENT</h2>
        <p className="text-sm text-gray-600">Please read carefully and complete all sections</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5 text-green-500" />
            Journey House Fees and Policies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea 
            className="h-96 w-full rounded-md border p-4"
            onScrollCapture={handleScroll}
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-800 leading-relaxed">
                It is the policy of The Journey House Richmond, LLC ("Journey House") that residents are not allowed to fall behind on their administrative fees, Programming fees or Bed fees. Administrative "Processing" fees & program fees are due at the time of admission and thenceforth recur. Bed Fees are due every Friday for the week in advance. Residents must fill out a Program Payment Form (which requires a confirmation signature from Executive staff) and an Intake Monitory Agreement Form.
              </p>

              <p className="text-sm text-gray-800 leading-relaxed">
                If a resident comes in during the current week, they must pay a prorated amount at a daily rate to become acclimated to the payment schedule of every Friday.
              </p>

              <p className="text-sm text-gray-800 leading-relaxed">
                Residents who fall behind in their fees will have restrictions and it more than two weeks can be discharged from Journey House.
              </p>

              <h3 className="text-lg font-bold mt-6 mb-4">FEE SCHEDULE</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-4 text-sm">
                  {pricingItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-700">{item.label}</span>
                      <PriceBox amount={item.amount} />
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="h-5 w-5 text-blue-500" />
                    <h4 className="font-semibold text-gray-800">Important Notes</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <SubNote 
                      icon="①" 
                      text="Transportation has a labor rate either staff or sober companion and mileage rate." 
                    />
                    <SubNote 
                      icon="②" 
                      text="The participant has to be so noncompliant that the peer leader is unable to handle the situation and emergency services are involved." 
                    />
                    <SubNote 
                      icon="③" 
                      text="For bed-fee transaction done in person and not through the rec-cap portal while in sober living or step-up" 
                    />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-bold text-green-800">
                    Weekly Bed Fee Amounts for Every Participant is $175.00 and is due weekly on Friday by 7pm in the Rec-Cap Portal, for the week in advance.
                  </p>
                </div>

                <p className="text-sm text-gray-800">
                  Payments made in person while in Sober Living or Step-Up may result in a $10/transaction handling fee. Payments invoiced to families will be updated by staff in the rec-cap portal once payment has been confirmed, and there will be no handling fee associated with it.
                </p>

                <p className="text-sm text-gray-800">
                  We offer a monthly rate paid at a set time for the entire month in one payment. Split-up monthly payments will be returned to the weekly rate.
                </p>
              </div>
            </div>
          </ScrollArea>

          {/* Consent Checkbox */}
          <div className="flex items-center space-x-2 border-t pt-4 mt-4">
            <Checkbox
              id="priceConsentAgreed"
              checked={agreed}
              onCheckedChange={handleCheckboxChange}
              disabled={!hasScrolledToBottom}
            />
            <label
              htmlFor="priceConsentAgreed"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have read and understand Journey House's Fee Schedule and Payment Policy
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Signature Section */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-emerald-500" />
            Authorization & Signatures
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label htmlFor="priceConsentSignature">Resident Signature</Label>
              <Input
                id="priceConsentSignature"
                value={currentSignature?.signature || ''}
                onChange={(e) => handleSignatureChange(e.target.value)}
                required
                disabled={!agreed}
                placeholder="Type your full legal name to sign"
                className="bg-white"
              />
              <p className="text-sm text-gray-600">
                By typing your name above, you acknowledge that you have read, understand, and agree to Journey House's Fee Schedule and Payment Policy.
              </p>
              {currentSignature?.signatureTimestamp && (
                <p className="text-sm text-gray-500">
                  Signed: {new Date(currentSignature.signatureTimestamp).toLocaleString()}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <Label htmlFor="priceConsentWitnessSignature">Witness Signature</Label>
              <Input
                id="priceConsentWitnessSignature"
                value={currentSignature?.witnessSignature || ''}
                onChange={(e) => handleWitnessSignature(e.target.value)}
                required
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