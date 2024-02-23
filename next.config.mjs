/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    config.externals.push("@node-rs/argon2", "@node-rs/bcrypt")
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return config
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}

export default nextConfig
