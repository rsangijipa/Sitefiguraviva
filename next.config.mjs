import { contentSecurityPolicy } from "./src/lib/security-policy.shared.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { withSentryConfig } from "@sentry/nextjs/config";
import { assertSupabaseBuildEnvironment } from "./src/infrastructure/supabase/environment.js";

// Stop before compilation can embed a misplaced privileged credential.
assertSupabaseBuildEnvironment(process.env);

/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  // Only check-ci sets this after both standalone validations pass.
  // Regular builds keep Next's lint and TypeScript checks enabled.
  eslint: { ignoreDuringBuilds: process.env.FIGURA_CI_VALIDATED === "1" },
  typescript: { ignoreBuildErrors: process.env.FIGURA_CI_VALIDATED === "1" },
  transpilePackages: [
    "htmlparser2",
    "domhandler",
    "domutils",
    "dom-serializer",
    "domelementtype",
    "entities",
  ],
  // Lets a throwaway build (audits, CSP checks) go somewhere other than
  // .next, so it cannot disturb a dev server running from the same folder.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  outputFileTracingRoot: projectRoot,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
  poweredByHeader: false,
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Content-Security-Policy",
        value: contentSecurityPolicy(null, !isProd),
      },
    ];

    if (isProd) {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains; preload",
      });
    }

    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/instituto/laura-pierce",
        destination: "/instituto/laura-perls",
        permanent: true,
      },
    ];
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
    // Most files import icons straight from "lucide-react" rather than the
    // curated barrel in src/components/icons, so without this the whole
    // icon set rides along. Same idea for the other barrel-heavy packages.
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "recharts",
      "@hello-pangea/dnd",
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
