import { redirect } from 'next/navigation';

export default function SignupPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
        if (typeof value === 'string') params.set(key, value);
    });
    params.set('mode', 'signup');

    redirect(`/auth?${params.toString()}`);
}

