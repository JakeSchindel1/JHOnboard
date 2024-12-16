import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ClipboardList, FileText } from "lucide-react";

interface FormData {
  dualDiagnosis: boolean | null;
  mat: boolean | null;
  matMedication: string | null;
  needPsychMedication: boolean | null;
  hasProbationOrPretrial: boolean | null;
  jurisdiction: string | null;
  otherJurisdiction?: string;
}

interface OnboardingPage4Props {
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string | boolean | null) => void;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

export default function OnboardingPage4({
  formData,
  handleInputChange,
  handleSelectChange,
  setCurrentPage
}: OnboardingPage4Props) {
  const {
    dualDiagnosis = null,
    mat = null,
    matMedication = null,
    needPsychMedication = null,
    hasProbationOrPretrial = null,
    jurisdiction = null,
    otherJurisdiction = ''
  } = formData;

  const handleMatChange = (value: string) => {
    const isMatNeeded = value === 'yes';
    handleSelectChange('mat', isMatNeeded);
    if (!isMatNeeded) {
      handleSelectChange('matMedication', 'none');  // Changed from null to 'none'
    }
  };

  const handleProbationChange = (value: string) => {
    const hasLegalStatus = value === 'yes';
    handleSelectChange('hasProbationOrPretrial', hasLegalStatus);
    if (!hasLegalStatus) {
      handleSelectChange('jurisdiction', 'none');  // Changed from null to 'none'
      handleSelectChange('otherJurisdiction', '');
    }
  };

  const handleJurisdictionChange = (value: string) => {
    handleSelectChange('jurisdiction', value);  // Removed the null condition since we'll use 'none'
    if (value !== 'other') {
      handleSelectChange('otherJurisdiction', '');
    }
  };

  // Add handler for MAT medication if not already present
  const handleMatMedicationChange = (value: string) => {
    handleSelectChange('matMedication', value || 'none');  // Ensure we never set null
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
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Dual Diagnosis */}
            <div className="flex flex-col h-36">
              <Label htmlFor="dualDiagnosis" className="text-base font-medium mb-2">
                Dual Diagnosis
              </Label>
              <Select 
                value={dualDiagnosis === null ? '' : (dualDiagnosis ? 'yes' : 'no')}
                onValueChange={(value) => handleSelectChange('dualDiagnosis', value === '' ? null : value === 'yes')}
              >
                <SelectTrigger id="dualDiagnosis" className="bg-white mb-2">
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

            {/* MAT Status */}
            <div className="flex flex-col h-36">
              <Label htmlFor="mat" className="text-base font-medium mb-2">
                MAT (Medication-Assisted Treatment)
              </Label>
              <Select 
                value={mat === null ? '' : (mat ? 'yes' : 'no')}
                onValueChange={handleMatChange}
              >
                <SelectTrigger id="mat" className="bg-white mb-2">
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

            {/* MAT Medication (if applicable) */}
            {mat && (
              <div className="flex flex-col h-36">
                <Label htmlFor="matMedication" className="text-base font-medium mb-2">
                  MAT Medication
                </Label>
                <Select
                  value={matMedication || 'none'}
                  onValueChange={handleMatMedicationChange}
                >
                  <SelectTrigger id="matMedication" className="bg-white mb-2">
                    <SelectValue placeholder="Select MAT medication" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="suboxone">Suboxone</SelectItem>
                    <SelectItem value="methadone">Methadone</SelectItem>
                    <SelectItem value="vivitrol">Vivitrol</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  Select your current MAT medication
                </p>
              </div>
            )}

            {/* Psychiatric Medication */}
            <div className="flex flex-col h-36">
              <Label htmlFor="needPsychMedication" className="text-base font-medium mb-2">
                Need Psychiatric Medication
              </Label>
              <Select 
                value={needPsychMedication === null ? '' : (needPsychMedication ? 'yes' : 'no')}
                onValueChange={(value) => handleSelectChange('needPsychMedication', value === '' ? null : value === 'yes')}
              >
                <SelectTrigger id="needPsychMedication" className="bg-white mb-2">
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
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Probation Status */}
            <div className="flex flex-col h-36">
              <Label htmlFor="hasProbationOrPretrial" className="text-base font-medium mb-2">
                Probation or Pretrial
              </Label>
              <Select 
                value={hasProbationOrPretrial === null ? '' : (hasProbationOrPretrial ? 'yes' : 'no')}
                onValueChange={handleProbationChange}
              >
                <SelectTrigger id="hasProbationOrPretrial" className="bg-white mb-2">
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
            <div className="flex flex-col h-36">
              <Label 
                htmlFor="jurisdiction" 
                className={`text-base font-medium mb-2 ${!hasProbationOrPretrial ? 'text-gray-400' : ''}`}
              >
                Jurisdiction
              </Label>
              <Select 
                value={jurisdiction || 'none'}
                onValueChange={handleJurisdictionChange}
                disabled={!hasProbationOrPretrial}
              >
                <SelectTrigger id="jurisdiction" className="bg-white mb-2">
                  <SelectValue placeholder="Select jurisdiction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="henrico">Henrico</SelectItem>
                  <SelectItem value="chesterfield">Chesterfield</SelectItem>
                  <SelectItem value="richmond">Richmond City</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
              <p className={`text-sm ${!hasProbationOrPretrial ? 'text-gray-400' : 'text-gray-500'}`}>
                Select the jurisdiction of your case
              </p>
            </div>

            {/* Other Jurisdiction */}
            {jurisdiction === 'other' && hasProbationOrPretrial && (
              <div className="flex flex-col h-36">
                <Label htmlFor="otherJurisdiction" className="text-base font-medium mb-2">
                  Other Jurisdiction
                </Label>
                <Input
                  id="otherJurisdiction"
                  name="otherJurisdiction"
                  value={otherJurisdiction || ''}
                  onChange={handleInputChange}
                  required
                  className="bg-white mb-2"
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