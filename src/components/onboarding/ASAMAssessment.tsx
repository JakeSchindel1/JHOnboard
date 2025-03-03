import React, { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Home, Trash2, Building2, Building, Scale, Scale3DIcon, FileCheck } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormData, OnboardingPageProps, SignatureType, ProbationHistoryEntry, Signature} from '@/types';

interface ASAMAssessmentProps extends OnboardingPageProps {
  addSignature: (
    type: SignatureType,
    signature: string,
    timestamp: string,
    signatureId: string,
    witnessSignature?: string,
    witnessTimestamp?: string,
    witnessSignatureId?: string,
    agreed?: boolean
  ) => void;
}

const ASAMAssessment: React.FC<ASAMAssessmentProps> = ({
  formData,
  handleInputChange,
  handleSelectChange,
  addSignature
}) => {

  useEffect(() => {
    if (formData.legalStatus?.hasProbationPretrial && formData.legalStatus?.jurisdiction) {
      if (!formData.probationHistory || formData.probationHistory.length === 0) {
        // Initialize probation history with one entry
        // Ensure type is strictly 'probation' or 'pretrial'
        const probationType = formData.legalStatus.jurisdictionTypes === 'pretrial' ? 'pretrial' : 'probation';
        
        handleSelectChange('probationHistory', [{
          type: probationType,
          jurisdiction: formData.legalStatus.jurisdiction,
          startDate: '',
          endDate: '',
          officerName: '',
          officerEmail: '',
          officerPhone: ''
        }]);
      }
    }
  }, [formData.legalStatus?.hasProbationPretrial, formData.legalStatus?.jurisdiction, 
      formData.legalStatus?.jurisdictionTypes, formData.probationHistory, handleSelectChange]);

  const drugTypes = [
    { name: 'Alcohol', hasIV: false },
    { name: 'Cannabis', hasIV: false },
    { name: 'Cocaine', hasIV: true },
    { name: 'Methamphetamines', hasIV: true },
    { name: 'Amphetamines/Other Stimulants', hasIV: true },
    { name: 'Benzodiazepines/Tranquilizers', hasIV: false },
    { name: 'Sedatives/Barbiturates', hasIV: true },
    { name: 'Heroin/Opioids', hasIV: false },
    { name: 'Fentanyl', hasIV: true },
    { name: 'Abuse MAT', hasIV: true },
    { name: 'Hallucinogens', hasIV: false },
    { name: 'Inhalants', hasIV: false },
    { name: 'Steroids', hasIV: false },
    { name: 'Kratom', hasIV: false },
    { name: 'Illegal Use of Prescriptions', hasIV: false },
    { name: 'Abuse OTC Medicine', hasIV: true }
  ];

  const handleMentalHealthChange = (index: number, field: string, value: string) => {
    const updatedEntries = [...formData.mentalHealth.entries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: value
    };
    handleSelectChange('mentalHealth.entries', updatedEntries);
  };

  const handleDrugHistoryChange = (index: number, field: string, value: string) => {
    const updatedHistory = [...(formData.drugHistory || [])];
    updatedHistory[index] = {
      ...updatedHistory[index],
      [field]: value
    };
    handleSelectChange('drugHistory', updatedHistory);
  };

  const addMentalHealthEntry = () => {
    const newEntry = {
      diagnosis: '',
      dateOfDiagnosis: '',
      prescribedMedication: 'no' as const,
      medicationCompliant: 'no' as const,
      currentSymptoms: 'no' as const,
      describeSymptoms: ''
    };
    handleSelectChange('mentalHealth.entries', [...formData.mentalHealth.entries, newEntry]);
  };

  const handleSignatures = () => {
    const participantSignature = formData.signatures.find(s => s.signatureType === 'asam_assessment')?.signature;
    const witnessSignature = formData.signatures.find(s => s.signatureType === 'asam_assessment')?.witnessSignature;
    
    if (!participantSignature || !witnessSignature) {
      alert('Both participant and witness signatures are required');
      return;
    }
  
    const now = new Date().toISOString();
    const participantId = `asam-participant-${Date.now()}`;
    const witnessId = `asam-witness-${Date.now()}`;
  
    addSignature(
      'asam_assessment',
      participantSignature,
      now,
      participantId,
      witnessSignature,
      now,
      witnessId,
      true
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">FOCUS HISTORY</h2>
        <p className="text-sm text-gray-600">Please complete all sections accurately</p>
      </div>

      {/* Mental Health Section */}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Mental Health Self-Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {formData.mentalHealth.entries.map((entry, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4 bg-gray-50">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`diagnosis-${index}`}>Diagnosis</Label>
                    <Input
                      id={`diagnosis-${index}`}
                      value={entry.diagnosis}
                      onChange={(e) => handleMentalHealthChange(index, 'diagnosis', e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`date-${index}`}>Date of Diagnosis</Label>
                    <Input
                      id={`date-${index}`}
                      type="date"
                      value={entry.dateOfDiagnosis}
                      onChange={(e) => handleMentalHealthChange(index, 'dateOfDiagnosis', e.target.value)}
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Prescribed Medication</Label>
                    <RadioGroup
                      value={entry.prescribedMedication}
                      onValueChange={(value) => handleMentalHealthChange(index, 'prescribedMedication', value)}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id={`prescribed-yes-${index}`} />
                        <Label htmlFor={`prescribed-yes-${index}`}>Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id={`prescribed-no-${index}`} />
                        <Label htmlFor={`prescribed-no-${index}`}>No</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Medication Compliant</Label>
                    <RadioGroup
                      value={entry.medicationCompliant}
                      onValueChange={(value) => handleMentalHealthChange(index, 'medicationCompliant', value)}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id={`compliant-yes-${index}`} />
                        <Label htmlFor={`compliant-yes-${index}`}>Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id={`compliant-no-${index}`} />
                        <Label htmlFor={`compliant-no-${index}`}>No</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Current Symptoms</Label>
                    <RadioGroup
                      value={entry.currentSymptoms}
                      onValueChange={(value) => handleMentalHealthChange(index, 'currentSymptoms', value)}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id={`symptoms-yes-${index}`} />
                        <Label htmlFor={`symptoms-yes-${index}`}>Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id={`symptoms-no-${index}`} />
                        <Label htmlFor={`symptoms-no-${index}`}>No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {entry.currentSymptoms === 'yes' && (
                  <div className="space-y-2">
                    <Label htmlFor={`symptoms-desc-${index}`}>Describe Symptoms</Label>
                    <Input
                      id={`symptoms-desc-${index}`}
                      value={entry.describeSymptoms}
                      onChange={(e) => handleMentalHealthChange(index, 'describeSymptoms', e.target.value)}
                      className="bg-white"
                    />
                  </div>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addMentalHealthEntry}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Diagnosis
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Drug History Section */}

      <Card className="bg-white shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          <span>Drug History Self Report</span>
        </CardTitle>
        <p className="text-sm text-gray-500">
          Please indicate your history with the following substances
        </p>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-gray-100">
          {drugTypes.map((drugType, index) => (
            <div key={index} className="group">
              <div className="flex items-center justify-between py-4 first:pt-0">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900">{drugType.name}</span>
                  {drugType.hasIV && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                      IV Use Possible
                    </span>
                  )}
                </div>
                <RadioGroup
                  value={formData.drugHistory?.[index]?.everUsed || 'no'}
                  onValueChange={(value) => handleDrugHistoryChange(index, 'everUsed', value)}
                  className="flex items-center space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id={`used-yes-${index}`} />
                    <Label htmlFor={`used-yes-${index}`} className="text-sm cursor-pointer">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id={`used-no-${index}`} />
                    <Label htmlFor={`used-no-${index}`} className="text-sm cursor-pointer">
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.drugHistory?.[index]?.everUsed === 'yes' && (
                <div className="pb-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label 
                          htmlFor={`date-${index}`}
                          className="text-sm font-medium text-gray-700"
                        >
                          Last Use
                        </Label>
                        <Input
                          id={`date-${index}`}
                          type="date"
                          value={formData.drugHistory?.[index]?.dateLastUse || ''}
                          onChange={(e) => handleDrugHistoryChange(index, 'dateLastUse', e.target.value)}
                          className="bg-white border-gray-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label 
                          htmlFor={`frequency-${index}`}
                          className="text-sm font-medium text-gray-700"
                        >
                          Frequency of Use
                        </Label>
                        <Input
                          id={`frequency-${index}`}
                          value={formData.drugHistory?.[index]?.frequency || ''}
                          onChange={(e) => handleDrugHistoryChange(index, 'frequency', e.target.value)}
                          className="bg-white border-gray-200"
                          placeholder="e.g., Daily, Weekly"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label 
                          htmlFor={`amount-${index}`}
                          className="text-sm font-medium text-gray-700"
                        >
                          Typical Amount
                        </Label>
                        <Input
                          id={`amount-${index}`}
                          value={formData.drugHistory?.[index]?.amount || ''}
                          onChange={(e) => handleDrugHistoryChange(index, 'amount', e.target.value)}
                          className="bg-white border-gray-200"
                          placeholder="Amount typically used"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label 
                          htmlFor={`years-${index}`}
                          className="text-sm font-medium text-gray-700"
                        >
                          Years of Use
                        </Label>
                        <Input
                          id={`years-${index}`}
                          type="number"
                          value={formData.drugHistory?.[index]?.totalYears || ''}
                          onChange={(e) => handleDrugHistoryChange(index, 'totalYears', e.target.value)}
                          className="bg-white border-gray-200"
                          min="0"
                          max="99"
                          placeholder="0"
                        />
                      </div>

                      {drugType.hasIV && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-gray-700">
                            IV Use History
                          </Label>
                          <RadioGroup
                            value={formData.drugHistory?.[index]?.intravenous || 'no'}
                            onValueChange={(value) => handleDrugHistoryChange(index, 'intravenous', value)}
                            className="flex space-x-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id={`iv-yes-${index}`} />
                              <Label 
                                htmlFor={`iv-yes-${index}`}
                                className="text-sm cursor-pointer"
                              >
                                Yes
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id={`iv-no-${index}`} />
                              <Label 
                                htmlFor={`iv-no-${index}`}
                                className="text-sm cursor-pointer"
                              >
                                No
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Recovery Residence Section */}

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5 text-blue-500" />
          Recovery Residence History
        </CardTitle>
        <p className="text-sm text-gray-500">
          Please provide information about any recovery residences you have stayed at
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Have you ever stayed at a recovery residence?
            </Label>
            <RadioGroup
              value={formData.hasResidenceHistory || 'no'}
              onValueChange={(value) => handleSelectChange('hasResidenceHistory', value)}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="residence-yes" />
                <Label htmlFor="residence-yes" className="text-sm cursor-pointer">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="residence-no" />
                <Label htmlFor="residence-no" className="text-sm cursor-pointer">
                  No
                </Label>
              </div>
            </RadioGroup>
          </div>

          {formData.hasResidenceHistory === 'yes' && (
            <div className="space-y-6">
              {formData.recoveryResidences?.map((residence, index) => (
                <div 
                  key={index} 
                  className="bg-gray-50 rounded-lg p-4 space-y-4 relative"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                    onClick={() => {
                      const updatedResidences = formData.recoveryResidences.filter((_, i) => i !== index);
                      handleSelectChange('recoveryResidences', updatedResidences);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <div className="space-y-2">
                    <Label 
                      htmlFor={`residence-name-${index}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Recovery Residence Name
                    </Label>
                    <Input
                      id={`residence-name-${index}`}
                      value={residence.name}
                      onChange={(e) => {
                        const updatedResidences = [...formData.recoveryResidences];
                        updatedResidences[index] = {
                          ...updatedResidences[index],
                          name: e.target.value
                        };
                        handleSelectChange('recoveryResidences', updatedResidences);
                      }}
                      className="bg-white border-gray-200"
                      placeholder="Enter recovery residence name"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label 
                        htmlFor={`start-date-${index}`}
                        className="text-sm font-medium text-gray-700"
                      >
                        Start Date
                      </Label>
                      <Input
                        id={`start-date-${index}`}
                        type="date"
                        value={residence.startDate}
                        onChange={(e) => {
                          const updatedResidences = [...formData.recoveryResidences];
                          updatedResidences[index] = {
                            ...updatedResidences[index],
                            startDate: e.target.value
                          };
                          handleSelectChange('recoveryResidences', updatedResidences);
                        }}
                        className="bg-white border-gray-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label 
                        htmlFor={`end-date-${index}`}
                        className="text-sm font-medium text-gray-700"
                      >
                        End Date
                      </Label>
                      <Input
                        id={`end-date-${index}`}
                        type="date"
                        value={residence.endDate}
                        onChange={(e) => {
                          const updatedResidences = [...formData.recoveryResidences];
                          updatedResidences[index] = {
                            ...updatedResidences[index],
                            endDate: e.target.value
                          };
                          handleSelectChange('recoveryResidences', updatedResidences);
                        }}
                        className="bg-white border-gray-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label 
                      htmlFor={`location-${index}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Location
                    </Label>
                    <Input
                      id={`location-${index}`}
                      value={residence.location}
                      onChange={(e) => {
                        const updatedResidences = [...formData.recoveryResidences];
                        updatedResidences[index] = {
                          ...updatedResidences[index],
                          location: e.target.value
                        };
                        handleSelectChange('recoveryResidences', updatedResidences);
                      }}
                      className="bg-white border-gray-200"
                      placeholder="City, State"
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const newResidence = {
                    name: '',
                    startDate: '',
                    endDate: '',
                    location: ''
                  };
                  handleSelectChange('recoveryResidences', [...(formData.recoveryResidences || []), newResidence]);
                }}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Recovery Residence
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Hospitalization Section */}

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-500" />
          Hospitalizations or Treatment History
        </CardTitle>
        <p className="text-sm text-gray-500">
          Please provide information about any hospitalizations or treatment programs you have attended
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Have you ever been hospitalized or attended a treatment program?
            </Label>
            <RadioGroup
              value={formData.hasTreatmentHistory || 'no'}
              onValueChange={(value) => handleSelectChange('hasTreatmentHistory', value)}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="treatment-yes" />
                <Label htmlFor="treatment-yes" className="text-sm cursor-pointer">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="treatment-no" />
                <Label htmlFor="treatment-no" className="text-sm cursor-pointer">
                  No
                </Label>
              </div>
            </RadioGroup>
          </div>

          {formData.hasTreatmentHistory === 'yes' && (
            <div className="space-y-6">
              {(formData.treatmentHistory || []).map((treatment, index) => (
                <div 
                  key={index} 
                  className="bg-gray-50 rounded-lg p-4 space-y-4 relative"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                    onClick={() => {
                      const updatedTreatments = (formData.treatmentHistory || []).filter((_, i) => i !== index);
                      handleSelectChange('treatmentHistory', updatedTreatments);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <div className="space-y-2">
                    <Label 
                      htmlFor={`treatment-type-${index}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Type of Treatment/Hospitalization
                    </Label>
                    <Input
                      id={`treatment-type-${index}`}
                      value={treatment.type}
                      onChange={(e) => {
                        const updatedTreatments = [...(formData.treatmentHistory || [])];
                        updatedTreatments[index] = {
                          ...updatedTreatments[index],
                          type: e.target.value
                        };
                        handleSelectChange('treatmentHistory', updatedTreatments);
                      }}
                      className="bg-white border-gray-200"
                      placeholder="e.g., Detox, Residential, PHP, IOP"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label 
                      htmlFor={`treatment-date-${index}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Estimated Date
                    </Label>
                    <Input
                      id={`treatment-date-${index}`}
                      type="date"
                      value={treatment.estimatedDate}
                      onChange={(e) => {
                        const updatedTreatments = [...(formData.treatmentHistory || [])];
                        updatedTreatments[index] = {
                          ...updatedTreatments[index],
                          estimatedDate: e.target.value
                        };
                        handleSelectChange('treatmentHistory', updatedTreatments);
                      }}
                      className="bg-white border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label 
                      htmlFor={`treatment-location-${index}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Location
                    </Label>
                    <Input
                      id={`treatment-location-${index}`}
                      value={treatment.location}
                      onChange={(e) => {
                        const updatedTreatments = [...(formData.treatmentHistory || [])];
                        updatedTreatments[index] = {
                          ...updatedTreatments[index],
                          location: e.target.value
                        };
                        handleSelectChange('treatmentHistory', updatedTreatments);
                      }}
                      className="bg-white border-gray-200"
                      placeholder="City, State"
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const newTreatment = {
                    type: '',
                    estimatedDate: '',
                    location: ''
                  };
                  handleSelectChange('treatmentHistory', [...(formData.treatmentHistory || []), newTreatment]);
                }}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Treatment/Hospitalization
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Incarceration Section */}

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5 text-blue-500" />
          Incarceration History
        </CardTitle>
        <p className="text-sm text-gray-500">
          Please provide information about any history of incarceration
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Have you ever been incarcerated?
            </Label>
            <RadioGroup
              value={formData.hasIncarcerationHistory || 'no'}
              onValueChange={(value) => handleSelectChange('hasIncarcerationHistory', value)}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="incarceration-yes" />
                <Label htmlFor="incarceration-yes" className="text-sm cursor-pointer">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="incarceration-no" />
                <Label htmlFor="incarceration-no" className="text-sm cursor-pointer">
                  No
                </Label>
              </div>
            </RadioGroup>
          </div>

          {formData.hasIncarcerationHistory === 'yes' && (
            <div className="space-y-6">
              {(formData.incarcerationHistory || []).map((incarceration, index) => (
                <div 
                  key={index} 
                  className="bg-gray-50 rounded-lg p-4 space-y-4 relative"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                    onClick={() => {
                      const updatedIncarcerations = (formData.incarcerationHistory || []).filter((_, i) => i !== index);
                      handleSelectChange('incarcerationHistory', updatedIncarcerations);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <div className="space-y-2">
                    <Label 
                      htmlFor={`incarceration-type-${index}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Type of Incarceration
                    </Label>
                    <Input
                      id={`incarceration-type-${index}`}
                      value={incarceration.type}
                      onChange={(e) => {
                        const updatedIncarcerations = [...(formData.incarcerationHistory || [])];
                        updatedIncarcerations[index] = {
                          ...updatedIncarcerations[index],
                          type: e.target.value
                        };
                        handleSelectChange('incarcerationHistory', updatedIncarcerations);
                      }}
                      className="bg-white border-gray-200"
                      placeholder="e.g., Jail, Prison, Detention Center"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label 
                      htmlFor={`incarceration-date-${index}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Estimated Date
                    </Label>
                    <Input
                      id={`incarceration-date-${index}`}
                      type="date"
                      value={incarceration.estimatedDate}
                      onChange={(e) => {
                        const updatedIncarcerations = [...(formData.incarcerationHistory || [])];
                        updatedIncarcerations[index] = {
                          ...updatedIncarcerations[index],
                          estimatedDate: e.target.value
                        };
                        handleSelectChange('incarcerationHistory', updatedIncarcerations);
                      }}
                      className="bg-white border-gray-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label 
                      htmlFor={`incarceration-location-${index}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Location
                    </Label>
                    <Input
                      id={`incarceration-location-${index}`}
                      value={incarceration.location}
                      onChange={(e) => {
                        const updatedIncarcerations = [...(formData.incarcerationHistory || [])];
                        updatedIncarcerations[index] = {
                          ...updatedIncarcerations[index],
                          location: e.target.value
                        };
                        handleSelectChange('incarcerationHistory', updatedIncarcerations);
                      }}
                      className="bg-white border-gray-200"
                      placeholder="City, State"
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const newIncarceration = {
                    type: '',
                    estimatedDate: '',
                    location: ''
                  };
                  handleSelectChange('incarcerationHistory', [...(formData.incarcerationHistory || []), newIncarceration]);
                }}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Incarceration Record
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Probation and Pretrial Section */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-blue-500" />
          Probation and Pretrial Status
        </CardTitle>
        <p className="text-sm text-gray-500">
          Please provide information about any current probation or pretrial supervision
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Are you currently on probation or pretrial supervision?
            </Label>
            <RadioGroup
              value={formData.legalStatus?.hasProbationPretrial ? 'yes' : 'no'}
              onValueChange={(value) => {
                handleSelectChange('legalStatus.hasProbationPretrial', value === 'yes');
                if (value === 'no') {
                  handleSelectChange('probationHistory', []);
                }
              }}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="probation-yes" />
                <Label htmlFor="probation-yes" className="text-sm cursor-pointer">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="probation-no" />
                <Label htmlFor="probation-no" className="text-sm cursor-pointer">
                  No
                </Label>
              </div>
            </RadioGroup>
          </div>

          {formData.legalStatus?.hasProbationPretrial === true && (
            <div className="space-y-6">
              {(formData.probationHistory || []).map((probation, index) => (
                <div 
                  key={index} 
                  className="bg-gray-50 rounded-lg p-4 space-y-4 relative"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                    onClick={() => {
                      const updatedProbations = (formData.probationHistory || []).filter((_, i) => i !== index);
                      handleSelectChange('probationHistory', updatedProbations);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <div className="space-y-2">
                    <Label 
                      htmlFor={`probation-type-${index}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Type of Supervision
                    </Label>
                    <RadioGroup
                      value={probation.type}
                      onValueChange={(value) => {
                        const updatedProbations = [...(formData.probationHistory || [])];
                        const newValue = value as 'probation' | 'pretrial';
                        updatedProbations[index] = {
                          ...updatedProbations[index],
                          type: newValue
                        };
                        handleSelectChange('probationHistory', updatedProbations);
                      }}
                      className="flex space-x-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="probation" id={`prob-type-prob-${index}`} />
                        <Label htmlFor={`prob-type-prob-${index}`} className="text-sm cursor-pointer">
                          Probation
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pretrial" id={`prob-type-pre-${index}`} />
                        <Label htmlFor={`prob-type-pre-${index}`} className="text-sm cursor-pointer">
                          Pretrial
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label 
                      htmlFor={`probation-jurisdiction-${index}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Jurisdiction
                    </Label>
                    <Input
                      id={`probation-jurisdiction-${index}`}
                      value={probation.jurisdiction}
                      onChange={(e) => {
                        const updatedProbations = [...(formData.probationHistory || [])];
                        updatedProbations[index] = {
                          ...updatedProbations[index],
                          jurisdiction: e.target.value
                        };
                        handleSelectChange('probationHistory', updatedProbations);
                      }}
                      className="bg-white border-gray-200"
                      placeholder="e.g., Henrico, Richmond City"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label 
                        htmlFor={`probation-start-${index}`}
                        className="text-sm font-medium text-gray-700"
                      >
                        Start Date
                      </Label>
                      <Input
                        id={`probation-start-${index}`}
                        type="date"
                        value={probation.startDate}
                        onChange={(e) => {
                          const updatedProbations = [...(formData.probationHistory || [])];
                          updatedProbations[index] = {
                            ...updatedProbations[index],
                            startDate: e.target.value
                          };
                          handleSelectChange('probationHistory', updatedProbations);
                        }}
                        className="bg-white border-gray-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label 
                        htmlFor={`probation-end-${index}`}
                        className="text-sm font-medium text-gray-700"
                      >
                        End Date
                      </Label>
                      <Input
                        id={`probation-end-${index}`}
                        type="date"
                        value={probation.endDate}
                        onChange={(e) => {
                          const updatedProbations = [...(formData.probationHistory || [])];
                          updatedProbations[index] = {
                            ...updatedProbations[index],
                            endDate: e.target.value
                          };
                          handleSelectChange('probationHistory', updatedProbations);
                        }}
                        className="bg-white border-gray-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label 
                      htmlFor={`probation-officer-${index}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      Officer Name
                    </Label>
                    <Input
                      id={`probation-officer-${index}`}
                      value={probation.officerName}
                      onChange={(e) => {
                        const updatedProbations = [...(formData.probationHistory || [])];
                        updatedProbations[index] = {
                          ...updatedProbations[index],
                          officerName: e.target.value
                        };
                        handleSelectChange('probationHistory', updatedProbations);
                      }}
                      className="bg-white border-gray-200"
                      placeholder="Enter officer's name"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label 
                        htmlFor={`probation-officer-email-${index}`}
                        className="text-sm font-medium text-gray-700"
                      >
                        Officer Email
                      </Label>
                      <Input
                        id={`probation-officer-email-${index}`}
                        type="email"
                        value={probation.officerEmail}
                        onChange={(e) => {
                          const updatedProbations = [...(formData.probationHistory || [])];
                          updatedProbations[index] = {
                            ...updatedProbations[index],
                            officerEmail: e.target.value
                          };
                          handleSelectChange('probationHistory', updatedProbations);
                        }}
                        className="bg-white border-gray-200"
                        placeholder="officer@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label 
                        htmlFor={`probation-officer-phone-${index}`}
                        className="text-sm font-medium text-gray-700"
                      >
                        Officer Phone
                      </Label>
                      <Input
                        id={`probation-officer-phone-${index}`}
                        type="tel"
                        value={probation.officerPhone}
                        onChange={(e) => {
                          const updatedProbations = [...(formData.probationHistory || [])];
                          updatedProbations[index] = {
                            ...updatedProbations[index],
                            officerPhone: e.target.value
                          };
                          handleSelectChange('probationHistory', updatedProbations);
                        }}
                        className="bg-white border-gray-200"
                        placeholder="(804) 555-0123"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const newProbation = {
                    type: 'probation' as const,
                    jurisdiction: '',
                    startDate: '',
                    endDate: '',
                    officerName: '',
                    officerEmail: '',
                    officerPhone: ''
                  } satisfies ProbationHistoryEntry;
                  handleSelectChange('probationHistory', [...(formData.probationHistory || []), newProbation]);
                }}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Supervision Record
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Drug Test Results Section */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          Baseline Drug Test Results
        </CardTitle>
        <p className="text-sm text-gray-500">
          Click on any drug to toggle its result between positive and negative
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {[
              { abbr: 'AMP', name: 'Amphetamine' },
              { abbr: 'BAR', name: 'Barbiturates' },
              { abbr: 'BUP', name: 'Buprenorphine' },
              { abbr: 'COC', name: 'Cocaine' },
              { abbr: 'mAMP', name: 'Methamphetamine' },
              { abbr: 'MDMA', name: 'Ecstasy' },
              { abbr: 'MOP', name: 'Morphine/Opiates' },
              { abbr: 'MTD', name: 'Methadone' },
              { abbr: 'OXY', name: 'Oxycodone' },
              { abbr: 'PCP', name: 'Phencyclidine' },
              { abbr: 'THC', name: 'Cannabis' },
              { abbr: 'EtG', name: 'Alcohol' },
              { abbr: 'FTY', name: 'Fentanyl' },
              { abbr: 'TRA', name: 'Tramadol' },
              { abbr: 'K2', name: 'Synthetic Cannabis' }
            ].map((drug) => {
              const isPositive = formData.drugTestResults?.[drug.abbr] === true;
              
              return (
                <button
                  key={drug.abbr}
                  onClick={() => {
                    const updatedResults = {
                      ...(formData.drugTestResults || {}),
                      [drug.abbr]: !isPositive
                    };
                    handleSelectChange('drugTestResults', updatedResults);
                  }}
                  className={`
                    relative px-3 py-1.5 rounded-full text-sm font-medium
                    transition-colors duration-200 ease-in-out
                    ${isPositive 
                      ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                  type="button"
                  title={drug.name}
                >
                  <span className="relative z-10">{drug.abbr}</span>
                  {isPositive && (
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-gray-100" />
              <span className="text-sm text-gray-600">Negative</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-100" />
              <span className="text-sm text-gray-600">Positive</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

{/* Signature Section */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileCheck className="h-5 w-5 text-blue-500" />
            Focus History Authorization
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label htmlFor="signature">Resident Signature</Label>
              <Input
                id="signature"
                value={formData.signatures.find(s => s.signatureType === 'asam_assessment')?.signature || ''}
                onChange={(e) => {
                  const now = new Date().toISOString();
                  const signatureId = `asam-${Date.now()}`;
                  const currentSignature = formData.signatures.find(s => s.signatureType === 'asam_assessment');
                  
                  const updatedSignature: Signature = {
                    signatureType: 'asam_assessment',
                    signature: e.target.value,
                    signatureTimestamp: now,
                    signatureId: signatureId,
                    witnessSignature: currentSignature?.witnessSignature || '',
                    witnessTimestamp: currentSignature?.witnessTimestamp || '',
                    witnessSignatureId: currentSignature?.witnessSignatureId || '',
                    agreed: true
                  };

                  const otherSignatures = formData.signatures.filter(s => s.signatureType !== 'asam_assessment');
                  handleSelectChange('signatures', [...otherSignatures, updatedSignature]);
                }}
                placeholder="Type your full legal name"
                className="bg-white"
              />
              {formData.signatures.find(s => s.signatureType === 'asam_assessment')?.signatureTimestamp && (
                <p className="text-sm text-gray-500">
                  Signed: {new Date(formData.signatures.find(s => s.signatureType === 'asam_assessment')?.signatureTimestamp || '').toLocaleString()}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <Label htmlFor="witnessSignature">Witness Signature</Label>
              <Input
                id="witnessSignature"
                value={formData.signatures.find(s => s.signatureType === 'asam_assessment')?.witnessSignature || ''}
                onChange={(e) => {
                  const now = new Date().toISOString();
                  const witnessId = `asam-witness-${Date.now()}`;
                  const currentSignature = formData.signatures.find(s => s.signatureType === 'asam_assessment');
                  
                  if (!currentSignature?.signature) return; // Don't allow witness signature without resident signature

                  const updatedSignature: Signature = {
                    ...currentSignature,
                    witnessSignature: e.target.value,
                    witnessTimestamp: now,
                    witnessSignatureId: witnessId
                  };

                  const otherSignatures = formData.signatures.filter(s => s.signatureType !== 'asam_assessment');
                  handleSelectChange('signatures', [...otherSignatures, updatedSignature]);
                }}
                disabled={!formData.signatures.find(s => s.signatureType === 'asam_assessment')?.signature}
                placeholder="Witness full legal name"
                className="bg-white"
              />
              {formData.signatures.find(s => s.signatureType === 'asam_assessment')?.witnessTimestamp && (
                <p className="text-sm text-gray-500">
                  Witnessed: {new Date(formData.signatures.find(s => s.signatureType === 'asam_assessment')?.witnessTimestamp || '').toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {formData.signatures.find(s => s.signatureType === 'asam_assessment')?.signatureId && (
            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-gray-500">
                Document ID: {formData.signatures.find(s => s.signatureType === 'asam_assessment')?.signatureId}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ASAMAssessment;