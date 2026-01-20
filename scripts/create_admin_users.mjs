
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
try {
    const envConfig = dotenv.parse(fs.readFileSync(path.resolve(__dirname, '../.env.local')));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
} catch (e) {
    console.warn("⚠️ Could not load .env.local");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceKey) {
    console.error(`❌ Missing Supabase credentials. URL: ${!!supabaseUrl}, Key: ${!!serviceKey}`);
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

const USERS = [
    { email: 'richardsangi@figuraviva.com', password: 'adminfiguraviva2025', role: 'admin' },
    { email: 'liliangusmao@figuraviva.com', password: 'adminfiguraviva2025', role: 'admin' }
];

async function manageUsers() {
    console.log("🚀 Starting Admin User Creation...");

    for (const user of USERS) {
        console.log(`\nChecking user: ${user.email}...`);

        // Check if user exists (by email is hard without admin list, but we can try to create and catch error, or listUsers if allowed)
        // clean way: try to create user.

        // 1. Check if user already exists
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

        let existingUser = users?.find(u => u.email === user.email);

        if (existingUser) {
            console.log(`ℹ️ User ${user.email} already exists (ID: ${existingUser.id}). Updating password and metadata...`);
            const { error: updateError } = await supabase.auth.admin.updateUserById(
                existingUser.id,
                {
                    password: user.password,
                    user_metadata: { role: user.role },
                    app_metadata: { role: user.role, roles: [user.role] } // Setting app metadata often requires admin rights
                }
            );

            if (updateError) console.error(`❌ Failed to update user ${user.email}:`, updateError.message);
            else console.log(`✅ User ${user.email} updated successfully!`);

        } else {
            console.log(`🆕 Creating new user ${user.email}...`);
            const { data, error: createError } = await supabase.auth.admin.createUser({
                email: user.email,
                password: user.password,
                email_confirm: true,
                user_metadata: { role: user.role },
                app_metadata: { role: user.role, roles: [user.role] }
            });

            if (createError) console.error(`❌ Failed to create user ${user.email}:`, createError.message);
            else console.log(`✅ User ${user.email} created successfully! (ID: ${data.user.id})`);
        }
    }
}

manageUsers();
