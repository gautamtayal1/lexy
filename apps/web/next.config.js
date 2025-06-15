/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disables React.StrictMode on the client to avoid double-invocation of
  // lifecycle logic during development. Remove or set to `true` if you want
  // Strict Mode back.
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lxy.blr1.digitaloceanspaces.com',
        port: '',
        pathname: '/generated-images/**',
      },
      {
        protocol: 'https',
        hostname: 'lxy.blr1.digitaloceanspaces.com',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'lxy.blr1.cdn.digitaloceanspaces.com',
        port: '',
        pathname: '/generated-images/**',
      },
      {
        protocol: 'https',
        hostname: 'lxy.blr1.cdn.digitaloceanspaces.com',
        port: '',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
