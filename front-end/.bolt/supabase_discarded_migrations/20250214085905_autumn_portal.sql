/*
  # Create device inventory and electricity price tables

  1. New Tables
    - `device_inventory`
      - `id` (uuid, primary key)
      - `name` (text) - Device name
      - `unit` (text) - Unit of measurement
      - `quantity` (integer) - Default quantity
      - `power` (numeric) - Power consumption in kW
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `electricity_prices`
      - `id` (uuid, primary key)
      - `level` (text) - Price level (e.g., 'Bậc 1')
      - `old_price` (numeric) - Price before 11/10/2024
      - `new_price` (numeric) - Price after 11/10/2024
      - `range_start` (integer) - Start of consumption range
      - `range_end` (integer) - End of consumption range
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create device inventory table
CREATE TABLE IF NOT EXISTS device_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  unit text NOT NULL DEFAULT 'Cái',
  quantity integer NOT NULL DEFAULT 1,
  power numeric(10, 3) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create electricity prices table
CREATE TABLE IF NOT EXISTS electricity_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL,
  old_price numeric NOT NULL,
  new_price numeric NOT NULL,
  range_start integer NOT NULL,
  range_end integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE device_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE electricity_prices ENABLE ROW LEVEL SECURITY;

-- Policies for device_inventory
CREATE POLICY "Enable read access for authenticated users"
  ON device_inventory
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON device_inventory
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
  ON device_inventory
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users"
  ON device_inventory
  FOR DELETE
  TO authenticated
  USING (true);

-- Policies for electricity_prices
CREATE POLICY "Enable read access for authenticated users"
  ON electricity_prices
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON electricity_prices
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
  ON electricity_prices
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users"
  ON electricity_prices
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert default electricity prices
INSERT INTO electricity_prices (level, old_price, new_price, range_start, range_end) VALUES
  ('Bậc 1', 1806, 1893, 0, 50),
  ('Bậc 2', 1866, 1956, 51, 100),
  ('Bậc 3', 2167, 2271, 101, 200),
  ('Bậc 4', 2729, 2860, 201, 300),
  ('Bậc 5', 3050, 3197, 301, 400),
  ('Bậc 6', 3151, 3302, 401, null);

-- Insert default devices
INSERT INTO device_inventory (name, power) VALUES
  ('Bóng đèn tròn', 0.040),
  ('Bóng đèn tuýp', 0.020),
  ('Nồi cơm điện', 0.500),
  ('Bếp từ', 2.000),
  ('Bình nóng lạnh', 2.500),
  ('Máy giặt', 0.150),
  ('Máy bơm nước', 0.750),
  ('Quạt cây', 0.065),
  ('Quạt trần', 0.065),
  ('Ti vi', 0.150),
  ('Tủ lạnh', 0.100),
  ('Điều hòa', 1.500);