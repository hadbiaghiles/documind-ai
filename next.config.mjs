const basePath = process.env.NEXT_PUBLIC_BASE_PATH || (process.env.GITHUB_ACTIONS ? "/documind-ai" : "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
