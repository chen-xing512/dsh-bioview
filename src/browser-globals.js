/**
 * Browser globals that the bundled CJS parsers expect.
 *
 * `seqparse`'s webpack build reads `Buffer` and (for accession lookups only)
 * `process.cwd()`. esbuild injects these identifiers into every module that
 * mentions them, so the parsers keep working in the Web page without a Node
 * runtime.
 */

import { Buffer as BufferPolyfill } from 'buffer'

export const Buffer = BufferPolyfill

export const process = {
  browser: true,
  env: {},
  argv: [],
  version: '',
  versions: {},
  platform: 'browser',
  cwd: () => '/',
  nextTick: (callback, ...args) => {
    Promise.resolve().then(() => callback(...args))
  },
}
