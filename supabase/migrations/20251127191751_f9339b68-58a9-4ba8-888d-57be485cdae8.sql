-- Add content column to documents table
ALTER TABLE public.documents
ADD COLUMN content TEXT;

-- Add index for better search performance
CREATE INDEX idx_documents_content ON public.documents USING gin(to_tsvector('italian', content));