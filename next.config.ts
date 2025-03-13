/** @type {import('next').NextConfig} */
module.exports = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    domains: [
      "raw.githubusercontent.com",
      "images.unsplash.com",
      "airi-institute-hairfastgan.hf.space",
    ],
  },
};
