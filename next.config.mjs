import path from "node:path";
import { fileURLToPath } from "node:url";
import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
    // Lets a throwaway build (audits, CSP checks) go somewhere other than
    // .next, so it cannot disturb a dev server running from the same folder.
    distDir: process.env.NEXT_DIST_DIR || '.next',
    outputFileTracingRoot: projectRoot,
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '*.supabase.co' },
            { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
            { protocol: 'https', hostname: 'storage.googleapis.com' },
            { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
            { protocol: 'https', hostname: 'img.youtube.com' },
            { protocol: 'https', hostname: 'i.ytimg.com' },
        ],
    },
    poweredByHeader: false,
    async headers() {
        // 'unsafe-eval' is required by webpack/React Refresh in development.
        // Production is served from a compiled bundle and should not need it,
        // so it is dropped there rather than shipped to every visitor.
        const scriptSrc = [
            "'self'",
            ...(isProd ? [] : ["'unsafe-eval'"]),
            "'unsafe-inline'",
            'https://www.google-analytics.com',
            'https://www.googletagmanager.com',
            'https://www.gstatic.com',
            'https://*.behold.so',
            'https://w.behold.so',
        ].join(' ');

        const securityHeaders = [
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'X-Frame-Options', value: 'DENY' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            {
                key: 'Content-Security-Policy',
                value: [
                    "default-src 'self'",
                    `script-src ${scriptSrc}`,
                    "style-src 'self' 'unsafe-inline'",
                    "img-src 'self' data: https://*.supabase.co https://firebasestorage.googleapis.com https://storage.googleapis.com https://lh3.googleusercontent.com https://img.youtube.com https://i.ytimg.com https://*.behold.so",
                    "media-src 'self' blob: data: https://firebasestorage.googleapis.com https://storage.googleapis.com",
                    "font-src 'self' data:",
                    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.behold.so https://w.behold.so https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.google.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://*.googleapis.com https://firebasestorage.googleapis.com wss://*.firebaseio.com https://*.sentry.io",
                    "frame-src 'self' https://www.youtube.com https://*.behold.so https://*.supabase.co",
                ].join('; ') + ';',
            }
        ];

        if (isProd) {
            securityHeaders.push({
                key: 'Strict-Transport-Security',
                value: 'max-age=31536000; includeSubDomains; preload',
            });
        }

        return [
            {
                source: '/(.*)',
                headers: securityHeaders,
            },
        ];
    },
    async redirects() {
        return [
            {
                source: '/instituto/laura-pierce',
                destination: '/instituto/laura-perls',
                permanent: true,
            },
        ];
    },

    experimental: {
        serverActions: {
            bodySizeLimit: '5mb',
        },
        // Most files import icons straight from "lucide-react" rather than the
        // curated barrel in src/components/icons, so without this the whole
        // icon set rides along. Same idea for the other barrel-heavy packages.
        optimizePackageImports: [
            'lucide-react',
            'framer-motion',
            'recharts',
            '@hello-pangea/dnd',
        ],
    },
};

export default withSentryConfig(nextConfig, {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,

    // Sentry Options
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: "/monitoring",
    hideSourceMaps: true,
});
