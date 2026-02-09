import { redirect } from 'next/navigation';

export default async function SignupPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const searchParams = await props.searchParams;
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
        if (typeof value === 'string') params.set(key, value);
    });
    params.set('mode', 'signup');

    redirect(`/auth?${params.toString()}`);
}

