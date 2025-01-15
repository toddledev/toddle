const esbuild = require('esbuild')

// In order to serve page.main.js as an ES module, it's useful if we build it as part
// of the runtime package. This way, we can import it from other packages without having
// to worry about the build process.
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
