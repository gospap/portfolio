/** @type {import('next').NextConfig} */
const nextConfig = {
  // three.js and its addons ship untranspiled ESM; Next handles that fine, but
  // being explicit keeps the Vercel build from falling back to the CJS copies.
  transpilePackages: ["three"],
};

export default nextConfig;
