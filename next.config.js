/**
 * O Manna é exportado como site estático (GitHub Pages).
 * Em produção no Pages o site fica em /<repo>, então o basePath
 * vem da variável NEXT_PUBLIC_BASE_PATH (definida no workflow de deploy).
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
}

module.exports = nextConfig
