/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  eslint: {
    // Allow production builds to successfully complete even if
    // there are ESLint errors. We still surface them during dev.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds to complete even if type errors are present.
    // This avoids blocking on test-only configs (e.g., jest.config.ts) during prod builds.
    ignoreBuildErrors: true,
  },
  // Optimize Fast Refresh
  experimental: {
    optimizePackageImports: ['@/components', '@/lib', '@/hooks'],
    // Reduce navigation throttling by optimizing route transitions
    scrollRestoration: true,
    // Enable modern bundling
    esmExternals: true,
    // Optimize server components
    serverComponentsExternalPackages: ['chart.js', 'react-chartjs-2'],
  },
  // Reduce bundle size and improve performance
  swcMinify: true,
  webpack: (config, { isServer, webpack }) => {
    // Fixes npm packages that depend on Node.js modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        net: false,
        tls: false,
        child_process: false,
        buffer: false,
      };
    }

    // Disable filesystem cache to prevent Windows path resolution warnings
    config.cache = false;

    // Additional webpack optimizations for Windows
    config.resolve.symlinks = false;
    config.watchOptions = {
      ...config.watchOptions,
      ignored: /node_modules/,
      // Reduce polling frequency to prevent excessive rebuilds
      poll: 1000,
      aggregateTimeout: 300,
    };

    // Fix chunk loading issues
    config.output = {
      ...config.output,
      chunkFilename: isServer ? '[name].js' : 'static/chunks/[name].[contenthash].js',
      filename: isServer ? '[name].js' : 'static/js/[name].[contenthash].js',
    };

    // Ensure proper chunk loading
    config.optimization = {
      ...config.optimization,
      runtimeChunk: {
        name: 'runtime',
      },
    };
    
    // Optimize module resolution
    config.resolve.modules = ['node_modules', 'src'];
    
    // Optimize bundle splitting for better loading
    config.optimization.splitChunks = {
      chunks: 'all',
      maxInitialRequests: 30,
      minSize: 20000,
      maxSize: 250000,
      cacheGroups: {
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: -10,
          chunks: 'all',
          enforce: true,
        },
        // Separate chunk for React and Next.js
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
          name: 'react',
          priority: 20,
          chunks: 'all',
          enforce: true,
        },
        // UI libraries chunk
        ui: {
          test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|class-variance-authority|clsx|tailwind-merge)[\\/]/,
          name: 'ui',
          priority: 15,
          chunks: 'all',
          enforce: true,
        },
        // Chart libraries chunk
        charts: {
          test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2|recharts)[\\/]/,
          name: 'charts',
          priority: 10,
          chunks: 'all',
          enforce: true,
        },
      },
    };

    return config;
  },
  // No experimental config needed here
};

module.exports = nextConfig;
