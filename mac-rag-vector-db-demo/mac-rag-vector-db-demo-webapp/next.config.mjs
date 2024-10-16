/** @type {import('next').NextConfig} */
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unused-vars
import path from 'path';
const nextConfig = {
    webpack: (config) => {
        // Add custom rules for binary files and .node files
        config.module.rules.push(
            {
                test: /\.bin$/, // Adjust this regex if necessary for your binary files
                use: 'binary-base64-loader',
            },
            {
                test: /\.node$/,
                loader: 'node-loader',
            }
        );

        return config;
    },
};

export default nextConfig;