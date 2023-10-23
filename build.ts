#!/usr/bin/env node

(async () => {
  await Bun.build({
    entrypoints: ['./src/index.tsx'],
    outdir: './lib',
    external: [
      "@noble/ciphers",
      "@noble/curves",
      "@noble/hashes",
      "@scure/base",
      "@scure/bip32",
      "@scure/bip39"
    ],
    minify: true,
    splitting: true,
})
})()