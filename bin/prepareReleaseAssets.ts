// 'packages/runtime/src/custom-components/components.ts',
// 'packages/search/src/problems.worker.ts',
// 'packages/search/src/search.worker.ts',
// 'packages/runtime/src/page.main.ts',
// 'packages/runtime/src/editor-preview.main.ts',
// 'packages/runtime/src/custom-element.main.ts',
// 'packages/core/src/component/ToddleComponent.ts',
// 'packages/core/src/formula/ToddleFormula.ts',
// 'packages/core/src/api/api.ts',
// createTempFileFromValue('reset.css', RESET_STYLES),

import { RESET_STYLES } from '@toddledev/core/dist/styling/theme.const'
import { build, BuildOptions } from 'esbuild'
import { mkdirSync, rmSync, writeFileSync } from 'fs'

const bundleFiles = (
  files: BuildOptions['entryPoints'],
  settings?: BuildOptions,
) =>
  build({
    entryPoints: files,
    bundle: true,
    sourcemap: true,
    minify: true,
    write: true,
    outdir: 'dist',
    allowOverwrite: true,
    entryNames: `[name]${settings?.format === 'esm' ? '.esm' : ''}`,
    ...settings,
  })

const setup = () => {
  rmSync('dist/', { recursive: true, force: true })
  mkdirSync('dist/', { recursive: true })
}

const createTempFileFromValue = (filename, value) => {
  const path = `dist/${filename}`
  writeFileSync(path, value)
  return path
}

const run = async () => {
  const t1 = Date.now()

  setup()

  await bundleFiles([
    'packages/runtime/src/custom-components/components.ts',
    'packages/search/src/problems.worker.ts',
    'packages/search/src/search.worker.ts',
  ])

  await bundleFiles(
    [
      'packages/runtime/src/page.main.ts',
      'packages/runtime/src/editor-preview.main.ts',
      'packages/runtime/src/custom-element.main.ts',
      'packages/core/src/component/ToddleComponent.ts',
      'packages/core/src/formula/ToddleFormula.ts',
      'packages/core/src/api/api.ts',
    ],
    { format: 'esm' },
  )

  await bundleFiles([createTempFileFromValue('reset.css', RESET_STYLES)])

  return `Build finished in ${Date.now() - t1}ms`
}

run().then(console.log, console.error)
