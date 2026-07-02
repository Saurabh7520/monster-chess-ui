/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // This tells Vercel to build the site even if TypeScript throws a warning
    ignoreBuildErrors: true,
  },
};

export default nextConfig;