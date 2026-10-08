CREATE POLICY "Authenticated users can read story images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'story-images');

CREATE POLICY "Authenticated users can upload story images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'story-images');

CREATE POLICY "Authenticated users can update story images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'story-images');