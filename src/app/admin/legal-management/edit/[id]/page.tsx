"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from '@/components/contexts/AuthContext';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, Eye, History } from "lucide-react";
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

// Document type configurations from the main page
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

export default function EditLegalDocumentPage() {
  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  
  const documentId = params.id as string;
  const mode = searchParams.get('mode');

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  // Load document data
  useEffect(() => {
    const loadDocument = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);

        if (mode === 'create') {
          // Create mode - documentId is actually the document_type
          setIsCreateMode(true);
          const docType = LEGAL_DOCUMENT_TYPES.find(type => type.key === documentId);
          if (docType) {
            setTitle(docType.title);
            setDescription(docType.description);
            setContent('');
          } else {
            throw new Error('Invalid document type');
          }
        } else {
          // Edit mode - load existing document
          const { data, error } = await supabase
            .from('legal_documents')
            .select('*')
            .eq('id', documentId)
            .single();

          if (error || !data) {
            throw new Error('Document not found');
          }

          setDocument(data);
          setTitle(data.title);
          setContent(data.content);
          setDescription(data.description || '');
        }
      } catch (err) {
        console.error('Error loading document:', err);
        setError(err instanceof Error ? err.message : 'Failed to load document');
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [user, documentId, mode, supabase]);

  const handleSave = async () => {
    if (!user || !title.trim() || !content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      if (isCreateMode) {
        // Create new document
        const { data, error } = await supabase
          .from('legal_documents')
          .insert({
            document_type: documentId, // In create mode, documentId is the document_type
            title: title.trim(),
            content: content.trim(),
            description: description.trim(),
            version: 1,
            is_active: true,
            created_by: user.id
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        toast.success('Document created successfully!');
        router.push('/admin/legal-management');
      } else {
        // Update existing document - create new version
        if (!document) throw new Error('No document to update');

        // Get the next version number
        const { data: existingVersions } = await supabase
          .from('legal_documents')
          .select('version')
          .eq('document_type', document.document_type)
          .order('version', { ascending: false })
          .limit(1);

        const nextVersion = existingVersions && existingVersions.length > 0 
          ? existingVersions[0].version + 1 
          : 1;

        // Create new version
        const { data, error } = await supabase
          .from('legal_documents')
          .insert({
            document_type: document.document_type,
            title: title.trim(),
            content: content.trim(),
            description: description.trim(),
            version: nextVersion,
            is_active: true, // This will automatically deactivate other versions via trigger
            created_by: user.id
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        toast.success(`Document updated! New version ${nextVersion} created.`);
        router.push('/admin/legal-management');
      }
    } catch (err) {
      console.error('Error saving document:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save document';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (document) {
      router.push(`/admin/legal-management/view/${document.id}`);
    }
  };

  const handleViewHistory = () => {
    const docType = isCreateMode ? documentId : document?.document_type;
    if (docType) {
      router.push(`/admin/legal-management/history/${docType}`);
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

  if (error && !isCreateMode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/admin/legal-management')}>
            Back to Legal Management
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
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
              <h1 className="text-3xl font-bold text-gray-900">
                {isCreateMode ? 'Create' : 'Edit'} Legal Document
              </h1>
              <p className="text-gray-600 mt-1">
                {isCreateMode 
                  ? 'Create a new legal document for the onboarding process'
                  : `Editing will create a new version (v${(document?.version || 0) + 1})`
                }
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {!isCreateMode && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreview}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewHistory}
                    className="flex items-center gap-2"
                  >
                    <History className="h-4 w-4" />
                    History
                  </Button>
                </>
              )}
              <Button
                onClick={handleSave}
                disabled={isSaving || !title.trim() || !content.trim()}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Document Details</CardTitle>
            <CardDescription>
              {isCreateMode 
                ? 'Enter the details for the new legal document'
                : 'Make your changes below. Saving will create a new version.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title">Document Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter document title"
                className="mt-1"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this document"
                className="mt-1"
              />
            </div>

            {/* Content */}
            <div>
              <Label htmlFor="content">Legal Content *</Label>
              <p className="text-sm text-gray-600 mb-2">
                Enter the legal text that participants will see and agree to. You can use Markdown formatting.
              </p>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter the legal document content..."
                className="mt-1 min-h-[400px] font-mono text-sm"
              />
              <p className="text-sm text-gray-500 mt-2">
                Tip: Use **bold**, *italic*, and other Markdown formatting to style your text.
              </p>
            </div>

            {/* Document Info */}
            {!isCreateMode && document && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Current Document Info</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Document Type:</span>
                    <span className="ml-2 font-medium">{document.document_type}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Current Version:</span>
                    <span className="ml-2 font-medium">v{document.version}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className="ml-2 font-medium">{document.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="ml-2 font-medium">{new Date(document.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-4 text-red-700 bg-red-100 rounded-lg">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 