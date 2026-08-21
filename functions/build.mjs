import esbuild from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const functionsRoot = path.dirname(fileURLToPath(import.meta.url));
process.chdir(functionsRoot);

await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  outfile: 'lib/index.js',
  sourcemap: true,
  // These are installed in the Cloud Functions runtime — keep them external.
  // @corporate-blabla/core is resolved via tsconfig paths and INLINED, which
  // sidesteps the monorepo "file:" dependency upload problem on deploy.
  external: ['firebase-admin', 'firebase-functions', '@anthropic-ai/sdk', 'openai'],
  tsconfig: 'tsconfig.json',
  logLevel: 'info',
});
