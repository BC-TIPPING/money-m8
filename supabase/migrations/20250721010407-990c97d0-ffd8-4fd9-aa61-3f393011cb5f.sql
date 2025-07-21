
-- Add new fields to the assessments table for Full Financial Health Check
ALTER TABLE public.assessments
ADD COLUMN postcode text,
ADD COLUMN age integer,
ADD COLUMN super_balance numeric,
ADD COLUMN super_fund text,
ADD COLUMN mortgage_rate numeric,
ADD COLUMN insurances jsonb,
ADD COLUMN assets jsonb;
