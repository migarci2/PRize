/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: (config) => {
		config.resolve.fallback = {
			...config.resolve.fallback,
			fs: false,
			path: false,
			crypto: false,
			stream: false,
			process: false,
			buffer: false,
		};
		return config;
	},
};

export default nextConfig;
