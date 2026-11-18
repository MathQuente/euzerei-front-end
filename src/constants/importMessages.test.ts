import { describe, expect, it } from 'vitest'
import {
  IMPORT_STORES,
  getImportMessage,
  getSlowImportNotice,
  getStoreMessages,
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

describe.each(IMPORT_STORES)('messages of %s', store => {
  const { queued, bands, slow, verySlow } = getStoreMessages(store)

  it('has at least four messages in the queue and in every band', () => {
    expect(queued.length).toBeGreaterThanOrEqual(4)
    for (const band of bands) {
      expect(band.messages.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('goes through every message of a band before repeating one', () => {
    const band = bands[0]
    const seen = band.messages.map((_, step) =>
      getImportMessage(store, band.from, step * 6, 42)
    )
    expect(new Set(seen).size).toBe(band.messages.length)
  })

  it('uses the queue messages before there is progress', () => {
    expect(queued).toContain(getImportMessage(store, undefined, 0, 3))
  })

  it('picks the band by progress', () => {
    const last = bands[bands.length - 1]
    expect(last.messages).toContain(getImportMessage(store, 99, 0, 1))
    expect(bands[0].messages).toContain(getImportMessage(store, 5, 0, 1))
  })

  it('has no repeated message inside the same list', () => {
    for (const list of [
      queued,
      slow,
      verySlow,
      ...bands.map(b => b.messages),
    ]) {
      expect(new Set(list).size).toBe(list.length)
    }
  })

  it('stays quiet at first, then warns, then warns harder', () => {
    expect(getSlowImportNotice(store, 10)).toBeNull()
    expect(slow).toContain(getSlowImportNotice(store, 30))
    expect(verySlow).toContain(getSlowImportNotice(store, 120))
  })
})

describe('store flavour', () => {
  it('names the store in the slow notices', () => {
    expect(getStoreMessages('STEAM').slow.join(' ')).toContain('Steam')
    expect(getStoreMessages('PLAYSTATION').slow.join(' ')).toContain('PSN')
    expect(getStoreMessages('XBOX').slow.join(' ')).toContain('Xbox')
  })

  it('keeps cartridge and splines jokes out of every list', () => {
    for (const store of IMPORT_STORES) {
      const { queued, bands } = getStoreMessages(store)
      const all = [...queued, ...bands.flatMap(b => b.messages)].join(' ')
      expect(all).not.toMatch(/cartucho|splines/i)
    }
  })
})
