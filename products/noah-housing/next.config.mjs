/** @type {import('next').NextConfig} */
const config = {
  // Separate the Housing compilation root from the parent NOAH ARK project.
  turbopack: { root: process.cwd() },
};
export default config;
