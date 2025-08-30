-- Add single/double room fields to mess_groups table
ALTER TABLE mess_groups
ADD COLUMN IF NOT EXISTS single_seats INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS single_price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS double_seats INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS double_price DECIMAL(10,2) DEFAULT 0;

-- Optional: backfill existing rows if needed
-- UPDATE mess_groups SET single_seats = capacity WHERE single_seats IS NULL;
-- UPDATE mess_groups SET single_price = price_per_month WHERE single_price IS NULL;
