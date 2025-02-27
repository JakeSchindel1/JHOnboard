import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ClipboardList, FileText, PlusCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingPageProps } from '@/types';

interface JurisdictionEntry {
  jurisdiction: string;
  otherJurisdiction?: string;
  type: 'probation' | 'pretrial' | 'both' | 'unselected';
}

export default function OnboardingPage4({
  formData,
  handleInputChange,
  handleSelectChange,
}: OnboardingPageProps) {
  const {
    dualDiagnosis = false,
    mat = false,
    needPsychMedication = false,
  } = formData.medicalInformation;

  const { hasProbationPretrial: hasProbationOrPretrial = false } = formData.legalStatus;

  const [jurisdictions, setJurisdictions] = React.useState<JurisdictionEntry[]>([
    { jurisdiction: 'unselected', type: 'unselected' }
  ]);

  const handleMatChange = (value: string) => {
    handleSelectChange('medicalInformation.mat', value === 'yes');
  };

  const handleProbationChange = (value: string) => {
    const hasLegalStatus = value === 'yes';
    handleSelectChange('legalStatus.hasProbationPretrial', hasLegalStatus);
    
    if (hasLegalStatus) {
      // Initialize probationHistory with empty array if not already set
      if (!formData.probationHistory || formData.probationHistory.length === 0) {
        handleSelectChange('probationHistory', []);
      }
    } else {
      // Clear probation history when selecting "no"
      setJurisdictions([{ jurisdiction: 'unselected', type: 'unselected' }]);
      handleSelectChange('probationHistory', []);
    }
  };

  const handleJurisdictionTypeChange = (index: number, type: 'probation' | 'pretrial' | 'both' | 'unselected') => {
    // Update local jurisdictions state
    const newJurisdictions = [...jurisdictions];
    newJurisdictions[index].type = type;
    setJurisdictions(newJurisdictions);
    
    // Now update probationHistory to sync with ASAM Assessment
    updateProbationHistory();
  };

  const handleJurisdictionChange = (index: number, value: string) => {
    const newJurisdictions = [...jurisdictions];
    newJurisdictions[index].jurisdiction = value;
    if (value !== 'other') {
      newJurisdictions[index].otherJurisdiction = '';
    }
    setJurisdictions(newJurisdictions);
    
    // Update formData.legalStatus.jurisdiction
    handleSelectChange('legalStatus.jurisdiction', newJurisdictions.map(j => j.jurisdiction).join(','));
    
    // Update probationHistory to sync with ASAM Assessment
    updateProbationHistory();
  };

  const handleOtherJurisdictionChange = (index: number, value: string) => {
    const newJurisdictions = [...jurisdictions];
    newJurisdictions[index].otherJurisdiction = value;
    setJurisdictions(newJurisdictions);
    handleSelectChange('legalStatus.otherJurisdiction', newJurisdictions.map(j => j.otherJurisdiction || '').join(','));
  };

  const addJurisdiction = () => {
    setJurisdictions([...jurisdictions, { jurisdiction: 'unselected', type: 'unselected' }]);
  };

  const removeJurisdiction = (index: number) => {
    const newJurisdictions = jurisdictions.filter((_, i) => i !== index);
    setJurisdictions(newJurisdictions);
    handleSelectChange('legalStatus.jurisdiction', newJurisdictions.map(j => j.jurisdiction).join(','));
    handleSelectChange('legalStatus.jurisdictionTypes', newJurisdictions.map(j => j.type).join(','));
    handleSelectChange('legalStatus.otherJurisdiction', newJurisdictions.map(j => j.otherJurisdiction || '').join(','));
  };

  // Function to update probationHistory based on jurisdictions
  const updateProbationHistory = () => {
    const validJurisdictions = jurisdictions.filter(j => 
      j.jurisdiction !== 'unselected' && j.jurisdiction !== 'none' && j.type !== 'unselected'
    );
    
    // Map jurisdictions to probationHistory entries
    const probationEntries = validJurisdictions.map(j => {
      let probationType: 'probation' | 'pretrial';
      if (j.type === 'both') {
        probationType = 'probation'; // Default to probation if both
      } else {
        probationType = j.type as 'probation' | 'pretrial';
      }
      
      let jurisdictionName = j.jurisdiction;
      // Format jurisdiction name (capitalize first letter)
      if (jurisdictionName === 'henrico') jurisdictionName = 'Henrico';
      if (jurisdictionName === 'chesterfield') jurisdictionName = 'Chesterfield';
      if (jurisdictionName === 'richmond') jurisdictionName = 'Richmond City';
      if (jurisdictionName === 'other' && j.otherJurisdiction) {
        jurisdictionName = j.otherJurisdiction;
      }
      
      return {
        type: probationType,
        jurisdiction: jurisdictionName,
        startDate: '',
        endDate: '',
        officerName: '',
        officerEmail: '',
        officerPhone: ''
      };
    });
    
    // Update probationHistory in formData
    handleSelectChange('probationHistory', probationEntries);
  };

  return (
    <div className="space-y-8">
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
                value={dualDiagnosis ? 'yes' : 'no'}
                onValueChange={(value) => handleSelectChange('medicalInformation.dualDiagnosis', value === 'yes')}
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
                value={mat ? 'yes' : 'no'}
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

            {/* Psychiatric Medication */}
            <div className="flex flex-col h-36">
              <Label htmlFor="needPsychMedication" className="text-base font-medium mb-2">
                Need Psychiatric Medication
              </Label>
              <Select 
                value={needPsychMedication ? 'yes' : 'no'}
                onValueChange={(value) => handleSelectChange('medicalInformation.needPsychMedication', value === 'yes')}
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
                Have less than two weeks of medication
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
          <div className="space-y-6">
            {/* Probation Status */}
            <div className="flex flex-col">
              <Label htmlFor="hasProbationOrPretrial" className="text-base font-medium mb-2">
                Probation or Pretrial
              </Label>
              <Select 
                value={hasProbationOrPretrial ? 'yes' : 'no'}
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

            {/* Jurisdictions */}
            {hasProbationOrPretrial && (
              <div className="space-y-4">
                {jurisdictions.map((jurisdictionEntry, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Jurisdiction {index + 1}</h3>
                      {index > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeJurisdiction(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XCircle className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex flex-col mb-4">
                        <Label htmlFor={`type-${index}`} className="text-base font-medium mb-2">
                          Type
                        </Label>
                        <Select 
                          value={jurisdictionEntry.type}
                          onValueChange={(value) => {
                            handleJurisdictionTypeChange(index, value as 'probation' | 'pretrial' | 'both' | 'unselected');
                          }}
                        >
                          <SelectTrigger id={`type-${index}`} className="bg-white">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unselected">Select type</SelectItem>
                            <SelectItem value="probation">Probation</SelectItem>
                            <SelectItem value="pretrial">Pretrial</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col">
                        <Label htmlFor={`jurisdiction-${index}`} className="text-base font-medium mb-2">
                          Jurisdiction
                        </Label>
                        <Select 
                          value={jurisdictionEntry.jurisdiction}
                          onValueChange={(value) => handleJurisdictionChange(index, value)}
                        >
                          <SelectTrigger id={`jurisdiction-${index}`} className="bg-white">
                            <SelectValue placeholder="Select jurisdiction" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unselected">Select jurisdiction</SelectItem>
                            <SelectItem value="henrico">Henrico</SelectItem>
                            <SelectItem value="chesterfield">Chesterfield</SelectItem>
                            <SelectItem value="richmond">Richmond City</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {jurisdictionEntry.jurisdiction === 'other' && (
                        <div className="flex flex-col">
                          <Label htmlFor={`otherJurisdiction-${index}`} className="text-base font-medium mb-2">
                            Other Jurisdiction
                          </Label>
                          <Input
                            id={`otherJurisdiction-${index}`}
                            value={jurisdictionEntry.otherJurisdiction || ''}
                            onChange={(e) => handleOtherJurisdictionChange(index, e.target.value)}
                            required
                            className="bg-white"
                            placeholder="Please specify jurisdiction"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addJurisdiction}
                  className="w-full"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Add Another Jurisdiction
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}