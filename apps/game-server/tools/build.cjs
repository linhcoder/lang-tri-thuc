require('esbuild').buildSync({entryPoints:['src/main.ts'],outfile:'dist/game-server/src/main.js',bundle:true,platform:'node',format:'esm',packages:'external',target:'node22',sourcemap:true});
