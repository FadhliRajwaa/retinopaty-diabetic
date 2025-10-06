-- Create scan_results table to store AI scan results
CREATE TABLE scan_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  image_url TEXT,
  prediction TEXT NOT NULL CHECK (prediction IN ('DR', 'NO_DR')),
  confidence DECIMAL(5,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  analysis_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  doctor_suggestion TEXT,
  created_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_scan_results_patient_id ON scan_results(patient_id);
CREATE INDEX idx_scan_results_created_by ON scan_results(created_by);
CREATE INDEX idx_scan_results_created_at ON scan_results(created_at DESC);
CREATE INDEX idx_scan_results_prediction ON scan_results(prediction);

-- Enable Row Level Security
ALTER TABLE scan_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Admin can see all scan results
CREATE POLICY "Admins can view all scan results" ON scan_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Admin can insert scan results
CREATE POLICY "Admins can insert scan results" ON scan_results
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Admin can update scan results they created
CREATE POLICY "Admins can update their scan results" ON scan_results
  FOR UPDATE USING (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Patients can only see their own scan results
CREATE POLICY "Patients can view their own scan results" ON scan_results
  FOR SELECT USING (
    patient_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'patient'
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_scan_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_scan_results_updated_at
  BEFORE UPDATE ON scan_results
  FOR EACH ROW EXECUTE FUNCTION update_scan_results_updated_at();

-- Add comments for documentation
COMMENT ON TABLE scan_results IS 'Stores AI scan results for diabetic retinopathy detection';
COMMENT ON COLUMN scan_results.patient_id IS 'Reference to the patient being scanned';
COMMENT ON COLUMN scan_results.patient_name IS 'Patient name at time of scan for easier queries';
COMMENT ON COLUMN scan_results.image_url IS 'URL or path to the scan image';
COMMENT ON COLUMN scan_results.prediction IS 'AI prediction result: DR or NO_DR';
COMMENT ON COLUMN scan_results.confidence IS 'AI confidence percentage (0-100)';
COMMENT ON COLUMN scan_results.analysis_date IS 'When the analysis was performed';
COMMENT ON COLUMN scan_results.notes IS 'Additional notes from doctor';
COMMENT ON COLUMN scan_results.doctor_suggestion IS 'Doctor recommendation based on results';
COMMENT ON COLUMN scan_results.created_by IS 'Admin user who performed the scan';
