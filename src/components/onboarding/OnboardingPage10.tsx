import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileCheck, ScrollText } from "lucide-react";
import { OnboardingPageProps, SignatureType, Signature } from '@/types';

const generateSignatureId = () => `JH-CONTRACT-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

const getSignature = (signatures: Signature[], type: SignatureType) => {
  return signatures.find(sig => sig.signatureType === type);
};

const updateSignature = (
  currentSignatures: Signature[],
  type: SignatureType,
  updates: Partial<Signature>
): Signature[] => {
  const existingIndex = currentSignatures.findIndex(sig => sig.signatureType === type);
  const updatedSignatures = [...currentSignatures];
  
  if (existingIndex === -1) {
    updatedSignatures.push({
      signatureType: type,
      signature: '',
      signatureTimestamp: '',
      signatureId: generateSignatureId(),
      ...updates
    } as Signature);
  } else {
    updatedSignatures[existingIndex] = {
      ...updatedSignatures[existingIndex],
      ...updates
    };
  }
  
  return updatedSignatures;
};

export default function ResidentContract({
  formData,
  handleInputChange,
  handleSelectChange,
}: OnboardingPageProps) {
  const tenantRightsSignature = getSignature(formData.signatures, 'tenant_rights');
  const contractTermsSignature = getSignature(formData.signatures, 'contract_terms');
  
  const [hasScrolledFirstSection, setHasScrolledFirstSection] = useState(false);
  const [hasScrolledSecondSection, setHasScrolledSecondSection] = useState(false);
  const [rightAgreed, setRightAgreed] = useState(Boolean(tenantRightsSignature?.agreed));
  const [termsAgreed, setTermsAgreed] = useState(Boolean(contractTermsSignature?.agreed));
  const [residentName, setResidentName] = useState(tenantRightsSignature?.signature || '');

  const handleRightsScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    if (Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) < 1) {
      setHasScrolledFirstSection(true);
    }
  };

  const handleTermsScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    if (Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) < 1) {
      setHasScrolledSecondSection(true);
    }
  };

  const handleRightsCheckbox = (checked: boolean) => {
    setRightAgreed(checked);
    const timestamp = new Date().toISOString();
    
    const updatedSignatures = updateSignature(formData.signatures, 'tenant_rights', {
      agreed: checked,
      signature: residentName,
      signatureTimestamp: checked ? timestamp : '',
      signatureId: checked ? generateSignatureId() : ''
    });
    
    handleSelectChange('signatures', updatedSignatures);
  };

  const handleTermsCheckbox = (checked: boolean) => {
    setTermsAgreed(checked);
    const timestamp = new Date().toISOString();
    
    const updatedSignatures = updateSignature(formData.signatures, 'contract_terms', {
      agreed: checked,
      signature: residentName,
      signatureTimestamp: checked ? timestamp : '',
      signatureId: checked ? generateSignatureId() : ''
    });
    
    handleSelectChange('signatures', updatedSignatures);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setResidentName(newName);
    
    // Update both signatures with the new name
    if (rightAgreed) {
      const updatedSignatures = updateSignature(formData.signatures, 'tenant_rights', {
        signature: newName
      });
      handleSelectChange('signatures', updatedSignatures);
    }
    
    if (termsAgreed) {
      const updatedSignatures = updateSignature(formData.signatures, 'contract_terms', {
        signature: newName
      });
      handleSelectChange('signatures', updatedSignatures);
    }
  };

  const handleWitnessSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedSignatures = updateSignature(formData.signatures, 'tenant_rights', {
      witnessSignature: e.target.value,
      witnessTimestamp: e.target.value ? new Date().toISOString() : ''
    });
    
    handleSelectChange('signatures', updatedSignatures);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">JOURNEY HOUSE RESIDENT CONTRACT</h2>
        <p className="text-sm text-gray-600">Please read carefully and complete all sections</p>
      </div>

      {/* Tenant Rights Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ScrollText className="h-5 w-5 text-blue-500" />
            Resident as a Guest Agreement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea 
            className="h-48 w-full rounded-md border p-4"
            onScrollCapture={handleRightsScroll}
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-800 leading-relaxed">
                I understand that I am ONLY a guest at The Journey House, LLC ("Journey House"), and not a tenant. I understand that I may be asked to leave the property at any time, and I must do so in a timely manner (usually within one hour.) If my belongings are not promptly moved, Journey House will have them bagged up by the residence house leaders, and they will be stored for a maximum of fourteen days. If belongings are not removed from the residence within fourteen days, Journey House will donate the belongings to charity or dispose of them. Failure to leave property when asked to do so will result in police contact and possible criminal charges.
              </p>
            </div>
          </ScrollArea>

          <div className="mt-4 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <Label htmlFor="residentName" className="text-sm font-medium block mb-2">
                Enter your full legal name:
              </Label>
              <Input
                id="residentName"
                name="residentName"
                value={residentName}
                onChange={handleNameChange}
                placeholder="Your full legal name"
                className="bg-white mb-2"
                disabled={!hasScrolledFirstSection}
              />
              <p className="text-xs text-gray-500">
                By entering your name, you acknowledge that you understand this agreement.
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="tenantRightsAgreed"
                checked={rightAgreed}
                onCheckedChange={handleRightsCheckbox}
                disabled={!hasScrolledFirstSection || !residentName}
              />
              <label htmlFor="tenantRightsAgreed" className="text-sm font-medium leading-none">
                I, {residentName || '_______________'}, relinquish my tenant rights while staying as a guest at Journey House Foundation
              </label>
            </div>

            {tenantRightsSignature?.signatureTimestamp && (
              <p className="text-sm text-gray-500">
                Acknowledged on: {new Date(tenantRightsSignature.signatureTimestamp).toLocaleString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contract Terms Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ScrollText className="h-5 w-5 text-blue-500" />
            Contract Terms and Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea 
            className="h-96 w-full rounded-md border p-4"
            onScrollCapture={handleTermsScroll}
          >
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-sm text-gray-800 leading-relaxed">
                  The Journey House, LLC ("Journey House") houses are transitional living residences for individuals who are recovering from substance use disorder. Residents are subject to urine drug screens at any time while living in the residence.
                </p>
                
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <p className="text-sm font-bold text-red-800">
                    THE USE AND/OR POSSESSION OF DRUGS AND/OR ALCOHOL, OR POSSESSION OF NON-APPROVED PRESCRIPTIONS, ARE GROUNDS FOR IMMEDIATE EXPULSION.
                  </p>
                </div>

                <p className="text-sm text-gray-800">
                  All policies and procedures outlined within this contract and any applicable subsequent amendments are in full force and effect during a resident's entire residency unless specifically defined within a subsection of this contract. Violation of any policy or procedure outlined in this contract and any applicable subsequent amendments will result in disciplinary actions including fines, fees, house probation/restriction, and possible expulsion.
                </p>

                <div className="space-y-6">
                  <section>
                    <h3 className="text-lg font-bold">Upon Arrival</h3>
                    <ul className="list-decimal pl-5 space-y-2 text-sm text-gray-800">
                      <li>Residents will have all their clothing and bedding washed AND dried prior to moving into their residence.</li>
                      <li>Residents will provide a urine sample for initial drug screen.</li>
                      <li>Residents will complete an intake form, rec-cap assessment & consent form.</li>
                      <li>Residents will report and secure all medications in a lockbox.</li>
                      <li>Residents will commence a 30-day probation period.</li>
                      <li>Residents will read and sign the House Rules Form.</li>
                      <li>Residents will read and sign Contract of Residency.</li>
                      <li>Residents will agree to have their belongings searched.</li>
                      <li>Residents will agree to pay fees at time of entry.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold">During 30-day Probationary Period</h3>
                    <ul className="list-decimal pl-5 space-y-2 text-sm text-gray-800">
                      <li>Residents may not have any overnight stays off premises or on the premises.</li>
                      <li>Curfew of 10 p.m. Sunday through Thursday, an 11pm on Friday and Saturday.</li>
                      <li>Residents must always inform House Leaders of their whereabouts.</li>
                      <li>Residents must attend at least one NA/AA meeting daily and have the meeting slip signed.</li>
                      <li>Must have someone with Journey house Who has over 30-days clean time with them when leave the house.</li>
                      <li>Must complete Chores.</li>
                      <li>Must attend Weekly House meeting.</li>
                      <li>Must attend monthly All Journey House meeting at the Center.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold">After 30-day Probationary Period</h3>
                    <ul className="list-decimal pl-5 space-y-2 text-sm text-gray-800">
                      <li>Residents must have overnight stays approved 48 hours in advance, through staff group text. Residents are allowed 2 overnights per week. Overnights are not to be consecutive.</li>
                      <li>Curfew of 11 p.m. on weekdays, 12:00 a.m. on weekends.</li>
                      <li>Residents must always inform House Leaders of their whereabouts.</li>
                      <li>Residents must attend at least one NA/AA meeting daily.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold">After 90 days of residency</h3>
                    <ul className="list-decimal pl-5 space-y-2 text-sm text-gray-800">
                      <li>Residents must have overnight stays approved 24 hours in advance. Residents are allowed 2 overnights per week. Overnights are not to be consecutive.</li>
                      <li>Curfew of 11 p.m. on weekdays, 12:00 a.m. on weekends.</li>
                      <li>Residents must always inform House Leaders of their whereabouts.</li>
                      <li>Residents must attend at least four NA/AA meetings weekly.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold">Expense Responsibility</h3>
                    <ul className="list-decimal pl-5 space-y-2 text-sm text-gray-800">
                      <li>The residency bed fee is $175 per week, bed fees are charged in advance on Friday.</li>
                      <li>Bed Fees are paid through our client Portal established at intake (ARMS/REC-CAP).</li>
                      <li>Journey house does not pay for your bedding, towels or toiletries.</li>
                      <li>Journey House does not supply groceries.</li>
                      <li>Advance payments can be made for residency fees and/or other charges.</li>
                      <li>There will be a $25.00 fee for all returned checks.</li>
                      <li>Initial payment is expected upon acceptance and entry into Journey House.</li>
                      <li>If a resident should be behind on fees, resident must adhere to a 9:00 p.m. curfew every night, with no overnight stays, until fees are paid in full.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold">Employment Obligations</h3>
                    <ul className="list-decimal pl-5 space-y-2 text-sm text-gray-800">
                      <li>Residents seeking employment in an establishment that serves alcohol must receive approval by management.</li>
                      <li>Resident's progress toward employment and recovery goals will be addressed at each house meeting.</li>
                      <li>Residents must supply an employment schedule to their house leaders and staff weekly.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold">Immediate Discharge Conditions</h3>
                    <p className="text-sm text-gray-800 mb-2">
                      Disruptive behavior is grounds for immediate dismissal. Disruptive behavior is defined as follows, but not limited to:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-800">
                      <li>Violence or threats of violence</li>
                      <li>Abusive verbal behavior</li>
                      <li>Physical violence</li>
                      <li>A "chronic" bad attitude</li>
                      <li>Gambling</li>
                      <li>Destruction of house property</li>
                      <li>Loud music, radio, or instrument</li>
                      <li>Theft</li>
                      <li>Breaking confidentiality</li>
                      <li>Abusive/loud arguments</li>
                      <li>Violation of Journey House policy & procedure</li>
                      <li>Use of drugs and/or alcohol, or non-approved prescriptions, on or off the property</li>
                      <li>Possession and/or use of weapons</li>
                      <li>Refusal to provide urine sample and/or alcohol test</li>
                      <li>Not informing management when you know that a resident is using drugs and/or alcohol, or non-approved prescribed medication</li>
                      <li>Not paying fees</li>
                      <li>Expression of racism or bullying</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold">Resident Responsibilities</h3>
                    <ul className="list-decimal pl-5 space-y-2 text-sm text-gray-800">
                      <li>Residents must respect the anonymity of all residents. Resident and house business is confidential and must not be discussed outside of the house.</li>
                      <li>Residents will be responsible for completing assigned chores.</li>
                      <li>Residents are expected to always maintain a respectful noise level while at the house.</li>
                      <li>Rooms are subject to inspection at any time. Rooms should be kept neat and clean, and the beds should be made daily.</li>
                      <li>Residence must be cleaned by all residents daily and inspected by the house leader.</li>
                      <li>Laundry must be done weekly, including bedding and towels.</li>
                      <li>You can have no more than 10 days' worth of clothes in the residence. Your clothes must be stored in closets, dressers/bins.</li>
                      <li>Food and drinks can be stored only in the kitchen. Food can be eaten only in the kitchen or eating area. NO FOOD OR DRINKS IN YOUR BEDROOM.</li>
                      <li>Residents are subject to random searches of their personal belongings and physical body.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold">Overnights</h3>
                    <ul className="list-decimal pl-5 space-y-2 text-sm text-gray-800">
                      <li>No overnights will be allowed during the 30-day probationary period.</li>
                      <li>No overnight stays will be allowed for anyone who is behind in residency fees.</li>
                      <li>Overnight stay requests must be received at least two days before the requested date.</li>
                      <li>An overnight pass is not an excuse to miss a house meeting or NA/AA meeting; attendance of expected meetings is mandatory.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold">Medication</h3>
                    <ul className="list-decimal pl-5 space-y-2 text-sm text-gray-800">
                      <li>Residents must self-administer medication as prescribed by physician.</li>
                      <li>Residents must not distribute medication for any reason without physician's order.</li>
                      <li>Residents may not be prescribed narcotic medications unless permission has been given by staff.</li>
                      <li>Medication must be stored in a lockbox and secured by the peer leader within the recovery residence.</li>
                      <li>Residents will be subject to random witnessed pill counts.</li>
                      <li>Newly prescribed medications must be reported to Journey House management before filling prescription.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold">Visitors</h3>
                    <ul className="list-decimal pl-5 space-y-2 text-sm text-gray-800">
                      <li>All visitors must be pre-approved by the house leader.</li>
                      <li>Visitors are allowed in the common areas only, not in residents' bedrooms.</li>
                      <li>Visitors must have a minimum of 30 days of sobriety.</li>
                      <li>Overnights for visitors must be approved by Journey House management two day prior to the date of overnight.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold">Smoking</h3>
                    <ul className="list-decimal pl-5 space-y-2 text-sm text-gray-800">
                      <li>Smoking is prohibited in the house. Violation of this policy will result in offending residents being placed on a minimum 2-week restriction and possible dismissal.</li>
                      <li>Smoking is not permitted in company vehicles.</li>
                      <li>Smoking is permitted in designated areas only.</li>
                      <li>Vaping is allowed in the residence if ALL residents have voted "yes".</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold">Failure to Comply</h3>
                    <p className="text-sm text-gray-800 mb-2">
                      Prior to termination of residency, management may impose the following restrictions:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-800">
                      <li>No television</li>
                      <li>No cellphone</li>
                      <li>Leaving house for work and meetings only</li>
                      <li>No overnights</li>
                      <li>Curfew restriction</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold">Termination of Residency</h3>
                    <ul className="list-decimal pl-5 space-y-2 text-sm text-gray-800">
                      <li>A one-week notice is required prior to moving out.</li>
                      <li>Upon leaving, residents will be monitored while packing his/her things.</li>
                      <li>The right to return to the residence after expulsion, for any reason, is at the discretion of Journey House management.</li>
                      <li>Upon expulsion, personal belongings must be picked up within seven days.</li>
                      <li>Prepaid residency fees will not be returned to any resident who exits any Journey House residence.</li>
                      <li>RESIDENT AGREES THAT IF HE/SHE IS ASKED TO LEAVE THE RESIDENCE FOR ANY REASON, HE/SHE WILL DO SO AT THE TIME OF BEING ASKED TO LEAVE.</li>
                    </ul>
                  </section>

                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-6">
                    <p className="text-sm font-bold text-yellow-800">
                      This contract and rules are subject to change without prior notice.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="flex items-center space-x-2 border-t pt-4 mt-4">
            <Checkbox
              id="contractTermsAgreed"
              checked={termsAgreed}
              onCheckedChange={handleTermsCheckbox}
              disabled={!hasScrolledSecondSection || !rightAgreed}
            />
            <label htmlFor="contractTermsAgreed" className="text-sm font-medium leading-none">
              I have read and agree to abide by all Journey House terms and conditions
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Final Signature Section */}
      {termsAgreed && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-emerald-500" />
              Final Authorization
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label>Resident Signature</Label>
                <div className="p-4 bg-gray-50 rounded border">
                  <p className="text-sm font-medium">{residentName}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {contractTermsSignature?.signatureTimestamp && 
                      `Signed: ${new Date(contractTermsSignature.signatureTimestamp).toLocaleString()}`
                    }
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="witnessSignature">Witness Signature</Label>
                <Input
                  id="witnessSignature"
                  name="witnessSignature"
                  value={tenantRightsSignature?.witnessSignature || ''}
                  onChange={handleWitnessSignature}
                  required
                  placeholder="Witness full legal name"
                  className="bg-white"
                />
                {tenantRightsSignature?.witnessTimestamp && (
                  <p className="text-sm text-gray-500">
                    Witnessed: {new Date(tenantRightsSignature.witnessTimestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {contractTermsSignature?.signatureId && (
              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-sm text-gray-500">Document ID: {contractTermsSignature.signatureId}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}