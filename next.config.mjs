/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [{ protocol: 'https', hostname: '**' }],
    },
    poweredByHeader: false,
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                ],
            },
        ];
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '5mb',
        },
    },
    // Sentry Configuration (Corrected for modern SDK)
    sentry: {
        widenClientFileUpload: true,
        transpileClientSDK: true,
        tunnelRoute: "/monitoring",
        hideSourceMaps: true,
        // Modern tree-shaking options to replace deprecated disableLogger
        treeshake: {
            removeDebugLogging: true,
        },
    },
};

import { withSentryConfig } from '@sentry/nextjs';
import withPWA from 'next-pwa';

// PWA Configuration
const pwaConfig = withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    runtimeCaching: [],
    buildExcludes: [/middleware-manifest.json$/],
});

// Apply PWA first, then Sentry
const configWithPWA = pwaConfig(nextConfig);

export default withSentryConfig(configWithPWA, {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,

    // Note: widenClientFileUpload, transpileClientSDK, tunnelRoute, and hideSourceMaps 
    // have been moved to nextConfig.sentry to resolve deprecation warnings.
});
