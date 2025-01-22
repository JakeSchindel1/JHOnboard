import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileCheck, AlertTriangle, PlusCircle, XCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { OnboardingPageProps, PendingCharge, Conviction, FormData } from '@/types';

const RadioOptions = ({ 
  label, 
  id, 
  value, 
  onChange,
  className = ""
}: {
  label: string;
  id: string;
  value: boolean;
  onChange: (value: boolean) => void;
  className?: string;
}) => (
  <div className={`flex items-center justify-between gap-4 ${className}`}>
    <Label htmlFor={id} className="flex-grow">{label}</Label>
    <RadioGroup
      id={id}
      value={value ? "yes" : "no"}
      onValueChange={(val) => onChange(val === "yes")}
      className="flex gap-4"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="yes" id={`${id}-yes`} />
        <Label htmlFor={`${id}-yes`}>Yes</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="no" id={`${id}-no`} />
        <Label htmlFor={`${id}-no`}>No</Label>
      </div>
    </RadioGroup>
  </div>
);

export default function OnboardingPage11({
  formData,
  handleInputChange,
  handleSelectChange,
}: OnboardingPageProps) {
  const [pendingCharges, setPendingCharges] = useState<PendingCharge[]>([
    { chargeDescription: '', location: '' }
  ]);

  const [convictions, setConvictions] = useState<Conviction[]>([
    { offense: '' }
  ]);

  const generateSignatureId = () => `JH-CRIM-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

  const handlePendingChargeChange = (index: number, field: keyof PendingCharge, value: string) => {
    const newPendingCharges = [...pendingCharges];
    if (field === 'chargeDescription' || field === 'location') {
      newPendingCharges[index][field] = value;
    }
    setPendingCharges(newPendingCharges);
    handleSelectChange('pendingCharges', newPendingCharges);
  };

  const handleConvictionChange = (index: number, value: string) => {
    const newConvictions = [...convictions];
    newConvictions[index].offense = value;
    setConvictions(newConvictions);
    handleSelectChange('convictions', newConvictions);
  };

  const addPendingCharge = () => {
    setPendingCharges([...pendingCharges, { chargeDescription: '', location: '' }]);
  };

  const removePendingCharge = (index: number) => {
    const newPendingCharges = pendingCharges.filter((_, i) => i !== index);
    setPendingCharges(newPendingCharges);
    handleSelectChange('pendingCharges', newPendingCharges);
  };

  const addConviction = () => {
    setConvictions([...convictions, { offense: '' }]);
  };

  const removeConviction = (index: number) => {
    const newConvictions = convictions.filter((_, i) => i !== index);
    setConvictions(newConvictions);
    handleSelectChange('convictions', newConvictions);
  };

  const cardClasses = formData.legalStatus.isSexOffender ? 
    "border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all duration-700" : 
    "transition-all duration-700";

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">CRIMINAL HISTORY DISCLOSURE</h2>
        <p className="text-sm text-gray-600">Complete all sections accurately and truthfully</p>
      </div>

      <Card className={cardClasses}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className={`h-5 w-5 ${formData.legalStatus.isSexOffender ? 'text-red-500' : 'text-yellow-500'}`} />
            Current Legal Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <RadioOptions
              label="Do you currently have any pending charges?"
              id="hasPendingCharges"
              value={formData.legalStatus.hasPendingCharges}
              onChange={(value) => {
                handleSelectChange('legalStatus.hasPendingCharges', value);
                if (!value) setPendingCharges([{ chargeDescription: '', location: '' }]);
              }}
            />

            {formData.legalStatus.hasPendingCharges && (
              <div className="space-y-4">
                {pendingCharges.map((charge, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Pending Charge {index + 1}</h3>
                      {index > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePendingCharge(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XCircle className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`charge-${index}`}>Charge Description</Label>
                        <Input
                          id={`charge-${index}`}
                          value={charge.chargeDescription}
                          onChange={(e) => handlePendingChargeChange(index, 'chargeDescription', e.target.value)}
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`location-${index}`}>County & State</Label>
                        <Input
                          id={`location-${index}`}
                          value={charge.location}
                          onChange={(e) => handlePendingChargeChange(index, 'location', e.target.value)}
                          className="bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addPendingCharge}
                  className="w-full"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Add Another Pending Charge
                </Button>
              </div>
            )}

            <RadioOptions
              label="Have you ever been convicted of any crime?"
              id="hasConvictions"
              value={formData.legalStatus.hasConvictions}
              onChange={(value) => {
                handleSelectChange('legalStatus.hasConvictions', value);
                if (!value) setConvictions([{ offense: '' }]);
              }}
            />

            {formData.legalStatus.hasConvictions && (
              <div className="space-y-4">
                {convictions.map((conviction, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Conviction {index + 1}</h3>
                      {index > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeConviction(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XCircle className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor={`conviction-${index}`}>Offense</Label>
                      <Input
                        id={`conviction-${index}`}
                        value={conviction.offense}
                        onChange={(e) => handleConvictionChange(index, e.target.value)}
                        className="bg-white"
                      />
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addConviction}
                  className="w-full"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Add Another Conviction
                </Button>
              </div>
            )}

            <RadioOptions
              label="Are you wanted by any law enforcement or government agency? (Including Department of Corrections)"
              id="isWanted"
              value={formData.legalStatus.isWanted}
              onChange={(value) => handleSelectChange('legalStatus.isWanted', value)}
            />

            <RadioOptions
              label="Are you out on bond?"
              id="isOnBond"
              value={formData.legalStatus.isOnBond}
              onChange={(value) => handleSelectChange('legalStatus.isOnBond', value)}
            />

            {formData.legalStatus.isOnBond && (
              <div>
                <Label htmlFor="bondsmanName">Bondsman Name</Label>
                <Input
                  id="bondsmanName"
                  name="legalStatus.bondsmanName"
                  value={formData.legalStatus.bondsmanName || ''}
                  onChange={handleInputChange}
                  className="bg-white"
                />
              </div>
            )}

            <div className={`rounded-lg ${formData.legalStatus.isSexOffender ? 'bg-red-50 p-4 border border-red-200' : ''}`}>
              <RadioOptions
                label="Are you a registered sex offender or sexual predator with any jurisdictions?"
                id="isSexOffender"
                value={formData.legalStatus.isSexOffender}
                onChange={(value) => handleSelectChange('legalStatus.isSexOffender', value)}
                className={`text-red-600 font-medium ${formData.legalStatus.isSexOffender ? 'mb-4' : ''}`}
              />

              {formData.legalStatus.isSexOffender && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  <p className="font-medium">Interview must be terminated immediately</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-emerald-500" />
            Signature & Acknowledgment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm font-semibold text-red-600">
            **FAILURE TO COMPLETE THIS FORM ACCURATELY AND TRUTHFULLY WILL LEAD TO YOUR DISCHARGE FROM THE JOURNEY HOUSE, LLC (&quot;JOURNEY HOUSE&quot;). JOURNEY HOUSE WILL REPORT ALL THOSE IN VIOLATION OF APPLICABLE LAWS AND REGULATIONS AS REQUIRED BY LAWS AND REGULATIONS.**
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label htmlFor="criminalHistorySignature">Resident Signature</Label>
              <Input
                id="criminalHistorySignature"
                name="signatures"
                value={formData.signatures.find(s => s.signatureType === 'criminal_history')?.signature || ''}
                onChange={(e) => {
                  const now = new Date();
                  const signatureId = generateSignatureId();
                  const newSignature = {
                    signatureType: 'criminal_history' as const,
                    signature: e.target.value,
                    signatureTimestamp: now.toISOString(),
                    signatureId
                  };
                  handleSelectChange('signatures', [
                    ...formData.signatures.filter(s => s.signatureType !== 'criminal_history'),
                    newSignature
                  ]);
                }}
                required
                placeholder="Type your full legal name to sign"
                className="bg-white"
              />
              {formData.signatures.find(s => s.signatureType === 'criminal_history')?.signatureTimestamp && (
                <p className="text-sm text-gray-500">
                  Signed: {new Date(formData.signatures.find(s => s.signatureType === 'criminal_history')?.signatureTimestamp || '').toLocaleString()}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <Label htmlFor="criminalHistoryWitnessSignature">Witness Signature</Label>
              <Input
                id="criminalHistoryWitnessSignature"
                name="signatures"
                value={formData.signatures.find(s => s.signatureType === 'criminal_history')?.witnessSignature || ''}
                onChange={(e) => {
                  const now = new Date();
                  const currentSignature = formData.signatures.find(s => s.signatureType === 'criminal_history');
                  if (currentSignature) {
                    const updatedSignature = {
                      ...currentSignature,
                      witnessSignature: e.target.value,
                      witnessTimestamp: now.toISOString()
                    };
                    handleSelectChange('signatures', [
                      ...formData.signatures.filter(s => s.signatureType !== 'criminal_history'),
                      updatedSignature
                    ]);
                  }
                }}
                required
                disabled={!formData.signatures.find(s => s.signatureType === 'criminal_history')?.signature}
                placeholder="Witness full legal name"
                className="bg-white"
              />
              {formData.signatures.find(s => s.signatureType === 'criminal_history')?.witnessTimestamp && (
                <p className="text-sm text-gray-500">
                  Witnessed: {new Date(formData.signatures.find(s => s.signatureType === 'criminal_history')?.witnessTimestamp || '').toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {formData.signatures.find(s => s.signatureType === 'criminal_history')?.signatureId && (
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Document ID: {formData.signatures.find(s => s.signatureType === 'criminal_history')?.signatureId}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}