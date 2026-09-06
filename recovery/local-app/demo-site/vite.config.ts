import { defineConfig } from 'vite';
import { sites } from '@openai/sites-vite-plugin';
export default defineConfig({plugins:[sites()],publicDir:false,build:{ssr:'src/worker.ts',outDir:'dist',rollupOptions:{output:{entryFileNames:'server/index.js'}},minify:false},ssr:{noExternal:true}});
