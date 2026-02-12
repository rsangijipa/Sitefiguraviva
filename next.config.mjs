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
    },
};

import { withSentryConfig } from '@sentry/nextjs';
import withPWA from 'next-pwa';

// PWA Configuration
const pwaConfig = withPWA({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: true, // process.env.NODE_ENV === 'development', // Temporary disable due to Next.js 15 incompatibility with next-pwa 5.6.0
    runtimeCaching: [
        {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*$/,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'firestore-cache',
                expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
                },
            },
        },
        {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
                cacheName: 'images-cache',
                expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
                },
            },
        },
        {
            urlPattern: /\/_next\/(?:data|static)\/.*/i,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'next-assets',
                expiration: {
                    maxEntries: 32,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                },
            },
        },
        {
            urlPattern: /\/.*manifest\.json$/i,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'manifest-cache',
                expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 24 * 60 * 60, // 24 hours
                },
            },
        },
    ],
    buildExcludes: [
        /middleware-manifest.json$/,
        /_next\/app-build-manifest.json$/,
        /_next\/static\/.*\/_buildManifest.js$/,
        /_next\/static\/.*\/_ssgManifest.js$/,
        /app-build-manifest.json$/,
        /build-manifest.json$/,
        /react-loadable-manifest.json$/,
    ],
});

// Apply PWA first, then Sentry
const configWithPWA = pwaConfig(nextConfig);

export default withSentryConfig(configWithPWA, {
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
