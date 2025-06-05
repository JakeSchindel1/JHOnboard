"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/components/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Download, Eye, Calendar, User } from "lucide-react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Application {
  id: string;
  first_name: string;
  last_name: string;
  intake_date: string;
  housing_location: string;
  email: string;
  phone_number: string;
  created_at: string;
  status: 'completed' | 'in_progress';
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
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

  // Fetch applications from database
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('participants')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        // Transform data to match our interface
        const transformedApplications: Application[] = data?.map(participant => ({
          id: participant.id,
          first_name: participant.first_name,
          last_name: participant.last_name,
          intake_date: participant.intake_date,
          housing_location: participant.housing_location || 'Not specified',
          email: participant.email || 'Not provided',
          phone_number: participant.phone_number || 'Not provided',
          created_at: participant.created_at,
          status: 'completed' as const // All fetched applications are considered completed
        })) || [];

        setApplications(transformedApplications);
        setFilteredApplications(transformedApplications);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Failed to load applications');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchApplications();
    }
  }, [user, supabase]);

  // Filter applications based on search term
  useEffect(() => {
    const filtered = applications.filter(app =>
      app.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.housing_location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredApplications(filtered);
  }, [searchTerm, applications]);

  const handleViewApplication = (applicationId: string) => {
    router.push(`/admin/applications/${applicationId}`);
  };

  const handleDownloadPDF = async (applicationId: string, applicantName: string) => {
    try {
      // Call the PDF generation endpoint
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId: applicationId,
          documentType: 'intake_form'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${applicantName.replace(/\s+/g, '')}_Intake.pdf`;
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
    return null; // Will redirect in useEffect
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
              <h1 className="text-3xl font-bold text-gray-900">Applications Management</h1>
              <p className="text-gray-600 mt-1">View and manage submitted participant applications</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search applications..."
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
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.length}</div>
              <p className="text-xs text-muted-foreground">All time submissions</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {applications.filter(app => {
                  const appDate = new Date(app.created_at);
                  const now = new Date();
                  return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">New applications</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Badge variant="secondary" className="h-4 w-4 rounded-full p-0"></Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.filter(app => app.status === 'completed').length}</div>
              <p className="text-xs text-muted-foreground">Ready for review</p>
            </CardContent>
          </Card>
        </div>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>
              {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''} found
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
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No applications match your search.' : 'No applications found.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Housing Location</TableHead>
                      <TableHead>Intake Date</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell className="font-medium">
                          {application.first_name} {application.last_name}
                        </TableCell>
                        <TableCell>{application.email}</TableCell>
                        <TableCell>{application.housing_location}</TableCell>
                        <TableCell>
                          {application.intake_date ? new Date(application.intake_date).toLocaleDateString() : 'Not set'}
                        </TableCell>
                        <TableCell>
                          {new Date(application.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={application.status === 'completed' ? 'default' : 'secondary'}>
                            {application.status === 'completed' ? 'Completed' : 'In Progress'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewApplication(application.id)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadPDF(application.id, `${application.first_name}${application.last_name}`)}
                              className="flex items-center gap-1"
                            >
                              <Download className="h-3 w-3" />
                              PDF
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