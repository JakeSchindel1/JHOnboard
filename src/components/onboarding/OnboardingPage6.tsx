import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle, ListPlus, FileCheck } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OnboardingPage6Props, Signature } from '@/types';

const generateSignatureId = () => `JH-MED-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

export default function OnboardingPage6({
  formData,
  isOnMAT,
  handleInputChange,
  handleSelectChange
}: OnboardingPage6Props) {
  const [medications, setMedications] = React.useState<string[]>(formData.medications || ['']);
  const currentSignature = formData.signatures.find(s => s.signatureType === 'medication');

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

  const handleSignatureChange = (signature: string) => {
    const now = new Date();
    const signatureId = generateSignatureId();
    
    const newSignature: Signature = {
      signatureType: 'medication',
      signature,
      signatureTimestamp: now.toISOString(),
      signatureId,
      agreed: true,
      witnessSignature: currentSignature?.witnessSignature,
      witnessTimestamp: currentSignature?.witnessTimestamp
    };

    handleSelectChange('signatures', [
      ...formData.signatures.filter(s => s.signatureType !== 'medication'),
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
      ...formData.signatures.filter(s => s.signatureType !== 'medication'),
      updatedSignature
    ]);
  };

  const handleMatMedicationChange = (value: string) => {
    handleSelectChange('medicalInformation.matMedication', value);
    if (value !== 'other') {
      handleSelectChange('medicalInformation.matMedicationOther', '');
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">MEDICATION POLICY</h2>
        <p className="text-sm text-gray-600">Please read carefully and complete all sections</p>
      </div>

      {/* Policy Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Important Policy Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="font-semibold text-blue-900 mb-2">
              LIST ALL MEDICATIONS CURRENTLY PRESCRIBED TO YOU BY YOUR DOCTOR AND PRESENT YOUR PRESCRIPTIONS TO THE PERSON DOING YOUR INTAKE. INCLUDE ANY OVER THE COUNTER.
            </p>
          </div>

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

          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-yellow-900">
              ANY MEDICATION LEFT AT A JOURNEY HOUSE RESIDENCE AFTER THE RESIDENT HAS LEFT WILL BE BROUGHT TO THE CENTER AND BE DESTROYED IF AND WHEN YOUR BELONGINGS ARE NOT PICKED UP WITH 14 DAYS.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Medication List Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ListPlus className="h-5 w-5 text-blue-500" />
            Medication List
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isOnMAT && (
            <div className="mb-6">
              <Card className="bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-base">MAT Medication</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={formData.medicalInformation.matMedication || 'unselected'}
                    onValueChange={handleMatMedicationChange}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select your MAT medication" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unselected">Select medication</SelectItem>
                      <SelectItem value="belbuca">Belbuca</SelectItem>
                      <SelectItem value="brixadi">Brixadi</SelectItem>
                      <SelectItem value="bunavail">Bunavail</SelectItem>
                      <SelectItem value="butrans">Butrans</SelectItem>
                      <SelectItem value="cassipa">Cassipa</SelectItem>
                      <SelectItem value="contrave">Contrave</SelectItem>
                      <SelectItem value="dolophine_hydrochloride">Dolophine Hydrochloride</SelectItem>
                      <SelectItem value="embeda">Embeda</SelectItem>
                      <SelectItem value="probuphine">Probuphine</SelectItem>
                      <SelectItem value="relistor">Relistor</SelectItem>
                      <SelectItem value="sublocade">Sublocade</SelectItem>
                      <SelectItem value="suboxone">Suboxone</SelectItem>
                      <SelectItem value="subutex">Subutex</SelectItem>
                      <SelectItem value="troxyca_er">Troxyca ER</SelectItem>
                      <SelectItem value="vivitrol">Vivitrol</SelectItem>
                      <SelectItem value="zubsolv">Zubsolv</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.medicalInformation.matMedication === 'other' && (
                    <Input
                      className="mt-2 bg-white"
                      placeholder="Please specify your MAT medication"
                      value={formData.medicalInformation.matMedicationOther}
                      onChange={(e) => handleSelectChange('medicalInformation.matMedicationOther', e.target.value)}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          )}

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

      {/* Signature Card */}
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
              <Label htmlFor="medicationSignature">Resident Signature</Label>
              <Input
                id="medicationSignature"
                value={currentSignature?.signature || ''}
                onChange={(e) => handleSignatureChange(e.target.value)}
                required
                placeholder="Type your full legal name to sign"
                className="bg-white"
              />
              <p className="text-sm text-gray-600">
                By typing your name above, you confirm that this medication list is complete and accurate, and you understand Journey House's medication storage and lockbox requirements.
              </p>
              {currentSignature?.signatureTimestamp && (
                <p className="text-sm text-gray-500">
                  Signed: {new Date(currentSignature.signatureTimestamp).toLocaleString()}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <Label htmlFor="medicationWitnessSignature">Witness Signature</Label>
              <Input
                id="medicationWitnessSignature"
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