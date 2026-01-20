import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ponhrxfdfbzaronotelp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvbmhyeGZkZmJ6YXJvbm90ZWxwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzA0NDYxNSwiZXhwIjoyMDgyNjIwNjE1fQ.0Pwy1Usmtc2UFCgBo4j4jvxFNDtEy2HPTeXLNFvt4F8";

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateSchema() {
    console.log('🛠️ Adicionando coluna category e images à tabela courses...');
    const { error } = await supabase.rpc('admin_sql', { sql: "alter table courses add column if not exists category text; alter table courses add column if not exists images text[];" });

    // As rpc might not be enabled, I'll try to just catch success/fail info from direct insert first for testing.
    // However, I don't have direct SQL access via client unless the RPC is there.
    // I'll assume the user might need to run this in the dashboard if I cannot.
}

// Since I cannot run raw SQL easily without RPC, I'll modify fix_data.mjs to map category to tags or just skip it for now
// to get the data IN, and then suggest adding the column.
