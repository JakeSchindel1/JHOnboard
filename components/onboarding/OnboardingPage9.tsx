import React, { useState, useRef } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileCheck, ScrollText, DollarSign, Info } from "lucide-react";

interface FormData {
  priceConsentSignature?: string;
  priceConsentAgreed?: boolean;
  priceConsentTimestamp?: string;
  priceWitnessSignature?: string;
  priceWitnessTimestamp?: string;
  priceSignatureId?: string;
}

interface PricingAgreementProps {
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
}

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
  formData = {},
  handleInputChange,
  handleSelectChange,
}: PricingAgreementProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [agreed, setAgreed] = useState(Boolean(formData.priceConsentAgreed));

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
    handleSelectChange('priceConsentAgreed', checked.toString());
    if (checked) {
      const now = new Date();
      const timestamp = now.toISOString();
      const signatureId = generateSignatureId();
      handleSelectChange('priceConsentTimestamp', timestamp);
      handleSelectChange('priceSignatureId', signatureId);
    }
  };

  const handleWitnessSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e);
    if (e.target.value) {
      const now = new Date();
      const timestamp = now.toISOString();
      handleSelectChange('priceWitnessTimestamp', timestamp);
    }
  };

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
                It is the policy of The Journey House Richmond, LLC (&quot;Journey House&quot;) that residents are not allowed to fall behind on their administrative fees, Programming fees or Bed fees. Administrative &quot;Processing&quot; fees & program fees are due at the time of admission and thenceforth recur. Bed Fees are due every Friday for the week in advance. Residents must fill out a Program Payment Form (which requires a confirmation signature from Executive staff) and an Intake Monitory Agreement Form.
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
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-700">Administrative &quot;Processing&quot; Rate</span>
                    <PriceBox amount="$300.00/intake" />
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-700">Daily Rate (only for prorated weeks)</span>
                    <PriceBox amount="$25.00/day" />
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-700">Weekly rate</span>
                    <PriceBox amount="$175.00/week" />
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-700">Monthly rate (must be paid in a single payment)</span>
                    <PriceBox amount="$700.00/month" />
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-700">Drug Screens</span>
                    <PriceBox amount="$35.00/per test" />
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-700">Transportation labor rate①</span>
                    <PriceBox amount="$15.00/half hour" />
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-700">Afterhours Transportation Labor①</span>
                    <PriceBox amount="$20.00/half hour" />
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-700">Transportation rate per mile①</span>
                    <PriceBox amount="$1.50/mile" />
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-700">Sober Companion Labor per hour</span>
                    <PriceBox amount="$25.00/hr" />
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-700">Sober Companion Labor with vehicle①</span>
                    <PriceBox amount="$35.00/hr" />
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-700">Care Coordination with Peer</span>
                    <PriceBox amount="$40.00/hr" />
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-700">PRS Led Group</span>
                    <PriceBox amount="$30.00/hr" />
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-700">Staff Led Group</span>
                    <PriceBox amount="$40.00/hr" />
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-700">RECCAP/S.M.A.R.T. Goals</span>
                    <PriceBox amount="$40.00/hr" />
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-700">Intake Assessment</span>
                    <PriceBox amount="$40.00/hr" />
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-700">New Recovery Plan</span>
                    <PriceBox amount="$40.00/plan" />
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-700">Daily Transportation to Center</span>
                    <PriceBox amount="$25.00/day" />
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-700">Sobriety Coordination</span>
                    <PriceBox amount="$40.00/hr" />
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-700">Afterhours Staff Emergency Event②</span>
                    <PriceBox amount="$75.00/hr" />
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="text-gray-700">Funds handling fee③</span>
                    <PriceBox amount="$10.00/transaction" />
                  </div>
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
              I have read and understand Journey House&apos;s Fee Schedule and Payment Policy
            </label>
          </div>
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
                <Label htmlFor="priceConsentSignature" className="text-base font-semibold block mb-2">
                  Resident Signature
                </Label>
                <Input
                  id="priceConsentSignature"
                  name="priceConsentSignature"
                  value={formData.priceConsentSignature || ''}
                  onChange={handleInputChange}
                  required
                  disabled={!agreed}
                  placeholder="Type your full legal name to sign"
                  className="bg-white"
                />
                <p className="text-sm text-gray-600 mt-2">
                  By typing your name above, you acknowledge that you have read, understand, and agree to Journey House&apos;s Fee Schedule and Payment Policy.
                </p>
                {formData.priceConsentTimestamp && (
                  <div className="mt-3 text-sm text-gray-500">
                    <p>Signed on: {new Date(formData.priceConsentTimestamp).toLocaleString()}</p>
                    <p>Signature ID: {formData.priceSignatureId}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Witness Signature */}
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label htmlFor="priceWitnessSignature" className="text-base font-semibold block mb-2">
                  Witness Signature
                </Label>
                <Input
                  id="priceWitnessSignature"
                  name="priceWitnessSignature"
                  value={formData.priceWitnessSignature || ''}
                  onChange={handleWitnessSignature}
                  required
                  disabled={!formData.priceConsentSignature}
                  placeholder="Witness full legal name"
                  className="bg-white"
                />
                <p className="text-sm text-gray-600 mt-2">
                  As a witness, your signature verifies that you observed the resident sign this document.
                </p>
                {formData.priceWitnessTimestamp && (
                  <p className="mt-3 text-sm text-gray-500">
                    Witnessed on: {new Date(formData.priceWitnessTimestamp).toLocaleString()}
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
            {formData.priceSignatureId && (
              <p className="text-sm font-medium">
                Document Reference Number: {formData.priceSignatureId}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}