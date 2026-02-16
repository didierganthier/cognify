-- Create storage buckets for Cognify
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for documents bucket
CREATE POLICY "Users can upload documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can view own documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete own documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

-- Storage policies for audio bucket
CREATE POLICY "Users can upload audio" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'audio' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can view own audio" ON storage.objects
FOR SELECT USING (
  bucket_id = 'audio' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Public can view audio" ON storage.objects
FOR SELECT USING (
  bucket_id = 'audio'
);
