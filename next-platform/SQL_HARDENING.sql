-- 1. Create Storage Buckets for Hardening
-- We need: gallery (for gallery images), avatars (for team/founder profiles)
-- 'documents' and 'courses' already exist (or documents was created in Phase 2)

INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies for New Buckets

-- GALLERY
DROP POLICY IF EXISTS "Public Access Gallery" ON storage.objects;
CREATE POLICY "Public Access Gallery" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Auth Upload Gallery" ON storage.objects;
CREATE POLICY "Auth Upload Gallery" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth Update Gallery" ON storage.objects;
CREATE POLICY "Auth Update Gallery" ON storage.objects FOR UPDATE USING (bucket_id = 'gallery' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth Delete Gallery" ON storage.objects;
CREATE POLICY "Auth Delete Gallery" ON storage.objects FOR DELETE USING (bucket_id = 'gallery' AND auth.role() = 'authenticated');

-- AVATARS
DROP POLICY IF EXISTS "Public Access Avatars" ON storage.objects;
CREATE POLICY "Public Access Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Auth Upload Avatars" ON storage.objects;
CREATE POLICY "Auth Upload Avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth Update Avatars" ON storage.objects;
CREATE POLICY "Auth Update Avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth Delete Avatars" ON storage.objects;
CREATE POLICY "Auth Delete Avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- 3. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL, -- CREATE, UPDATE, DELETE
    resource TEXT NOT NULL, -- COURSE, POST, GALLERY, DOC, etc.
    resource_id TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on Audit Logs (Admins can read, System inserts)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin Read Logs" ON audit_logs;
CREATE POLICY "Admin Read Logs" ON audit_logs
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth Insert Logs" ON audit_logs;
CREATE POLICY "Auth Insert Logs" ON audit_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
