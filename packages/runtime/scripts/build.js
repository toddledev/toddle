const esbuild = require('esbuild')
const fs = require('fs')

esbuild.build({
  entryPoints: ['src/page.main.ts'],
  bundle: true,
  sourcemap: true,
  minify: true,
  write: true,
  outdir: 'dist',
  format: 'esm',
  entryNames: '[dir]/esm-[name]',
})
