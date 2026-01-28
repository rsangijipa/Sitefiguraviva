"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, UserPlus, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SignupPage() {
    const router = useRouter();

    // Redirect to login as registration is only allowed during enrollment
    useEffect(() => {
        router.replace('/login?mode=signup');
    }, [router]);

    return null; // Don't render anything while redirecting
}

