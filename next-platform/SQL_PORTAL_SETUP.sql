-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'geral', -- 'documents', 'portal', 'financeiro', etc.
    file_url TEXT NOT NULL,
    file_size TEXT, -- Ex: '2 MB'
    file_type TEXT, -- Ex: 'pdf', 'docx'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies
DROP POLICY IF EXISTS "Public Read Access Documents" ON documents;
CREATE POLICY "Public Read Access Documents" ON documents
    FOR SELECT USING (true); 

DROP POLICY IF EXISTS "Authenticated Insert Documents" ON documents;
CREATE POLICY "Authenticated Insert Documents" ON documents
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Update Documents" ON documents;
CREATE POLICY "Authenticated Update Documents" ON documents
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated Delete Documents" ON documents;
CREATE POLICY "Authenticated Delete Documents" ON documents
    FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Create Storage Bucket for Documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage Policies
DROP POLICY IF EXISTS "Public Access Documents" ON storage.objects;
CREATE POLICY "Public Access Documents" ON storage.objects
    FOR SELECT USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "Auth Upload Documents" ON storage.objects;
CREATE POLICY "Auth Upload Documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'documents' 
        AND auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Auth Update Documents" ON storage.objects;
CREATE POLICY "Auth Update Documents" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'documents' 
        AND auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Auth Delete Documents" ON storage.objects;
CREATE POLICY "Auth Delete Documents" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'documents' 
        AND auth.role() = 'authenticated'
    );
