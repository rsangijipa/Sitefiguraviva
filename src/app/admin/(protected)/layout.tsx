import { requireAdmin } from '@/lib/auth/server';
import AdminShell from './AdminShell';
import { headers } from 'next/headers'; // Used to force dynamic if needed, but cookies() implies dynamic.

export default async function AdminLayout({ children }: { children: React.ReactNode }) {

    // This call is the Gatekeeper. 
    // It redirects to /admin/login if no valid session or no admin claim.
    await requireAdmin();

    return (
        <AdminShell>
            {children}
        </AdminShell>
    );
}
