-- Create storage bucket for attorney photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'attorney-photos',
  'attorney-photos',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for attorney photos bucket
-- Policy: Allow authenticated users to upload their own photos
CREATE POLICY "Attorneys can upload their own photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'attorney-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow public read access to all photos
CREATE POLICY "Public can view attorney photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'attorney-photos');

-- Policy: Allow attorneys to update their own photos
CREATE POLICY "Attorneys can update their own photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'attorney-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow attorneys to delete their own photos
CREATE POLICY "Attorneys can delete their own photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'attorney-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
