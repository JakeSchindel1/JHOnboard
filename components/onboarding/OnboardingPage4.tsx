import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ClipboardList, FileText } from "lucide-react";

interface OnboardingPage4Props {
  formData: {
    dualDiagnosis?: string;
    mat: boolean;
    needPsychMedication?: string;
    hasProbationOrPretrial?: string;
    jurisdiction?: string;
    otherJurisdiction?: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string | boolean) => void;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

export default function OnboardingPage4({
  formData,
  handleInputChange,
  handleSelectChange,
  setCurrentPage
}: OnboardingPage4Props) {
  const handleMatChange = (value: string) => {
    handleSelectChange('mat', value === 'yes');
  };

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
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Form Group Container */}
            <div className="flex flex-col h-36">
              <Label htmlFor="dualDiagnosis" className="text-base font-medium mb-2">
                Dual Diagnosis
              </Label>
              <Select 
                value={formData.dualDiagnosis || ''} 
                onValueChange={(value) => handleSelectChange('dualDiagnosis', value)}
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

            <div className="flex flex-col h-36">
              <Label htmlFor="mat" className="text-base font-medium mb-2">
                MAT (Medication-Assisted Treatment)
              </Label>
              <Select 
                value={formData.mat ? "yes" : "no"}
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

            <div className="flex flex-col h-36">
              <Label htmlFor="needPsychMedication" className="text-base font-medium mb-2">
                Need Psychiatric Medication
              </Label>
              <Select 
                value={formData.needPsychMedication || ''} 
                onValueChange={(value) => handleSelectChange('needPsychMedication', value)}
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
            <div className="flex flex-col h-36">
              <Label htmlFor="hasProbationOrPretrial" className="text-base font-medium mb-2">
                Probation or Pretrial
              </Label>
              <Select 
                value={formData.hasProbationOrPretrial || ''} 
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

            <div className="flex flex-col h-36">
              <Label 
                htmlFor="jurisdiction" 
                className={`text-base font-medium mb-2 ${formData.hasProbationOrPretrial === 'no' ? 'text-gray-400' : ''}`}
              >
                Jurisdiction
              </Label>
              <Select 
                value={formData.hasProbationOrPretrial === 'no' ? 'none' : (formData.jurisdiction || '')}
                onValueChange={(value) => handleSelectChange('jurisdiction', value)}
                disabled={formData.hasProbationOrPretrial === 'no'}
              >
                <SelectTrigger id="jurisdiction" className="bg-white mb-2">
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
              <p className={`text-sm ${formData.hasProbationOrPretrial === 'no' ? 'text-gray-400' : 'text-gray-500'}`}>
                Select the jurisdiction of your case
              </p>
            </div>

            {formData.jurisdiction === 'other' && formData.hasProbationOrPretrial !== 'no' && (
              <div className="flex flex-col h-36">
                <Label htmlFor="otherJurisdiction" className="text-base font-medium mb-2">
                  Other Jurisdiction
                </Label>
                <Input
                  id="otherJurisdiction"
                  name="otherJurisdiction"
                  value={formData.otherJurisdiction || ''}
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