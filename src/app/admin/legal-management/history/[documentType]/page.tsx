"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from '@/components/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Eye, Edit, Plus, Clock, User, CheckCircle } from "lucide-react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-toastify';

interface LegalDocument {
  id: string;
  document_type: string;
  title: string;
  content: string;
  description: string;
  version: number;
  is_active: boolean;
  created_at: string;
  created_by: string;
}

// Document type configurations
const LEGAL_DOCUMENT_TYPES = [
  { key: 'emergency_consent', title: 'Emergency Medical Care Agreement', description: 'Medical emergency procedures and consent' },
  { key: 'medication_consent', title: 'Medication Management Agreement', description: 'Prescription and medication policies' },
  { key: 'disclosure_agreement', title: 'Disclosure Authorization', description: 'Information sharing authorization' },
  { key: 'treatment_consent', title: 'Treatment Consent Agreement', description: 'Program participation and treatment consent' },
  { key: 'price_consent', title: 'Fee Schedule and Payment Policy', description: 'Pricing and payment terms' },
  { key: 'tenant_rights', title: 'Tenant Rights and Responsibilities', description: 'Rights and responsibilities as a tenant' },
  { key: 'contract_terms', title: 'Resident Contract', description: 'Terms and conditions of residency' },
  { key: 'criminal_history', title: 'Criminal History Disclosure', description: 'Criminal background disclosure requirements' },
  { key: 'ethics_agreement', title: 'Code of Ethics and Values', description: 'Ethical principles and values' },
  { key: 'critical_rules', title: 'Critical Rules', description: 'Essential rules with immediate consequences' },
  { key: 'house_rules', title: 'House Rules', description: 'General house policies and guidelines' },
  { key: 'resident_as_guest', title: 'Resident as Guest Agreement', description: 'Guest status acknowledgment' },
  { key: 'digital_signature_consent', title: 'Digital Signature Consent', description: 'Electronic signature authorization' },
  { key: 'drug_screening_consent', title: 'Drug Screening Consent', description: 'Drug testing procedures and consent' }
];

export default function LegalDocumentHistoryPage() {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null);
  const [isActivating, setIsActivating] = useState<string | null>(null);
  
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const supabase = createClientComponentClient();
  
  const documentType = params.documentType as string;
  const documentTypeInfo = LEGAL_DOCUMENT_TYPES.find(type => type.key === documentType);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  // Load document history
  useEffect(() => {
    const loadDocumentHistory = async () => {
      if (!user || !documentType) return;
      
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('legal_documents')
          .select('*')
          .eq('document_type', documentType)
          .order('version', { ascending: false });

        if (error) {
          throw error;
        }

        setDocuments(data || []);
      } catch (err) {
        console.error('Error loading document history:', err);
        setError(err instanceof Error ? err.message : 'Failed to load document history');
      } finally {
        setIsLoading(false);
      }
    };

    loadDocumentHistory();
  }, [user, documentType, supabase]);

  const handleActivateVersion = async (documentId: string, version: number) => {
    if (!user) return;
    
    try {
      setIsActivating(documentId);
      
      // Update the selected version to be active
      const { error } = await supabase
        .from('legal_documents')
        .update({ is_active: true })
        .eq('id', documentId);

      if (error) {
        throw error;
      }

      toast.success(`Version ${version} is now active!`);
      
      // Reload the data
      const { data } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('document_type', documentType)
        .order('version', { ascending: false });
      
      setDocuments(data || []);
    } catch (err) {
      console.error('Error activating version:', err);
      toast.error('Failed to activate version');
    } finally {
      setIsActivating(null);
    }
  };

  const handleView = (document: LegalDocument) => {
    router.push(`/admin/legal-management/view/${document.id}`);
  };

  const handleEdit = (document: LegalDocument) => {
    router.push(`/admin/legal-management/edit/${document.id}`);
  };

  const handleCreateNew = () => {
    router.push(`/admin/legal-management/edit/${documentType}?mode=create`);
  };

  // Simple content preview (first 100 characters)
  const getContentPreview = (content: string) => {
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
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

  if (!documentTypeInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Invalid Document Type</h1>
          <p className="text-gray-600 mb-4">The document type "{documentType}" was not found.</p>
          <Button onClick={() => router.push('/admin/legal-management')}>
            Back to Legal Management
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
              onClick={() => router.push('/admin/legal-management')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Legal Management
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Document History</h1>
              <p className="text-gray-600 mt-1">
                Version history for: <span className="font-medium">{documentTypeInfo.title}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={handleCreateNew}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create New Version
              </Button>
            </div>
          </div>
        </div>

        {/* Document Type Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-teal-600" />
              {documentTypeInfo.title}
            </CardTitle>
            <CardDescription>{documentTypeInfo.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Document Type:</span>
                <div className="font-medium font-mono bg-gray-100 px-2 py-1 rounded mt-1">{documentType}</div>
              </div>
              <div>
                <span className="text-gray-600">Total Versions:</span>
                <div className="font-medium">{documents.length}</div>
              </div>
              <div>
                <span className="text-gray-600">Active Version:</span>
                <div className="font-medium">
                  {documents.find(doc => doc.is_active)?.version || 'None'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Version History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Version History</CardTitle>
            <CardDescription>
              All versions of this document, sorted by version number (newest first)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8 text-red-600">
                {error}
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No versions found</p>
                <p className="mb-4">This document type hasn't been created yet.</p>
                <Button onClick={handleCreateNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Version
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Version</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Content Preview</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((document) => (
                      <TableRow key={document.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">v{document.version}</Badge>
                            {document.is_active && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{document.title}</TableCell>
                        <TableCell>
                          <Badge variant={document.is_active ? 'default' : 'secondary'}>
                            {document.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{new Date(document.created_at).toLocaleDateString()}</div>
                            <div className="text-gray-500">
                              {new Date(document.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="text-sm text-gray-600 truncate">
                            {getContentPreview(document.content)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(document)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(document)}
                              className="flex items-center gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                            {!document.is_active && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleActivateVersion(document.id, document.version)}
                                disabled={isActivating === document.id}
                                className="flex items-center gap-1"
                              >
                                <CheckCircle className="h-3 w-3" />
                                {isActivating === document.id ? 'Activating...' : 'Activate'}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Version Control Information</CardTitle>
            <CardDescription>
              How document versioning works in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">Active Version:</span>
                <span className="ml-2">Only one version can be active at a time. This is what participants see during onboarding.</span>
              </div>
              <div>
                <span className="text-gray-600">Version History:</span>
                <span className="ml-2">All previous versions are preserved for legal and audit purposes.</span>
              </div>
              <div>
                <span className="text-gray-600">Signature Storage:</span>
                <span className="ml-2">When participants sign, the exact content and version are stored permanently with their signature.</span>
              </div>
              <div>
                <span className="text-gray-600">Editing:</span>
                <span className="ml-2">Editing a document always creates a new version. Previous versions cannot be modified.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 