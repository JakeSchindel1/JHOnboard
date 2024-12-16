import React, { useState, useRef } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileCheck, ScrollText } from "lucide-react";

interface FormData {
  consentSignature?: string;
  consentAgreed?: boolean;
  consentTimestamp?: string;
  witnessSignature?: string;
  witnessTimestamp?: string;
  signatureId?: string;
}

interface OnboardingPage5Props {
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
}

const generateSignatureId = () => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  return `JH-${timestamp}-${randomString}`;
};

export default function OnboardingPage5({
  formData = {},
  handleInputChange,
  handleSelectChange,
}: OnboardingPage5Props) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [agreed, setAgreed] = useState(Boolean(formData.consentAgreed));
  const scrollRef = useRef<HTMLDivElement>(null);

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
    handleSelectChange('consentAgreed', checked.toString());
    if (checked) {
      const now = new Date();
      const timestamp = now.toISOString();
      const signatureId = generateSignatureId();
      handleSelectChange('consentTimestamp', timestamp);
      handleSelectChange('signatureId', signatureId);
    }
  };

  const handleWitnessSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e);
    if (e.target.value) {
      const now = new Date();
      const timestamp = now.toISOString();
      handleSelectChange('witnessTimestamp', timestamp);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">EMERGENCY ROOM & MEDICAL APPOINTMENTS POLICY</h2>
        <p className="text-sm text-gray-600">Please read carefully and complete all sections</p>
      </div>

      {/* Policy Content Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ScrollText className="h-5 w-5 text-blue-500" />
            Policy Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea 
            ref={scrollRef} 
            className="h-96 w-full rounded-md border p-4"
            onScrollCapture={handleScroll}
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-800 leading-relaxed">
                Your mental and physical health are important to us here at Journey House Richmond, LLC&apos;s &quot;Journey House&quot;. We encourage you to seek assistance from doctors if you require those services. <span className="font-semibold">If you are within your first 30 days, please ask a member of staff or a Journey House PRS (Such as Recovery Corps) to help assist you in being connected with a medical provider that is within network and our transportation driving radius.</span>
              </p>

              <p className="text-sm text-gray-800 leading-relaxed">
                Which is a 5-mile radius from our center at 7740 Shrader Rd Suite F Richmond, VA 23228. If you choose to utilize a provider beyond our driving radius you will be responsible for finding your own means to your appointment and if within your first 30 days or probationary period, will be required to take someone from Journey House with you.
              </p>

              <p className="text-sm text-gray-800 leading-relaxed">
                Your mental and physical health is equally important to the safety and protection of the entire community. Before choosing to be part of the recovery culture many of us spend a lot of time drug seeking through doctors. It is incredibly important to the well-being of our community that such behavior stops here at journey house.
              </p>

              <p className="text-sm text-gray-800 leading-relaxed">
                If you need to see a psychiatrist due to mental health concerns or need to see a doctor for physical health concerns, please speak to a member of Journey House staff or send a group text to staff and await a response. If it is an emergency and you are unable to do so, please ask a member of your house to reach out on your behalf.
              </p>

              <p className="text-sm text-gray-800 leading-relaxed">
                <span className="font-semibold">When you need to go back to the hospital or doctor, please bring your discharge paperwork back to be shared. Journey House Staff who will turn will create a copy and place it in your file.</span>
              </p>

              <p className="text-sm text-gray-800 leading-relaxed">
                <span className="font-semibold">If you receive a new prescription from a doctor. You must Notify Journey House staff via staff group text with your peer leader before you can begin taking the prescription.</span> Please note medication must be taken as prescribed in accordance with the policies and procedures of journey house medication should not impair your ability to function while resigning with journey house medications must be stored in their original bottles and labeled with their name and date of birth, please. <span className="font-semibold">Your medication must be stored in a lockbox</span>.
              </p>

              <p className="text-sm text-gray-800 leading-relaxed">
                <span className="font-semibold">If you take a mind-altering substance while in Journey House and you did not notify the physician, you are an addict it will be considered a relapse and our relapse policy will be followed</span>. If it was determined to medically necessity in the ER, you are required to present a letter from the treating physician starting that the physician was aware you have a history of substance abuse issues and felt the medication was medically necessary while you were under their care. No take-home mood-altering substance will be allowed at Journey House.
              </p>

              <p className="text-sm text-gray-800 leading-relaxed font-semibold">
                We as an organization do not allow TO TAKE home Methadone at any time.
              </p>

              <p className="text-sm text-gray-800 leading-relaxed">
                Due to the importance of maintaining our abstinence free environment if you feel that you really need something, but staff disagrees, please do what is right for you but you will no longer be allowed to continue residing with us. Staff will try to reach out to another facility that may allow such medication. If none are available, it is your responsibility to find your own residence because you choose to take the substance despite knowing about Journey Houses policy.
              </p>

              <p className="text-sm text-gray-800 leading-relaxed">
                Journey House limits the use of certain over-the-counter medications and items that contain alcohol or other mood-altering substances. Residents of journey house cannot take over the counter medicine that contains alcohol or suit of doctrine residents cannot use products with alcohol in it like mouthwash cough syrup and containing alcohol not normally used or approved for the indigestion are approved if use for the intended purposes IE Cologne and Hairspray
              </p>
            </div>
          </ScrollArea>

          {/* Consent Checkbox */}
          <div className="flex items-center space-x-2 border-t pt-4 mt-4">
            <Checkbox
              id="consentAgreed"
              checked={agreed}
              onCheckedChange={handleCheckboxChange}
              disabled={!hasScrolledToBottom}
            />
            <label
              htmlFor="consentAgreed"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have read and understand Journey House&apos;s Medical and Medication Policy
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
                <Label htmlFor="consentSignature" className="text-base font-semibold block mb-2">
                  Resident Signature
                </Label>
                <Input
                  id="consentSignature"
                  name="consentSignature"
                  value={formData.consentSignature || ''}
                  onChange={handleInputChange}
                  required
                  disabled={!agreed}
                  placeholder="Type your full legal name to sign"
                  className="bg-white"
                />
                <p className="text-sm text-gray-600 mt-2">
                  By typing your name above, you acknowledge that you have read, understand, and agree to Journey House&apos;s Medical and Medication Policy.
                </p>
                {formData.consentTimestamp && (
                  <div className="mt-3 text-sm text-gray-500">
                    <p>Signed on: {new Date(formData.consentTimestamp).toLocaleString()}</p>
                    <p>Signature ID: {formData.signatureId}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Witness Signature */}
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label htmlFor="witnessSignature" className="text-base font-semibold block mb-2">
                  Witness Signature
                </Label>
                <Input
                  id="witnessSignature"
                  name="witnessSignature"
                  value={formData.witnessSignature || ''}
                  onChange={handleWitnessSignature}
                  required
                  disabled={!formData.consentSignature}
                  placeholder="Witness full legal name"
                  className="bg-white"
                />
                <p className="text-sm text-gray-600 mt-2">
                  As a witness, your signature verifies that you observed the resident sign this document.
                </p>
                {formData.witnessTimestamp && (
                  <p className="mt-3 text-sm text-gray-500">
                    Witnessed on: {new Date(formData.witnessTimestamp).toLocaleString()}
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
            {formData.signatureId && (
              <p className="text-sm font-medium">
                Document Reference Number: {formData.signatureId}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}