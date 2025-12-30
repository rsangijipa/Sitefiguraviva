import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase URL or Service Role Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    console.log('🚀 Starting migration...');

    try {
        const migrationPath = path.resolve(__dirname, 'migration.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        // Split SQL by statement (simple split by ;)
        // Note: This is a basic split and might fail on complex PL/pgSQL, but works for simple DDL/DML
        // Since Supabase-js doesn't support raw SQL execution directly on the client without an RPC, 
        // we will use the user-defined function 'exec_sql' if it exists, or we warn the user.
        // However, the user doesn't have an RPC for this usually.
        // 
        // CHANGE OF PLAN: We will try to rely on the fact that the user might have dashboard access 
        // OR we can try to use the REST API if we had a table, but for DDL we generally need the dashboard SQL editor.
        //
        // BUT! Since I am an AI agent, I cannot access the Supabase Dashboard UI.
        //
        // ALTERNATIVE: I will create a temporary TypeScript file that uses the Postgres connection string 
        // IF the user provided it. But they typically provide the HTTP API URL.
        // 
        // WAIT. I don't have a way to execute raw SQL via the JS Client unless an RPC exists.
        // 
        // LET'S CHECK if we can do it via the 'pg' library if I had the connection string. I don't.
        //
        // OK, I will try to use the 'rpc' method assuming there MIGHT be a general purpose exec function,
        // OR I will simply instruct the user to run it. 
        // 
        // ACTUALLY, I can't leave the user hanging. 
        // 
        // Let's look at the available context. The user has given me `supabase_schema.sql` before.
        // This implies I can probably just output the SQL and ask them to run it, OR 
        // I can try to use the 'postgres' node module if the connection string is in the env.
        //
        // Let's check .env.local content again in my memory...
        // I saw `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`.
        // No `DATABASE_URL`.
        //
        // FINE: I will use a clever workaround.
        // I will try to insert into the tables. If they fail (table not found), I will log a clear message
        // "Please copy the content of scripts/migration.sql and run it in your Supabase SQL Editor".
        //
        // BUT WAIT! I can check if the tables exist via the API.

        console.log('📝 Checking if tables exist...');

        const { error: checkError } = await supabase.from('site_content').select('key').limit(1);

        if (checkError && checkError.code === '42P01') { // undefined_table
            console.error('\n❌ Tables missing! I cannot create tables via the JS Client.');
            console.error('👉 Please go to your Supabase Dashboard -> SQL Editor');
            console.error('👉 Run the contents of: scripts/migration.sql\n');
            process.exit(1);
        } else {
            console.log('✅ Tables appear to exist (or at least site_content does).');
        }

        // If tables exist, I can ensure the data is there
        console.log('Checking default data...');
        // ... logic to upsert default data via standard API calls ...

        const founderData = {
            key: 'founder',
            content: {
                name: 'Lilian Vanessa Nicacio Gusmão Vianei',
                role: 'Psicóloga e Gestalt-terapeuta',
                bio: 'Psicóloga, gestalt-terapeuta e pesquisadora, com trajetória que integra clínica, docência e estudos em trauma, psicoterapia corporal e neurodiversidades, além de perspectivas feministas e decoloniais.',
                image: '/assets/lilian.jpeg',
                link: 'http://lattes.cnpq.br/'
            }
        };

        const { error: upsertError } = await supabase
            .from('site_content')
            .upsert(founderData, { onConflict: 'key' });

        if (upsertError) console.error('Error upserting founder:', upsertError);
        else console.log('✅ Founder data verified.');

        const instituteData = {
            key: 'institute',
            content: {
                title: 'O Instituto Figura Viva',
                subtitle: 'Um espaço vivo de acolhimento clínico e formação profissional — onde o encontro transforma.',
                manifesto_title: 'Habitar a Fronteira',
                manifesto_text: 'Na Gestalt, a vida acontece no contato: na fronteira entre organismo e ambiente, entre o que sinto e o que digo, entre o que foi e o que pode nascer agora. No Figura Viva, a gente leva isso a sério — com rigor, com ética e com humanidade.',
                quote: 'O encontro é a fronteira onde a vida se renova.',
                address: 'Rua Pinheiro Machado, 2033 – Central, Porto Velho – RO • CEP 76801-057',
                phone: '(69) 99248-1585'
            }
        };

        const { error: upsertInstError } = await supabase
            .from('site_content')
            .upsert(instituteData, { onConflict: 'key' });

        if (upsertInstError) console.error('Error upserting institute:', upsertInstError);
        else console.log('✅ Institute data verified.');

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

runMigration();
