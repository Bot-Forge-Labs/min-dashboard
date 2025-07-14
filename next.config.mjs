/** @type {import('next').NextConfig} */
const nextConfig = {

  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['nqbdotjtceuyftutjvsl.supabase.co'],
    unoptimized: true,
  },
}

export default nextConfig
