"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from '@/components/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Download, User, Calendar, Phone, Mail, MapPin, FileText } from "lucide-react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface ParticipantData {
  id: string;
  first_name: string;
  last_name: string;
  intake_date: string;
  housing_location: string;
  date_of_birth: string;
  social_security_number: string;
  sex: string;
  email: string;
  drivers_license_number: string;
  phone_number: string;
  created_at: string;
  // Related data
  healthStatus?: any;
  vehicle?: any;
  emergencyContact?: any;
  medicalInformation?: any;
  medications?: any[];
  authorizedPeople?: any[];
  legalStatus?: any;
  signatures?: any[];
  mentalHealth?: any;
  drugHistory?: any[];
}

export default function ApplicationDetailPage() {
  const [participant, setParticipant] = useState<ParticipantData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const supabase = createClientComponentClient();
  
  const participantId = params.id as string;

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  // Fetch participant data
  useEffect(() => {
    const fetchParticipantData = async () => {
      if (!participantId) return;
      
      try {
        setIsLoading(true);
        
        // Fetch main participant information
        const { data: participantData, error: participantError } = await supabase
          .from('participants')
          .select('*')
          .eq('id', participantId)
          .single();

        if (participantError || !participantData) {
          throw new Error('Participant not found');
        }

        // Fetch all related data
        const [
          { data: healthStatus },
          { data: vehicle },
          { data: emergencyContact },
          { data: medicalInfo },
          { data: medications },
          { data: authorizedPeople },
          { data: legalStatus },
          { data: signatures },
          { data: mentalHealth },
          { data: drugHistory }
        ] = await Promise.all([
          supabase.from('health_status').select('*').eq('participant_id', participantId).single(),
          supabase.from('vehicles').select('*').eq('participant_id', participantId).single(),
          supabase.from('emergency_contacts').select('*').eq('participant_id', participantId).single(),
          supabase.from('medical_information').select('*').eq('participant_id', participantId).single(),
          supabase.from('medications').select('*').eq('participant_id', participantId),
          supabase.from('authorized_people').select('*').eq('participant_id', participantId),
          supabase.from('legal_status').select('*').eq('participant_id', participantId).single(),
          supabase.from('signatures').select('*').eq('participant_id', participantId),
          supabase.from('mental_health').select('*').eq('participant_id', participantId).single(),
          supabase.from('drug_history').select('*').eq('participant_id', participantId)
        ]);

        // Combine all data
        const completeParticipantData: ParticipantData = {
          ...participantData,
          healthStatus: healthStatus || null,
          vehicle: vehicle || null,
          emergencyContact: emergencyContact || null,
          medicalInformation: medicalInfo || null,
          medications: medications || [],
          authorizedPeople: authorizedPeople || [],
          legalStatus: legalStatus || null,
          signatures: signatures || [],
          mentalHealth: mentalHealth || null,
          drugHistory: drugHistory || []
        };

        setParticipant(completeParticipantData);
      } catch (err) {
        console.error('Error fetching participant data:', err);
        setError('Failed to load participant data');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && participantId) {
      fetchParticipantData();
    }
  }, [user, participantId, supabase]);

  const handleDownloadPDF = async () => {
    if (!participant) return;
    
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId: participant.id,
          documentType: 'intake_form'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${participant.first_name}${participant.last_name}_Intake.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error || !participant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error || 'Participant not found'}</p>
          <Button onClick={() => router.push('/admin/applications')}>
            Back to Applications
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin/applications')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Applications
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {participant.first_name} {participant.last_name}
              </h1>
              <p className="text-gray-600 mt-1">Participant Application Details</p>
            </div>
            
            <Button onClick={handleDownloadPDF} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">First Name</label>
                    <p className="text-gray-900">{participant.first_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Name</label>
                    <p className="text-gray-900">{participant.last_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                    <p className="text-gray-900">
                      {participant.date_of_birth ? new Date(participant.date_of_birth).toLocaleDateString() : 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Sex</label>
                    <p className="text-gray-900">{participant.sex || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">SSN</label>
                    <p className="text-gray-900">
                      {participant.social_security_number ? `***-**-${participant.social_security_number.slice(-4)}` : 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Driver's License</label>
                    <p className="text-gray-900">{participant.drivers_license_number || 'Not provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{participant.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">{participant.phone_number || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Housing Location</label>
                    <p className="text-gray-900">{participant.housing_location || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Intake Date</label>
                    <p className="text-gray-900">
                      {participant.intake_date ? new Date(participant.intake_date).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            {participant.emergencyContact && (
              <Card>
                <CardHeader>
                  <CardTitle>Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-gray-900">
                        {participant.emergencyContact.first_name} {participant.emergencyContact.last_name}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-gray-900">{participant.emergencyContact.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Relationship</label>
                      <p className="text-gray-900">{participant.emergencyContact.relationship}</p>
                    </div>
                    {participant.emergencyContact.other_relationship && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Other Relationship</label>
                        <p className="text-gray-900">{participant.emergencyContact.other_relationship}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Medications */}
            {participant.medications && participant.medications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Current Medications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {participant.medications.map((med, index) => (
                      <Badge key={index} variant="outline">
                        {med.medication_name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Authorized People */}
            {participant.authorizedPeople && participant.authorizedPeople.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Authorized People</CardTitle>
                  <CardDescription>People authorized to receive information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {participant.authorizedPeople.map((person, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{person.first_name} {person.last_name}</p>
                          <p className="text-sm text-gray-600">{person.relationship}</p>
                        </div>
                        <p className="text-sm text-gray-600">{person.phone}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Application Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Application Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Status</span>
                  <Badge>Completed</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Submitted</span>
                  <span className="text-sm">{new Date(participant.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Signatures</span>
                  <span className="text-sm">{participant.signatures?.length || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={handleDownloadPDF} className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Complete PDF
                </Button>
                <Button 
                  onClick={() => window.open(`mailto:${participant.email}`, '_blank')} 
                  className="w-full" 
                  variant="outline"
                  disabled={!participant.email}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button 
                  onClick={() => window.open(`tel:${participant.phone_number}`, '_blank')} 
                  className="w-full" 
                  variant="outline"
                  disabled={!participant.phone_number}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Participant
                </Button>
              </CardContent>
            </Card>

            {/* Signatures Summary */}
            {participant.signatures && participant.signatures.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Signed Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {participant.signatures.map((signature, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="capitalize">{signature.signature_type.replace(/_/g, ' ')}</span>
                        <span className="text-gray-500">
                          {new Date(signature.signature_timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 