import { redirect } from 'next/navigation';

export default function LoginPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
        if (typeof value === 'string') params.set(key, value);
    });

    redirect(`/auth?${params.toString()}`);
}
