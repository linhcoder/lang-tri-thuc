require('esbuild').buildSync({entryPoints:['src/main.ts','src/Store.ts'],outdir:'dist',bundle:true,platform:'node',format:'esm',packages:'external',target:'node22',sourcemap:true});
