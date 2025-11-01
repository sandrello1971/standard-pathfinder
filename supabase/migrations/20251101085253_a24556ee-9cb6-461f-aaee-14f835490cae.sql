-- Fix 1: Make user_id NOT NULL (ensure existing records have user_id first)
-- Note: This assumes all existing documents have a user_id. If any don't, they'll need manual assignment first.
ALTER TABLE public.documents ALTER COLUMN user_id SET NOT NULL;

-- Fix 2: Update RLS policy to restrict document visibility to owners only
DROP POLICY IF EXISTS "Users can view all documents" ON public.documents;

CREATE POLICY "Users can view own documents" 
ON public.documents 
FOR SELECT 
USING (auth.uid() = user_id);