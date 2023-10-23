import { expect, test } from 'bun:test'
import { validateGithub } from './nip39.ts'

test('validate github claim', async () => {
  let result = await validateGithub(
    'npub1gcxzte5zlkncx26j68ez60fzkvtkm9e0vrwdcvsjakxf9mu9qewqlfnj5z',
    'vitorpamplona',
    'cf19e2d1d7f8dac6348ad37b35ec8421',
  )
  expect(result).toBe(true)
})
