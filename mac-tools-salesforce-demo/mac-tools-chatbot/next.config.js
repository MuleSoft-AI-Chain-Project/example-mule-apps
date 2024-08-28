/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  redirects: async () => {
    return [
      {
        source: "/github",
        destination: "https://github.com/amirkhan-ak-sf/langchain4mule",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
