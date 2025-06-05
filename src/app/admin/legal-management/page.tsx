"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from '@/components/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Edit, Eye, Plus, History, FileText } from "lucide-react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface LegalDocument {
  id: string;
  document_type: string;
  title: string;
  content: string;
  version: number;
  is_active: boolean;
  created_at: string;
  created_by: string;
  description?: string;
}

// Legal document types that can be managed
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

export default function LegalManagementPage() {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<LegalDocument[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  // Fetch legal documents from database
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        
        // First, ensure we have the legal_documents table
        const { data, error } = await supabase
          .from('legal_documents')
          .select('*')
          .order('document_type', { ascending: true })
          .order('version', { ascending: false });

        if (error) {
          // If table doesn't exist, we'll show the initialization UI
          console.log('Legal documents table may not exist yet:', error);
          setDocuments([]);
        } else {
          setDocuments(data || []);
        }
        
        setFilteredDocuments(data || []);
      } catch (err) {
        console.error('Error fetching legal documents:', err);
        setError('Failed to load legal documents');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDocuments();
    }
  }, [user, supabase]);

  // Filter documents based on search term
  useEffect(() => {
    const filtered = documents.filter(doc =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.document_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredDocuments(filtered);
  }, [searchTerm, documents]);

  const handleCreateDocument = (documentType: string) => {
    router.push(`/admin/legal-management/edit/${documentType}?mode=create`);
  };

  const handleEditDocument = (documentId: string) => {
    router.push(`/admin/legal-management/edit/${documentId}`);
  };

  const handleViewDocument = (documentId: string) => {
    router.push(`/admin/legal-management/view/${documentId}`);
  };

  const handleViewHistory = (documentType: string) => {
    router.push(`/admin/legal-management/history/${documentType}`);
  };

  // Get the latest version for each document type
  const getLatestDocuments = () => {
    const documentMap = new Map();
    documents.forEach(doc => {
      const existing = documentMap.get(doc.document_type);
      if (!existing || doc.version > existing.version) {
        documentMap.set(doc.document_type, doc);
      }
    });
    return Array.from(documentMap.values());
  };

  // Check which document types don't have any versions yet
  const getMissingDocumentTypes = () => {
    const existingTypes = new Set(documents.map(doc => doc.document_type));
    return LEGAL_DOCUMENT_TYPES.filter(type => !existingTypes.has(type.key));
  };

  if (!user) {
    return null;
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
              onClick={() => router.push('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Hub
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Legal Document Management</h1>
              <p className="text-gray-600 mt-1">Manage and version control legal agreements and forms</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Document Types</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{LEGAL_DOCUMENT_TYPES.length}</div>
              <p className="text-xs text-muted-foreground">Total document types</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Documents</CardTitle>
              <Badge variant="secondary" className="h-4 w-4 rounded-full p-0"></Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getLatestDocuments().filter(doc => doc.is_active).length}</div>
              <p className="text-xs text-muted-foreground">Currently in use</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Missing Documents</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getMissingDocumentTypes().length}</div>
              <p className="text-xs text-muted-foreground">Need to be created</p>
            </CardContent>
          </Card>
        </div>

        {/* Missing Documents Section */}
        {getMissingDocumentTypes().length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-amber-600" />
                Missing Documents
              </CardTitle>
              <CardDescription>
                These document types haven&apos;t been created yet. Click to create the initial version.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getMissingDocumentTypes().map((docType) => (
                  <div
                    key={docType.key}
                    className="p-4 border border-amber-200 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer"
                    onClick={() => handleCreateDocument(docType.key)}
                  >
                    <h3 className="font-medium text-gray-900 mb-1">{docType.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{docType.description}</p>
                    <Button size="sm" variant="outline" className="w-full">
                      <Plus className="h-3 w-3 mr-1" />
                      Create Document
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Legal Documents</CardTitle>
            <CardDescription>
              {getLatestDocuments().length} document type{getLatestDocuments().length !== 1 ? 's' : ''} configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                {error}
              </div>
            ) : getLatestDocuments().length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No legal documents found. Create your first document above.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getLatestDocuments().map((document) => (
                      <TableRow key={document.id}>
                        <TableCell className="font-medium">
                          <span className="capitalize">{document.document_type.replace(/_/g, ' ')}</span>
                        </TableCell>
                        <TableCell>{document.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">v{document.version}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={document.is_active ? 'default' : 'secondary'}>
                            {document.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(document.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDocument(document.id)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditDocument(document.id)}
                              className="flex items-center gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewHistory(document.document_type)}
                              className="flex items-center gap-1"
                            >
                              <History className="h-3 w-3" />
                              History
                            </Button>
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
      </div>
    </div>
  );
} 