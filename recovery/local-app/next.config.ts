import type { NextConfig } from 'next';
const config: NextConfig = {
  serverExternalPackages: ['@prisma/client'],
  poweredByHeader: false,
  outputFileTracingExcludes: { '*': ['.env*', '.noah/**/*', '.git/**/*', 'tests/**/*', 'prisma/*.db*'] },
};
export default config;
