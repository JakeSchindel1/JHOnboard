import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Info, 
  Building2, 
  Activity, 
  Shield, 
  Hotel,
  CheckCircle2,
  FileCheck
} from "lucide-react";

interface OnboardingPage8Props {
  formData: {
    treatmentSignature?: string;
    treatmentAgreed?: boolean;
    treatmentTimestamp?: string;
    treatmentwitnessSignature?: string;
    treatmentwitnessTimestamp?: string;
    treatmentsignatureId?: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
}

const generateSignatureId = () => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  return `JH-${timestamp}-${randomString}`;
};

export default function OnboardingPage8({
  formData = {},
  handleInputChange,
  handleSelectChange,
}: OnboardingPage8Props) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [hasReadContent, setHasReadContent] = useState(false);
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
    setHasReadContent(checked);
    handleSelectChange('treatmentAgreed', checked.toString());
    if (checked) {
      const now = new Date();
      const timestamp = now.toISOString();
      const signatureId = generateSignatureId();
      handleSelectChange('treatmentTimestamp', timestamp);
      handleSelectChange('treatmentsignatureId', signatureId);
    }
  };

  const handleWitnessSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e);
    if (e.target.value) {
      const now = new Date();
      const timestamp = now.toISOString();
      handleSelectChange('treatmentwitnessTimestamp', timestamp);
    }
  };

  const serviceTypes = {
    intensive: {
      icon: <Activity className="h-5 w-5 text-purple-500" />,
      color: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    detox: {
      icon: <Building2 className="h-5 w-5 text-blue-500" />,
      color: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    medication: {
      icon: <Shield className="h-5 w-5 text-green-500" />,
      color: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    inpatient: {
      icon: <Hotel className="h-5 w-5 text-red-500" />,
      color: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Mental Health and Treatment Services Options</h2>
        <p className="text-sm text-gray-600">Available services and treatment options</p>
      </div>

      {/* Introduction and Scroll Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Info className="h-5 w-5 text-blue-500" />
            Important Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea 
            ref={scrollRef} 
            className="h-64 w-full rounded-md border p-4"
            onScrollCapture={handleScroll}
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-800 leading-relaxed">
                Here at Journey House Foundation, we believe firmly that the foundation of recovery involves receiving recovery support services, mental health services, and healthy community engagement. These key components build the foundation for long-term recovery and the skills or resources needed throughout life. The mental health services or treatment options for participants are dealing with acute and chronic mental health symptoms of addiction.
              </p>

              <p className="text-sm text-gray-800 leading-relaxed">
                As a new participant in our program, we will assist you by providing referrals to an extensive list of licensed providers and treatment centers in the Richmond metro area that may serve as an option for your unique care needs. In the event that you are experiencing transportation barriers, we will assist with referrals for transportation until alternative transportation options are available.
              </p>

              <p className="text-sm text-gray-800 leading-relaxed">
                Below is a list of reputable and commonly used providers and treatment centers, most of which are located in the Richmond metro area and conveniently a distance of five miles or less from our recovery center. While you have the option to self-select your preferred provider, please note that your ability to qualify is dependent on your insurance. Journey House staff members and your peer navigators are here to assist you with scheduling appointments and ensuring that they are documented on our participant calendar.
              </p>
            </div>
          </ScrollArea>

          <div className="flex items-center space-x-2 border-t pt-4 mt-4">
            <Checkbox
              id="hasReadContent"
              checked={hasReadContent}
              onCheckedChange={handleCheckboxChange}
              disabled={!hasScrolledToBottom}
            />
            <label
              htmlFor="hasReadContent"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have read and understand the treatment services information
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Services Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Intensive Outpatient Treatment Card */}
        <Card className={`${serviceTypes.intensive.color} border ${serviceTypes.intensive.borderColor} transition-transform hover:scale-[1.02]`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {serviceTypes.intensive.icon}
              Intensive Outpatient Treatment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-800 space-y-2">
              {[
                "Henrico County Mental Health",
                "River City Integrative Counseling",
                "Master Center",
                "Motivate Clinic",
                "Dominion Family and Youth Service",
              ].map((service, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-500" />
                  {service}
                </li>
              ))}
              <li className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-500" />
                  Journey House Behavioral Health
                </div>
                <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                  Coming Soon!
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Detox Services Card */}
        <Card className={`${serviceTypes.detox.color} border ${serviceTypes.detox.borderColor} transition-transform hover:scale-[1.02]`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {serviceTypes.detox.icon}
              Detox Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-800 space-y-2">
              {[
                "Tucker Pavilion",
                "Henrico County Mental Health (Parham)",
                "Master Center (outpatient)",
                "Pyramid Treatment Facility"
              ].map((service, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  {service}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Medication Assisted Treatment Card */}
        <Card className={`${serviceTypes.medication.color} border ${serviceTypes.medication.borderColor} transition-transform hover:scale-[1.02]`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {serviceTypes.medication.icon}
              Medication Assisted Treatment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-800 space-y-2">
              {[
                "Henrico County Mental Health",
                "Merchant Logo",
                "Verity Psychiatry",
                "Master Center",
                "Motivate Clinic",
                "Dominion Youth and Family Services"
              ].map((service, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  {service}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Inpatient Treatment Options Card */}
        <Card className={`${serviceTypes.inpatient.color} border ${serviceTypes.inpatient.borderColor} transition-transform hover:scale-[1.02]`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {serviceTypes.inpatient.icon}
              Inpatient Treatment Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-gray-800 space-y-2">
              {[
                "Life Center of Galax",
                "Pyramid treatment Center",
                "Wilmington Treatment Center",
                "Mount Regis Treatment Centers",
                "River City Residential Service",
                "Pinnacle Treatment Centers, Inc."
              ].map((service, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-red-500" />
                  {service}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Footer Note */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-800 leading-relaxed">
            Your choice of mental health or treatment option will be discussed and documented in your recovery plan and you will make a choice at that time.
          </p>
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
                <Label htmlFor="treatmentSignature" className="text-base font-semibold block mb-2">
                  Resident Signature
                </Label>
                <Input
                  id="treatmentSignature"
                  name="treatmentSignature"
                  value={formData.treatmentSignature || ''}
                  onChange={handleInputChange}
                  required
                  disabled={!hasReadContent}
                  placeholder="Type your full legal name to sign"
                  className="bg-white"
                />
                <p className="text-sm text-gray-600 mt-2">
                  By typing your name above, you acknowledge that you have read and understand the available treatment options.
                </p>
                {formData.treatmentTimestamp && (
                  <div className="mt-3 text-sm text-gray-500">
                    <p>Signed on: {new Date(formData.treatmentTimestamp).toLocaleString()}</p>
                    <p>Signature ID: {formData.treatmentsignatureId}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Witness Signature */}
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label htmlFor="treatmentwitnessSignature" className="text-base font-semibold block mb-2">
                  Witness Signature
                </Label>
                <Input
                  id="treatmentwitnessSignature"
                  name="treatmentwitnessSignature"
                  value={formData.treatmentwitnessSignature || ''}
                  onChange={handleWitnessSignature}
                  required
                  disabled={!formData.treatmentSignature}
                  placeholder="Witness full legal name"
                  className="bg-white"
                />
                <p className="text-sm text-gray-600 mt-2">
                  As a witness, your signature verifies that you observed the resident sign this document.
                </p>
                {formData.treatmentwitnessTimestamp && (
                  <p className="mt-3 text-sm text-gray-500">
                    Witnessed on: {new Date(formData.treatmentwitnessTimestamp).toLocaleString()}
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
            {formData.treatmentsignatureId && (
              <p className="text-sm font-medium">
                Document Reference Number: {formData.treatmentsignatureId}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}