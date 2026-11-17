import { describe, expect, it } from 'vitest'
import {
  IMPORT_MESSAGE_BANDS,
  IMPORT_QUEUED_MESSAGES,
  getImportMessage,
  getSlowImportNotice,
  shuffled,
} from './importMessages'

describe('shuffled', () => {
  it('keeps every item and is stable for the same seed', () => {
    const items = ['a', 'b', 'c', 'd', 'e']
    expect([...shuffled(items, 5)].sort()).toEqual(items)
    expect(shuffled(items, 5)).toEqual(shuffled(items, 5))
  })

  it('does not change the original list', () => {
    const items = ['a', 'b', 'c']
    shuffled(items, 9)
    expect(items).toEqual(['a', 'b', 'c'])
  })
})

describe('getImportMessage', () => {
  it('has at least four messages in every band', () => {
    for (const band of IMPORT_MESSAGE_BANDS) {
      expect(band.messages.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('goes through every message of a band before repeating one', () => {
    const band = IMPORT_MESSAGE_BANDS[0]
    const seen = band.messages.map((_, step) =>
      getImportMessage(band.from, step * 6, 42)
    )
    expect(new Set(seen).size).toBe(band.messages.length)
  })

  it('uses the queue messages before there is progress', () => {
    expect(IMPORT_QUEUED_MESSAGES).toContain(getImportMessage(undefined, 0, 3))
  })

  it('picks the band by progress', () => {
    const last = IMPORT_MESSAGE_BANDS[IMPORT_MESSAGE_BANDS.length - 1]
    expect(last.messages).toContain(getImportMessage(99, 0, 1))
  })
})

describe('getSlowImportNotice', () => {
  it('stays quiet at first, then warns, then warns harder', () => {
    expect(getSlowImportNotice(10)).toBeNull()
    expect(getSlowImportNotice(30)).toEqual(expect.any(String))
    expect(getSlowImportNotice(120)).not.toBe(getSlowImportNotice(30))
  })
})
