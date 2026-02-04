
"use client";

import { Certificate } from '@/types/certificate';
import { CertificateCard } from './CertificateCard';
import { useRouter } from 'next/navigation';

export const CertificateCardWrapper = ({ certificate }: { certificate: Certificate }) => {
    const router = useRouter();

    return (
        <CertificateCard
            certificate={certificate}
            onView={() => router.push(`/portal/certificates/${certificate.id}`)}
        />
    );
};
