-- Create customer_calculations table
CREATE TABLE customer_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  meter_count integer NOT NULL DEFAULT 1,
  devices jsonb NOT NULL,
  compensation_data jsonb NOT NULL,
  monthly_devices jsonb NOT NULL,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for customer_id lookups
CREATE INDEX customer_calculations_customer_id_idx ON customer_calculations(customer_id);

-- Enable RLS
ALTER TABLE customer_calculations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own calculations"
  ON customer_calculations
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can create calculations"
  ON customer_calculations
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own calculations"
  ON customer_calculations
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete their own calculations"
  ON customer_calculations
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());