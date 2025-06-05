"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/components/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, History, Download } from "lucide-react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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

export default function ViewLegalDocumentPage() {
  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const supabase = createClientComponentClient();
  
  const documentId = params.id as string;

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  // Load document data
  useEffect(() => {
    const loadDocument = async () => {
      if (!user || !documentId) return;
      
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('legal_documents')
          .select('*')
          .eq('id', documentId)
          .single();

        if (error || !data) {
          throw new Error('Document not found');
        }

        setDocument(data);
      } catch (err) {
        console.error('Error loading document:', err);
        setError(err instanceof Error ? err.message : 'Failed to load document');
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [user, documentId, supabase]);

  const handleEdit = () => {
    if (document) {
      router.push(`/admin/legal-management/edit/${document.id}`);
    }
  };

  const handleViewHistory = () => {
    if (document) {
      router.push(`/admin/legal-management/history/${document.document_type}`);
    }
  };

  const handleDownloadText = () => {
    if (!document) return;
    
    const blob = new Blob([document.content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${document.document_type}_v${document.version}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Simple markdown-like rendering for basic formatting
  const renderContent = (content: string) => {
    return content
      .split('\n')
      .map((line, index) => {
        // Handle headers
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold mb-4 text-gray-900">{line.substring(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-semibold mb-3 text-gray-900">{line.substring(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-medium mb-2 text-gray-900">{line.substring(4)}</h3>;
        }
        
        // Handle bold and italic (simple version)
        let processedLine = line
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Empty lines
        if (line.trim() === '') {
          return <br key={index} />;
        }
        
        // Regular paragraphs
        return (
          <p 
            key={index} 
            className="mb-3 text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: processedLine }}
          />
        );
      });
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

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error || 'Document not found'}</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Legal Document Preview</h1>
              <p className="text-gray-600 mt-1">
                Preview how this document appears to participants
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadText}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
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
              <Button
                onClick={handleEdit}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Document
              </Button>
            </div>
          </div>
        </div>

        {/* Document Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3">
                  {document.title}
                  <Badge variant={document.is_active ? 'default' : 'secondary'}>
                    {document.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </CardTitle>
                <CardDescription>{document.description}</CardDescription>
              </div>
              <Badge variant="outline">v{document.version}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Document Type:</span>
                <div className="font-medium capitalize">{document.document_type.replace(/_/g, ' ')}</div>
              </div>
              <div>
                <span className="text-gray-600">Version:</span>
                <div className="font-medium">v{document.version}</div>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <div className="font-medium">{document.is_active ? 'Active' : 'Inactive'}</div>
              </div>
              <div>
                <span className="text-gray-600">Created:</span>
                <div className="font-medium">{new Date(document.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Content */}
        <Card>
          <CardHeader>
            <CardTitle>Document Content</CardTitle>
            <CardDescription>
              This is how participants will see this legal document during onboarding
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div className="bg-white p-6 rounded-lg border-2 border-gray-200 min-h-[400px]">
                {renderContent(document.content)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Usage Information</CardTitle>
            <CardDescription>
              Information about how this document is used in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">Signature Type:</span>
                <span className="ml-2 font-medium font-mono bg-gray-100 px-2 py-1 rounded">{document.document_type}</span>
              </div>
              <div>
                <span className="text-gray-600">When shown:</span>
                <span className="ml-2">This document appears when participants reach the corresponding onboarding page</span>
              </div>
              <div>
                <span className="text-gray-600">Legal preservation:</span>
                <span className="ml-2">When participants sign, the exact content and version are stored permanently</span>
              </div>
              {!document.is_active && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <span className="text-amber-800 font-medium">⚠️ This version is inactive.</span>
                  <span className="ml-2 text-amber-700">Participants will see the active version instead.</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 