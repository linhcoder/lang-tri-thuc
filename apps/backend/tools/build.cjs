require('esbuild').buildSync({entryPoints:['src/main.ts'],outfile:'dist/main.js',bundle:true,platform:'node',format:'esm',packages:'external',target:'node22',sourcemap:true});
