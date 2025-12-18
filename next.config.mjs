import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [{
        protocol: 'https',
        hostname: "lh3.googleusercontent.com"
      },
      {
        protocol: 'https',
        hostname: "cope-gules.vercel.app"
      },
      {
        protocol: 'https',
        hostname: "twobeats.de"
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      }
    ]
  },
  async redirects() {
    return [
      // No redirects needed - smart routing is handled in app/page.jsx
    ];
  },
  async rewrites() {
    return [{
      source: '/apple-wallet/:path*',
      destination: '/api/apple-wallet/:path*',
    }];
  },
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
          { key: "Access-Control-Max-Age", value: "86400" },
        ]
      }
    ]
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    
    // Fix for Radix UI with Next.js 15 - better approach
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    return config;
  },
  serverExternalPackages: ['@radix-ui/react-*'],
};

export default withNextIntl(nextConfig);