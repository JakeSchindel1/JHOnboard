import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ClipboardList, FileText } from "lucide-react";

interface FormData {
  dualDiagnosis?: string;
  mat?: string;
  needPsychMedication?: string;
  hasProbationOrPretrial?: string;
  jurisdiction?: string;
  otherJurisdiction?: string;
}

interface OnboardingPage4Props {
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
}

export default function OnboardingPage4({
  formData = {},
  handleInputChange,
  handleSelectChange
}: OnboardingPage4Props) {
  const {
    dualDiagnosis = '',
    mat = '',
    needPsychMedication = '',
    hasProbationOrPretrial = '',
    jurisdiction = '',
    otherJurisdiction = ''
  } = formData;

  // Handle probation/pretrial change
  const handleProbationChange = (value: string) => {
    handleSelectChange('hasProbationOrPretrial', value);
    if (value === 'no') {
      handleSelectChange('jurisdiction', 'none');
      handleSelectChange('otherJurisdiction', '');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">MEDICAL & LEGAL STATUS</h2>
        <p className="text-sm text-gray-600">Please complete all sections accurately</p>
      </div>

      {/* Medical Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardList className="h-5 w-5 text-blue-500" />
            Medical Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Dual Diagnosis */}
            <div className="space-y-2">
              <Label htmlFor="dualDiagnosis" className="text-base font-medium">
                Dual Diagnosis
              </Label>
              <Select 
                value={dualDiagnosis} 
                onValueChange={(value) => handleSelectChange('dualDiagnosis', value)}
              >
                <SelectTrigger id="dualDiagnosis" className="bg-white">
                  <SelectValue placeholder="Select dual diagnosis status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                Please indicate if you have been diagnosed with co-occurring disorders
              </p>
            </div>

            {/* MAT */}
            <div className="space-y-2">
              <Label htmlFor="mat" className="text-base font-medium">
                MAT (Medication-Assisted Treatment)
              </Label>
              <Select 
                value={mat} 
                onValueChange={(value) => handleSelectChange('mat', value)}
              >
                <SelectTrigger id="mat" className="bg-white">
                  <SelectValue placeholder="Select MAT status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                Indicate if you are currently receiving medication-assisted treatment
              </p>
            </div>

            {/* Psychiatric Medication */}
            <div className="space-y-2">
              <Label htmlFor="needPsychMedication" className="text-base font-medium">
                Need Psychiatric Medication
              </Label>
              <Select 
                value={needPsychMedication} 
                onValueChange={(value) => handleSelectChange('needPsychMedication', value)}
              >
                <SelectTrigger id="needPsychMedication" className="bg-white">
                  <SelectValue placeholder="Select psychiatric medication need" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                Indicate if you require psychiatric medications
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-green-500" />
            Legal Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Probation/Pretrial */}
            <div className="space-y-2">
              <Label htmlFor="hasProbationOrPretrial" className="text-base font-medium">
                Probation or Pretrial
              </Label>
              <Select 
                value={hasProbationOrPretrial} 
                onValueChange={handleProbationChange}
              >
                <SelectTrigger id="hasProbationOrPretrial" className="bg-white">
                  <SelectValue placeholder="Select probation/pretrial status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                Indicate if you are currently on probation or pretrial
              </p>
            </div>

            {/* Jurisdiction */}
            <div className="space-y-2">
              <Label 
                htmlFor="jurisdiction" 
                className={`text-base font-medium ${hasProbationOrPretrial === 'no' ? 'text-gray-400' : ''}`}
              >
                Jurisdiction
              </Label>
              <Select 
                value={hasProbationOrPretrial === 'no' ? 'none' : jurisdiction}
                onValueChange={(value) => handleSelectChange('jurisdiction', value)}
                disabled={hasProbationOrPretrial === 'no'}
              >
                <SelectTrigger id="jurisdiction" className="bg-white">
                  <SelectValue placeholder="Select jurisdiction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="henrico">Henrico</SelectItem>
                  <SelectItem value="chesterfield">Chesterfield</SelectItem>
                  <SelectItem value="richmond">Richmond City</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="none">--</SelectItem>
                </SelectContent>
              </Select>
              <p className={`text-sm ${hasProbationOrPretrial === 'no' ? 'text-gray-400' : 'text-gray-500'}`}>
                Select the jurisdiction of your case
              </p>
            </div>

            {/* Other Jurisdiction (Conditional) */}
            {jurisdiction === 'other' && hasProbationOrPretrial !== 'no' && (
              <div className="space-y-2">
                <Label htmlFor="otherJurisdiction" className="text-base font-medium">
                  Other Jurisdiction
                </Label>
                <Input
                  id="otherJurisdiction"
                  name="otherJurisdiction"
                  value={otherJurisdiction}
                  onChange={handleInputChange}
                  required
                  className="bg-white"
                  placeholder="Please specify jurisdiction"
                />
                <p className="text-sm text-gray-500">
                  Please specify your jurisdiction
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}