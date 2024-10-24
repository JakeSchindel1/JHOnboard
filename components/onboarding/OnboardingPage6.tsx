import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle, ListPlus, FileCheck } from "lucide-react";

interface OnboardingPage6Props {
  formData: {
    medications: string[];
    medicationSignature?: string;
    medicationSignatureDate?: string;
    medicationWitnessSignature?: string;
    medicationWitnessTimestamp?: string;
    medicationSignatureId?: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string | string[]) => void;
}

const generateSignatureId = () => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  return `JH-MED-${timestamp}-${randomString}`;
};

export default function OnboardingPage6({
  formData,
  handleInputChange,
  handleSelectChange
}: OnboardingPage6Props) {
  const [medications, setMedications] = React.useState<string[]>(formData.medications || ['']);

  const handleMedicationChange = (index: number, value: string) => {
    const newMedications = [...medications];
    newMedications[index] = value;
    setMedications(newMedications);
    handleSelectChange('medications', newMedications);
  };

  const addMedicationField = () => {
    setMedications([...medications, '']);
  };

  const removeMedicationField = (index: number) => {
    const newMedications = medications.filter((_, i) => i !== index);
    setMedications(newMedications);
    handleSelectChange('medications', newMedications);
  };

  const handleSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e);
    if (e.target.name === 'medicationSignature') {
      const now = new Date();
      const timestamp = now.toISOString();
      const signatureId = generateSignatureId();
      handleSelectChange('medicationSignatureDate', timestamp);
      handleSelectChange('medicationSignatureId', signatureId);
    }
  };

  const handleWitnessSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e);
    if (e.target.name === 'medicationWitnessSignature' && e.target.value) {
      const now = new Date();
      const timestamp = now.toISOString();
      handleSelectChange('medicationWitnessTimestamp', timestamp);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">MEDICATION POLICY</h2>
        <p className="text-sm text-gray-600">Please read carefully and complete all sections</p>
      </div>

      {/* Policy Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Important Policy Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {/* Main Requirements */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="font-semibold text-blue-900 mb-2">
              LIST ALL MEDICATIONS CURRENTLY PRESCRIBED TO YOU BY YOUR DOCTOR AND PRESENT YOUR PRESCRIPTIONS TO THE PERSON DOING YOUR INTAKE. INCLUDE ANY OVER THE COUNTER.
            </p>
          </div>

          {/* Key Points in Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="font-medium mb-2">Storage Requirements</p>
              <p>ALL MEDICATION MUST BE STORED IN A LOCK BOX.</p>
              <p className="font-bold text-red-600 mt-2">
                JOURNEY HOUSE IS NOT RESPONSIBLE TO SUPPLY YOU A LOCKBOX FOR YOUR MEDICATIONS.
              </p>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="font-medium mb-2">Monitoring Policy</p>
              <p>
                JOURNEY HOUSE RESIDENTS ON MEDICATION WILL AGREE TO SUPERVISED PILL COUNT OR ALLOW JOURNEY HOUSE STAFF TO CONDUCT A RANDOM, WITNESSED PILL COUNT AT THE STAFF&apos;S DISCRETION.
              </p>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-yellow-900">
              ANY MEDICATION LEFT AT A JOURNEY HOUSE RESIDENCE AFTER THE RESIDENT HAS LEFT WILL BE BROUGHT TO THE CENTER AND BE DESTROYED IF AND WHEN YOUR BELONGINGS ARE NOT PICKED UP WITH 14 DAYS.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Medication List Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ListPlus className="h-5 w-5 text-blue-500" />
            Medication List
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 italic">
            If you do not take any medications, please write &quot;none&quot;, then sign &amp; date.
          </p>
          
          {medications.map((medication, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input
                value={medication}
                onChange={(e) => handleMedicationChange(index, e.target.value)}
                placeholder={index === 0 ? "Enter medication or type 'none'" : "Enter medication"}
                className="flex-1"
              />
              {medications.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeMedicationField(index)}
                  className="shrink-0"
                >
                  Remove
                </Button>
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addMedicationField}
            className="w-full"
          >
            Add More Medications
          </Button>
        </CardContent>
      </Card>

      {/* Signature Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileCheck className="h-5 w-5 text-green-500" />
            Authorization &amp; Signatures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resident Signature */}
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label htmlFor="medicationSignature" className="text-base font-semibold block mb-2">
                  Resident Signature
                </Label>
                <Input
                  id="medicationSignature"
                  name="medicationSignature"
                  value={formData.medicationSignature || ''}
                  onChange={handleSignature}
                  required
                  placeholder="Type your full legal name to sign"
                  className="bg-white"
                />
                <p className="text-sm text-gray-600 mt-2">
                  By typing your name above, you confirm that this medication list is complete and accurate, and you understand the lockbox requirement.
                </p>
                {formData.medicationSignatureDate && (
                  <div className="mt-3 text-sm text-gray-500">
                    <p>Signed on: {new Date(formData.medicationSignatureDate).toLocaleString()}</p>
                    <p>Signature ID: {formData.medicationSignatureId}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Witness Signature */}
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <Label htmlFor="medicationWitnessSignature" className="text-base font-semibold block mb-2">
                  Witness Signature
                </Label>
                <Input
                  id="medicationWitnessSignature"
                  name="medicationWitnessSignature"
                  value={formData.medicationWitnessSignature || ''}
                  onChange={handleWitnessSignature}
                  required
                  disabled={!formData.medicationSignature}
                  placeholder="Witness full legal name"
                  className="bg-white"
                />
                <p className="text-sm text-gray-600 mt-2">
                  As a witness, your signature verifies that you observed the resident sign this document.
                </p>
                {formData.medicationWitnessTimestamp && (
                  <p className="mt-3 text-sm text-gray-500">
                    Witnessed on: {new Date(formData.medicationWitnessTimestamp).toLocaleString()}
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
            {formData.medicationSignatureId && (
              <p className="text-sm font-medium">
                Document Reference Number: {formData.medicationSignatureId}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}