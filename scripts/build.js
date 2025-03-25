import { context } from 'esbuild';
import path from 'path';
import process from 'process';
import { exists, generateManifest, getUtf8 } from './utils.js';

const watch = process.argv.includes('--watch');
const manifest = await exists('./fxmanifest.lua');

async function build(development) {
  const ctx = await context({
    entryPoints: ['./src/client/index.ts', './src/server/index.ts'],
    outdir: './dist',
    platform: 'node',
    target: 'node22',
    bundle: true,
    minify: false,
    plugins: [
      {
        name: 'build',
        setup(build) {
          build.onLoad({ filter: /.\.(js|ts)$/ }, async (args) => {
            const data = await getUtf8(args.path);
            const escape = (p) => (/^win/.test(process.platform) ? p.replace(/\\/g, '/') : p);

            const global = /__(?=(filename|dirname))/g;
            const cache = global.test(data);

            const location = cache
              ? `const location = { filename: '${escape(args.path)}', dirname: '${escape(path.dirname(args.path))}' }; let __line = 0;\n`
              : '';

            const insert = data
              .split('\n')
              .map((line, index) => {
                return `${line.includes('__line') ? `__line=${index + 1};` : ''}${line}`;
              })
              .join('\n');

            return {
              contents: cache ? location + insert.replace(global, 'location.') : insert,
              loader: path.extname(args.path).slice(1),
            };
          });

          build.onEnd(async (result) => {
            if (result.errors.length > 0) {
              console.error(`Build ended with ${result.errors.length} error(s):`);
              result.errors.forEach((error, i) => {
                console.error(`Error ${i + 1}: ${error.text}`);
              });
              return;
            }

            console.log(development ? 'Successfully built (development)' : 'Successfully built (production)');

            if (!development) {
              if (!manifest) {
                await generateManifest({
                  client: ['dist/client/*.js'],
                  server: ['dist/server/*.js'],
                  files: ['locales/*.json'],
                  dependencies: ['/server:12913', '/onesync', 'ox_lib', 'ox_core', 'ox_inventory'],
                  metadata: { node_version: '22' },
                });
              }
              process.exit(0);
            }
          });
        },
      },
    ],
  });

  if (development && !manifest) {
    console.log('fxmanifest.lua not found, run `pnpm build` to generate it.');
    process.exit(1);
  }

  if (development) {
    await ctx.watch();
    console.log('Watching for changes...');
  } else {
    await ctx.rebuild();
  }
}

watch ? build(true) : build(false);
