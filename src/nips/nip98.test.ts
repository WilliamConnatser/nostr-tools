
import { describe, expect, test } from 'bun:test'
import { getToken, unpackEventFromToken, validateEvent, validateToken } from './nip98.ts'
import { Event, Kind, finishEvent } from '../event.ts'
import { generatePrivateKey, getPublicKey } from '../keys.ts'

const sk = generatePrivateKey()

describe('getToken', () => {
  test('getToken GET returns without authorization scheme', async () => {
    let result = await getToken('http://test.com', 'get', e => finishEvent(e, sk))

    const decodedResult: Event = await unpackEventFromToken(result)

    expect(decodedResult.created_at).toBeGreaterThan(0)
    expect(decodedResult.content).toBe('')
    expect(decodedResult.kind).toBe(Kind.HttpAuth)
    expect(decodedResult.pubkey).toBe(getPublicKey(sk))
    expect(decodedResult.tags).toStrictEqual([
      ['u', 'http://test.com'],
      ['method', 'get'],
    ])
  })

  test('getToken POST returns token without authorization scheme', async () => {
    let result = await getToken('http://test.com', 'post', e => finishEvent(e, sk))

    const decodedResult: Event = await unpackEventFromToken(result)

    expect(decodedResult.created_at).toBeGreaterThan(0)
    expect(decodedResult.content).toBe('')
    expect(decodedResult.kind).toBe(Kind.HttpAuth)
    expect(decodedResult.pubkey).toBe(getPublicKey(sk))
    expect(decodedResult.tags).toStrictEqual([
      ['u', 'http://test.com'],
      ['method', 'post'],
    ])
  })

  test('getToken GET returns token WITH authorization scheme', async () => {
    const authorizationScheme = 'Nostr '

    let result = await getToken('http://test.com', 'post', e => finishEvent(e, sk), true)

    expect(result.startsWith(authorizationScheme)).toBe(true)

    const decodedResult: Event = await unpackEventFromToken(result)

    expect(decodedResult.created_at).toBeGreaterThan(0)
    expect(decodedResult.content).toBe('')
    expect(decodedResult.kind).toBe(Kind.HttpAuth)
    expect(decodedResult.pubkey).toBe(getPublicKey(sk))
    expect(decodedResult.tags).toStrictEqual([
      ['u', 'http://test.com'],
      ['method', 'post'],
    ])
  })

  test('getToken missing loginUrl throws an error', async () => {
    // Todo: Test written funky due to: https://github.com/oven-sh/bun/issues/4909
    let errorOcurred = false
    try {
      await getToken('', 'get', e => finishEvent(e, sk))
    } catch(error) {
      errorOcurred = true
    }
    expect(errorOcurred).toBe(true)
  })

  test('getToken missing httpMethod throws an error', async () => {
    // Todo: Test written funky due to: https://github.com/oven-sh/bun/issues/4909
    let errorOcurred = false
    try {
      await getToken('http://test.com', '', e => finishEvent(e, sk))
    } catch(error) {
      errorOcurred = true
    }
    expect(errorOcurred).toBe(true)
  })
})

describe('validateToken', () => {
  test('validateToken returns true for valid token without authorization scheme', async () => {
    const validToken = await getToken('http://test.com', 'get', e => finishEvent(e, sk))

    const result = await validateToken(validToken, 'http://test.com', 'get')
    expect(result).toBe(true)
  })

  test('validateToken returns true for valid token with authorization scheme', async () => {
    const validToken = await getToken('http://test.com', 'get', e => finishEvent(e, sk), true)

    const result = await validateToken(validToken, 'http://test.com', 'get')
    expect(result).toBe(true)
  })

  test('validateToken throws an error for invalid token', async () => {
    // Todo: Test written funky due to: https://github.com/oven-sh/bun/issues/4909
    let errorOcurred = false
    try {
      await validateToken('fake', 'http://test.com', 'get')
    } catch(error) {
      errorOcurred = true
    }
    expect(errorOcurred).toBe(true)
  })

  test('validateToken throws an error for missing token', async () => {
    // Todo: Test written funky due to: https://github.com/oven-sh/bun/issues/4909
    let errorOcurred = false
    try {
      await validateToken('', 'http://test.com', 'get')
    } catch(error) {
      errorOcurred = true
    }
    expect(errorOcurred).toBe(true)
  })

  test('validateToken throws an error for a wrong url', async () => {
    const validToken = await getToken('http://test.com', 'get', e => finishEvent(e, sk))

    // Todo: Test written funky due to: https://github.com/oven-sh/bun/issues/4909
    let errorOcurred = false
    try {
      await validateToken(validToken, 'http://wrong-test.com', 'get')
    } catch(error) {
      errorOcurred = true
    }
    expect(errorOcurred).toBe(true)
  })

  test('validateToken throws an error for a wrong method', async () => {
    const validToken = await getToken('http://test.com', 'get', e => finishEvent(e, sk))

    // Todo: Test written funky due to: https://github.com/oven-sh/bun/issues/4909
    let errorOcurred = false
    try {
      await validateToken(validToken, 'http://test.com', 'post')
    } catch(error) {
      errorOcurred = true
    }
    expect(errorOcurred).toBe(true)
  })

  test('validateEvent returns true for valid decoded token with authorization scheme', async () => {
    const validToken = await getToken('http://test.com', 'get', e => finishEvent(e, sk), true)
    const decodedResult: Event = await unpackEventFromToken(validToken)

    const result = await validateEvent(decodedResult, 'http://test.com', 'get')
    expect(result).toBe(true)
  })

  test('validateEvent throws an error for a wrong url', async () => {
    const validToken = await getToken('http://test.com', 'get', e => finishEvent(e, sk), true)
    const decodedResult: Event = await unpackEventFromToken(validToken)

    // Todo: Test written funky due to: https://github.com/oven-sh/bun/issues/4909
    let errorOcurred = false
    try {
      await validateEvent(decodedResult, 'http://wrong-test.com', 'get')
    } catch(error) {
      errorOcurred = true
    }
    expect(errorOcurred).toBeTrue()
  })

  test('validateEvent throws an error for a wrong method', async () => {
    const validToken = await getToken('http://test.com', 'get', e => finishEvent(e, sk), true)
    const decodedResult: Event = await unpackEventFromToken(validToken)

    // Todo: Test written funky due to: https://github.com/oven-sh/bun/issues/4909
    let errorOcurred = false
    try {
      await validateEvent(decodedResult, 'http://test.com', 'post')
    } catch(error) {
      errorOcurred = true
    }
    expect(errorOcurred).toBeTrue()
  })
})
