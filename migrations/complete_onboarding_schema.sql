-- ============================================================================
-- JOURNEY HOUSE ONBOARDING DATABASE SCHEMA
-- Complete schema for participant intake and onboarding process
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Participants (Main table)
CREATE TABLE IF NOT EXISTS participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    intake_date DATE,
    housing_location VARCHAR(200),
    date_of_birth DATE,
    social_security_number VARCHAR(11), -- Format: XXX-XX-XXXX
    sex VARCHAR(20),
    email VARCHAR(255),
    drivers_license_number VARCHAR(50),
    phone_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Health Status and Demographics
CREATE TABLE IF NOT EXISTS health_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    pregnant BOOLEAN DEFAULT false,
    developmentally_disabled BOOLEAN DEFAULT false,
    co_occurring_disorder BOOLEAN DEFAULT false,
    doc_supervision BOOLEAN DEFAULT false,
    felon BOOLEAN DEFAULT false,
    physically_handicapped BOOLEAN DEFAULT false,
    post_partum BOOLEAN DEFAULT false,
    primary_female_caregiver BOOLEAN DEFAULT false,
    recently_incarcerated BOOLEAN DEFAULT false,
    sex_offender BOOLEAN DEFAULT false,
    lgbtq BOOLEAN DEFAULT false,
    veteran BOOLEAN DEFAULT false,
    insulin_dependent BOOLEAN DEFAULT false,
    history_of_seizures BOOLEAN DEFAULT false,
    race VARCHAR(100),
    ethnicity VARCHAR(100),
    household_income VARCHAR(100),
    employment_status VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Vehicle Information
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    make VARCHAR(50),
    model VARCHAR(50),
    tag_number VARCHAR(20),
    insured BOOLEAN DEFAULT false,
    insurance_type VARCHAR(100),
    policy_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Emergency Contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    other_relationship VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Medical Information
CREATE TABLE IF NOT EXISTS medical_information (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    dual_diagnosis BOOLEAN DEFAULT false,
    mat BOOLEAN DEFAULT false, -- Medication Assisted Treatment
    mat_medication VARCHAR(100),
    mat_medication_other VARCHAR(200),
    need_psych_medication BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Current Medications
CREATE TABLE IF NOT EXISTS medications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    medication_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    prescribing_doctor VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Authorized People (for information sharing)
CREATE TABLE IF NOT EXISTS authorized_people (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Legal Status
CREATE TABLE IF NOT EXISTS legal_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    has_probation_pretrial BOOLEAN DEFAULT false,
    jurisdiction VARCHAR(100),
    other_jurisdiction VARCHAR(200),
    has_pending_charges BOOLEAN DEFAULT false,
    has_convictions BOOLEAN DEFAULT false,
    is_wanted BOOLEAN DEFAULT false,
    is_on_bond BOOLEAN DEFAULT false,
    bondsman_name VARCHAR(200),
    is_sex_offender BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Pending Charges
CREATE TABLE IF NOT EXISTS pending_charges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    charge_description TEXT NOT NULL,
    court_date DATE,
    jurisdiction VARCHAR(100),
    case_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Criminal Convictions
CREATE TABLE IF NOT EXISTS convictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    conviction_description TEXT NOT NULL,
    conviction_date DATE,
    jurisdiction VARCHAR(100),
    sentence VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Mental Health Assessment
CREATE TABLE IF NOT EXISTS mental_health (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    entries JSONB DEFAULT '[]', -- Array of mental health entries
    suicidal_ideation VARCHAR(20) DEFAULT 'no', -- yes/no/sometimes
    homicidal_ideation VARCHAR(20) DEFAULT 'no',
    hallucinations VARCHAR(20) DEFAULT 'no',
    depression_history BOOLEAN DEFAULT false,
    anxiety_history BOOLEAN DEFAULT false,
    bipolar_history BOOLEAN DEFAULT false,
    ptsd_history BOOLEAN DEFAULT false,
    other_conditions TEXT,
    current_therapy BOOLEAN DEFAULT false,
    therapy_provider VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Drug and Alcohol History
CREATE TABLE IF NOT EXISTS drug_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    drug_type VARCHAR(50) NOT NULL, -- alcohol, cocaine, heroin, etc.
    ever_used VARCHAR(20) DEFAULT 'no', -- yes/no
    date_last_use VARCHAR(50),
    frequency VARCHAR(50),
    intravenous VARCHAR(20) DEFAULT 'no',
    total_years VARCHAR(20),
    amount VARCHAR(100),
    drug_of_choice BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Insurance Information
CREATE TABLE IF NOT EXISTS insurances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    insurance_type VARCHAR(100), -- medicaid, medicare, private, etc.
    insurance_company VARCHAR(200),
    policy_number VARCHAR(100),
    group_number VARCHAR(100),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Recovery Residences History
CREATE TABLE IF NOT EXISTS recovery_residences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    residence_name VARCHAR(200) NOT NULL,
    location VARCHAR(200),
    start_date DATE,
    end_date DATE,
    reason_for_leaving TEXT,
    would_recommend BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Treatment History
CREATE TABLE IF NOT EXISTS treatment_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    facility_name VARCHAR(200) NOT NULL,
    treatment_type VARCHAR(100), -- inpatient, outpatient, intensive outpatient
    start_date DATE,
    end_date DATE,
    completed BOOLEAN DEFAULT false,
    location VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Incarceration History
CREATE TABLE IF NOT EXISTS incarceration_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    facility_name VARCHAR(200) NOT NULL,
    location VARCHAR(200),
    start_date DATE,
    end_date DATE,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Probation History
CREATE TABLE IF NOT EXISTS probation_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    probation_officer VARCHAR(200),
    jurisdiction VARCHAR(100),
    start_date DATE,
    end_date DATE,
    violation_history BOOLEAN DEFAULT false,
    violation_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Drug Test Results
CREATE TABLE IF NOT EXISTS drug_test_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    test_date DATE NOT NULL,
    test_type VARCHAR(50), -- urine, blood, hair, saliva
    substances_tested TEXT[], -- array of substances
    results JSONB, -- detailed results
    administered_by VARCHAR(200),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Legal Documents (for version control)
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
    
    UNIQUE(document_type, version),
    CHECK (version > 0)
);

-- Signatures (with historical legal text preservation)
CREATE TABLE IF NOT EXISTS signatures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    signature_type VARCHAR(100) NOT NULL,
    signature TEXT NOT NULL, -- The actual signature (name)
    signature_id VARCHAR(200) NOT NULL, -- Unique identifier for the signature
    signature_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    witness_signature TEXT,
    witness_timestamp TIMESTAMP WITH TIME ZONE,
    witness_signature_id VARCHAR(200),
    agreed BOOLEAN DEFAULT true,
    updates JSONB DEFAULT '{}', -- Any additional updates/modifications
    legal_document_version INTEGER, -- Reference to the legal document version
    legal_document_content TEXT, -- Snapshot of legal text at time of signing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Participants indexes
CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);
CREATE INDEX IF NOT EXISTS idx_participants_name ON participants(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_participants_created_at ON participants(created_at);

-- Foreign key indexes for all tables
CREATE INDEX IF NOT EXISTS idx_health_status_participant ON health_status(participant_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_participant ON vehicles(participant_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_participant ON emergency_contacts(participant_id);
CREATE INDEX IF NOT EXISTS idx_medical_information_participant ON medical_information(participant_id);
CREATE INDEX IF NOT EXISTS idx_medications_participant ON medications(participant_id);
CREATE INDEX IF NOT EXISTS idx_authorized_people_participant ON authorized_people(participant_id);
CREATE INDEX IF NOT EXISTS idx_legal_status_participant ON legal_status(participant_id);
CREATE INDEX IF NOT EXISTS idx_pending_charges_participant ON pending_charges(participant_id);
CREATE INDEX IF NOT EXISTS idx_convictions_participant ON convictions(participant_id);
CREATE INDEX IF NOT EXISTS idx_mental_health_participant ON mental_health(participant_id);
CREATE INDEX IF NOT EXISTS idx_drug_history_participant ON drug_history(participant_id);
CREATE INDEX IF NOT EXISTS idx_insurances_participant ON insurances(participant_id);
CREATE INDEX IF NOT EXISTS idx_recovery_residences_participant ON recovery_residences(participant_id);
CREATE INDEX IF NOT EXISTS idx_treatment_history_participant ON treatment_history(participant_id);
CREATE INDEX IF NOT EXISTS idx_incarceration_history_participant ON incarceration_history(participant_id);
CREATE INDEX IF NOT EXISTS idx_probation_history_participant ON probation_history(participant_id);
CREATE INDEX IF NOT EXISTS idx_drug_test_results_participant ON drug_test_results(participant_id);
CREATE INDEX IF NOT EXISTS idx_signatures_participant ON signatures(participant_id);

-- Signatures indexes
CREATE INDEX IF NOT EXISTS idx_signatures_type ON signatures(signature_type);
CREATE INDEX IF NOT EXISTS idx_signatures_timestamp ON signatures(signature_timestamp);

-- Legal documents indexes
CREATE INDEX IF NOT EXISTS idx_legal_documents_type ON legal_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_legal_documents_active ON legal_documents(document_type, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_legal_documents_created_at ON legal_documents(created_at);

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_participants_updated_at BEFORE UPDATE ON participants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_legal_documents_updated_at BEFORE UPDATE ON legal_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to manage legal document active status
CREATE OR REPLACE FUNCTION manage_legal_document_active_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_active = true THEN
        UPDATE legal_documents 
        SET is_active = false 
        WHERE document_type = NEW.document_type 
        AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER manage_legal_document_active_status
    AFTER INSERT OR UPDATE ON legal_documents
    FOR EACH ROW
    WHEN (NEW.is_active = true)
    EXECUTE FUNCTION manage_legal_document_active_status();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_information ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorized_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE convictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mental_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurances ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_residences ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE incarceration_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE probation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;

-- Policies for participants table
CREATE POLICY "Users can view all participants" ON participants
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert participants" ON participants
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);

CREATE POLICY "Users can update participants they created" ON participants
    FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Generic policies for all related tables (can be customized per table as needed)
-- Health Status
CREATE POLICY "Users can view health status" ON health_status
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert health status" ON health_status
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);
CREATE POLICY "Users can update health status" ON health_status
    FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Vehicles
CREATE POLICY "Users can view vehicles" ON vehicles
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert vehicles" ON vehicles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);
CREATE POLICY "Users can update vehicles" ON vehicles
    FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Emergency Contacts
CREATE POLICY "Users can view emergency contacts" ON emergency_contacts
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert emergency contacts" ON emergency_contacts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);
CREATE POLICY "Users can update emergency contacts" ON emergency_contacts
    FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Medical Information
CREATE POLICY "Users can view medical information" ON medical_information
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert medical information" ON medical_information
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);
CREATE POLICY "Users can update medical information" ON medical_information
    FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Medications
CREATE POLICY "Users can view medications" ON medications
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert medications" ON medications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);
CREATE POLICY "Users can update medications" ON medications
    FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Authorized People
CREATE POLICY "Users can view authorized people" ON authorized_people
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert authorized people" ON authorized_people
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);
CREATE POLICY "Users can update authorized people" ON authorized_people
    FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Legal Status
CREATE POLICY "Users can view legal status" ON legal_status
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert legal status" ON legal_status
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);
CREATE POLICY "Users can update legal status" ON legal_status
    FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Pending Charges
CREATE POLICY "Users can view pending charges" ON pending_charges
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert pending charges" ON pending_charges
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);
CREATE POLICY "Users can update pending charges" ON pending_charges
    FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Convictions
CREATE POLICY "Users can view convictions" ON convictions
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert convictions" ON convictions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);
CREATE POLICY "Users can update convictions" ON convictions
    FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Mental Health
CREATE POLICY "Users can view mental health" ON mental_health
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert mental health" ON mental_health
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);
CREATE POLICY "Users can update mental health" ON mental_health
    FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Drug History
CREATE POLICY "Users can view drug history" ON drug_history
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert drug history" ON drug_history
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);
CREATE POLICY "Users can update drug history" ON drug_history
    FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Insurances
CREATE POLICY "Users can view insurances" ON insurances
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert insurances" ON insurances
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);
CREATE POLICY "Users can update insurances" ON insurances
    FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Recovery Residences
CREATE POLICY "Users can view recovery residences" ON recovery_residences
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert recovery residences" ON recovery_residences
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);
CREATE POLICY "Users can update recovery residences" ON recovery_residences
    FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Treatment History
CREATE POLICY "Users can view treatment history" ON treatment_history
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert treatment history" ON treatment_history
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);
CREATE POLICY "Users can update treatment history" ON treatment_history
    FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Incarceration History
CREATE POLICY "Users can view incarceration history" ON incarceration_history
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert incarceration history" ON incarceration_history
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);
CREATE POLICY "Users can update incarceration history" ON incarceration_history
    FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Probation History
CREATE POLICY "Users can view probation history" ON probation_history
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert probation history" ON probation_history
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);
CREATE POLICY "Users can update probation history" ON probation_history
    FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Drug Test Results
CREATE POLICY "Users can view drug test results" ON drug_test_results
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert drug test results" ON drug_test_results
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);
CREATE POLICY "Users can update drug test results" ON drug_test_results
    FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Signatures
CREATE POLICY "Users can view signatures" ON signatures
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert signatures" ON signatures
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);
CREATE POLICY "Users can update signatures" ON signatures
    FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- Legal Documents (more open for viewing, restricted for editing)
CREATE POLICY "Users can view legal documents" ON legal_documents
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert legal documents" ON legal_documents
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = created_by);
CREATE POLICY "Users can update legal documents" ON legal_documents
    FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = created_by);

-- ============================================================================
-- HELPFUL VIEWS
-- ============================================================================

-- Complete participant view with basic information
CREATE OR REPLACE VIEW participant_summary AS
SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.email,
    p.phone_number,
    p.housing_location,
    p.intake_date,
    p.created_at,
    COUNT(s.id) as total_signatures,
    COUNT(CASE WHEN s.agreed = true THEN 1 END) as agreed_signatures
FROM participants p
LEFT JOIN signatures s ON p.id = s.participant_id
GROUP BY p.id, p.first_name, p.last_name, p.email, p.phone_number, p.housing_location, p.intake_date, p.created_at;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE participants IS 'Main table storing basic participant information';
COMMENT ON TABLE health_status IS 'Health status, demographics, and special conditions';
COMMENT ON TABLE vehicles IS 'Vehicle ownership and insurance information';
COMMENT ON TABLE emergency_contacts IS 'Emergency contact information';
COMMENT ON TABLE medical_information IS 'Medical treatment and medication information';
COMMENT ON TABLE medications IS 'Current medications list';
COMMENT ON TABLE authorized_people IS 'People authorized to receive participant information';
COMMENT ON TABLE legal_status IS 'Legal status including probation, charges, etc.';
COMMENT ON TABLE pending_charges IS 'Current pending legal charges';
COMMENT ON TABLE convictions IS 'Historical criminal convictions';
COMMENT ON TABLE mental_health IS 'Mental health assessment and history';
COMMENT ON TABLE drug_history IS 'Substance use history by drug type';
COMMENT ON TABLE insurances IS 'Insurance coverage information';
COMMENT ON TABLE recovery_residences IS 'Previous recovery residence history';
COMMENT ON TABLE treatment_history IS 'Previous treatment facility history';
COMMENT ON TABLE incarceration_history IS 'Incarceration history';
COMMENT ON TABLE probation_history IS 'Probation and supervision history';
COMMENT ON TABLE drug_test_results IS 'Drug test results and records';
COMMENT ON TABLE signatures IS 'Digital signatures with historical legal text preservation';
COMMENT ON TABLE legal_documents IS 'Versioned legal documents and agreements';

-- ============================================================================
-- INITIAL DATA (Optional)
-- ============================================================================

-- Insert common drug types for drug history tracking
-- This can be customized based on your specific needs 