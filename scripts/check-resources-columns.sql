-- Check if source_id and verification_status columns exist in resources table
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'resources'
ORDER BY ordinal_position;
