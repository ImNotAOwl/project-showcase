/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    domains: [
      // GitHub et GitLab
      'raw.githubusercontent.com',
      'avatars.githubusercontent.com',
      'github.com',
      'gitlab.com',

      // Stockage cloud
      's3.amazonaws.com',
      'bucket.s3.amazonaws.com',
      'efp-data.s3.amazonaws.com', // ton cas concret
      'storage.googleapis.com',
      'firebasestorage.googleapis.com',

      // CDNs et proxies d’images
      'external-content.duckduckgo.com', // ton cas concret
      'images.unsplash.com',
      'res.cloudinary.com',
      'cdn.discordapp.com',
      'media.discordapp.net',
      'pbs.twimg.com',
      'i.imgur.com',

      // Autres potentiels (si tu intègres des images web externes)
      'placekitten.com',
      'picsum.photos',
      'lamusee.fr',
      'bs.matthieusiegel.fr',
      'docs.matthieusiegel.fr',
      'www.matthieusiegel.fr',
      'localhost',
    ],
  },
  output: 'standalone',
};

module.exports = nextConfig;
