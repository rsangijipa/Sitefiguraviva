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
                    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
                ],
            },
        ];
    },
};

export default nextConfig;
