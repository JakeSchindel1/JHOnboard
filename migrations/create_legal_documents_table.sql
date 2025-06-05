-- Create table for legal document version control
CREATE TABLE IF NOT EXISTS legal_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_type VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    description TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Ensure only one active version per document type
    UNIQUE(document_type, version),
    -- Add constraint to ensure version numbers are positive
    CHECK (version > 0)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_legal_documents_type ON legal_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_legal_documents_active ON legal_documents(document_type, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_legal_documents_created_at ON legal_documents(created_at);

-- Enable Row Level Security
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view legal documents" ON legal_documents
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert legal documents" ON legal_documents
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);

CREATE POLICY "Users can update their own legal documents" ON legal_documents
    FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Create function to automatically set updated_at
CREATE OR REPLACE FUNCTION update_legal_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_legal_documents_updated_at
    BEFORE UPDATE ON legal_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_legal_documents_updated_at();

-- Create function to manage active versions (only one active per document type)
CREATE OR REPLACE FUNCTION manage_legal_document_active_status()
RETURNS TRIGGER AS $$
BEGIN
    -- If the new document is being set as active, deactivate all other versions of the same type
    IF NEW.is_active = true THEN
        UPDATE legal_documents 
        SET is_active = false 
        WHERE document_type = NEW.document_type 
        AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to manage active status
CREATE TRIGGER manage_legal_document_active_status
    AFTER INSERT OR UPDATE ON legal_documents
    FOR EACH ROW
    WHEN (NEW.is_active = true)
    EXECUTE FUNCTION manage_legal_document_active_status();

-- Update signatures table to store historical legal text
ALTER TABLE signatures ADD COLUMN IF NOT EXISTS legal_document_version INTEGER;
ALTER TABLE signatures ADD COLUMN IF NOT EXISTS legal_document_content TEXT;

-- Create index for signatures legal document lookup
CREATE INDEX IF NOT EXISTS idx_signatures_legal_document ON signatures(signature_type, legal_document_version);

-- Add comment to explain the table purpose
COMMENT ON TABLE legal_documents IS 'Stores versioned legal documents and agreements used in the onboarding process';
COMMENT ON COLUMN legal_documents.document_type IS 'The type/category of legal document (e.g., emergency_consent, critical_rules)';
COMMENT ON COLUMN legal_documents.version IS 'Version number of the document, auto-incremented for each document type';
COMMENT ON COLUMN legal_documents.is_active IS 'Whether this version is currently active (only one active version per document type)';
COMMENT ON COLUMN legal_documents.content IS 'The full legal text content in markdown format'; 