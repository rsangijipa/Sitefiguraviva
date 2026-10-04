'use client';

import * as Sentry from "@sentry/nextjs";
import { telemetry } from '@/lib/telemetry';
import Error from "next/error";
import { useEffect } from "react";

export default function GlobalError({
    error,
}: {
    error: Error & { digest?: string };
}) {
    useEffect(() => {
        Sentry.captureException(error);
        telemetry.error(error);
    }, [error]);

    return (
        <html>
            <body>
                <Error statusCode={500} title="Algo deu errado. Nossa equipe foi notificada." />
            </body>
        </html>
    );
}
