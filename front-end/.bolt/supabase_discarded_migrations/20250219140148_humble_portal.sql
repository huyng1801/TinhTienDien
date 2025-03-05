-- Drop existing table
DROP TABLE IF EXISTS customer_calculations;

-- Create customer_calculations table with improved structure
CREATE TABLE customer_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id text NOT NULL,
  customer_name text NOT NULL,
  meter_count integer NOT NULL DEFAULT 1,
  devices jsonb NOT NULL,
  compensation_data jsonb NOT NULL,
  monthly_devices jsonb NOT NULL,
  created_by uuid REFERENCES users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- Add composite unique constraint
  UNIQUE (customer_id, created_by)
);

-- Create indexes for better performance
CREATE INDEX customer_calculations_customer_id_created_by_idx ON customer_calculations(customer_id, created_by);
CREATE INDEX customer_calculations_created_by_idx ON customer_calculations(created_by);
CREATE INDEX customer_calculations_updated_at_idx ON customer_calculations(updated_at DESC);

-- Enable RLS
ALTER TABLE customer_calculations ENABLE ROW LEVEL SECURITY;

-- Create policies with proper auth checks
CREATE POLICY "Enable read access for own calculations and admins"
  ON customer_calculations
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = created_by 
    OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND user_type = 'admin'
    )
  );

CREATE POLICY "Enable insert access for own calculations"
  ON customer_calculations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Enable update access for own calculations"
  ON customer_calculations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Enable delete access for own calculations"
  ON customer_calculations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);