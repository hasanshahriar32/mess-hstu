-- Add a rating column to mess_groups table
ALTER TABLE mess_groups
ADD COLUMN rating INTEGER DEFAULT 0;
