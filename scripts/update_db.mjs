import { createServiceClient } from "./_supabase-client.mjs";


const supabase = createServiceClient();

async function updateSchema() {
    console.log('🛠️ Adicionando coluna category e images à tabela courses...');
    const { error } = await supabase.rpc('admin_sql', { sql: "alter table courses add column if not exists category text; alter table courses add column if not exists images text[];" });

    // As rpc might not be enabled, I'll try to just catch success/fail info from direct insert first for testing.
    // However, I don't have direct SQL access via client unless the RPC is there.
    // I'll assume the user might need to run this in the dashboard if I cannot.
}

// Since I cannot run raw SQL easily without RPC, I'll modify fix_data.mjs to map category to tags or just skip it for now
// to get the data IN, and then suggest adding the column.
