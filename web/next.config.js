/** @type {import('next').NextConfig} */
const nextConfig = {
   reactStrictMode: false,
   output: `standalone`,
   images: {
      remotePatterns:[
         {
            hostname: `lh3.googleusercontent.com`
         },
         {
            hostname: `avatars.githubusercontent.com`
         }
      ]
   }
}

module.exports = nextConfig
