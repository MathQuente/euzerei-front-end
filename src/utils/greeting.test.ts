import { describe, expect, it } from 'vitest'
import { periodGreeting, statusLine } from './greeting'

describe('periodGreeting', () => {
  it.each([
    [5, 'Bom dia'],
    [11, 'Bom dia'],
    [12, 'Boa tarde'],
    [17, 'Boa tarde'],
    [18, 'Boa noite'],
    [23, 'Boa noite'],
    [0, 'Boa noite'],
    [4, 'Boa noite'],
  ])("at %s o'clock it says %s", (hour, expected) => {
    expect(periodGreeting(hour)).toBe(expected)
  })
})

describe('statusLine', () => {
  it('mentions both when there is something playing and a queue', () => {
    expect(statusLine(2, 342)).toEqual({
      kind: 'both',
      playing: 2,
      backlog: 342,
    })
  })

  it('mentions only what is playing when the queue is empty', () => {
    expect(statusLine(1, 0)).toEqual({ kind: 'playing', playing: 1 })
  })

  it('suggests picking one from the queue when nothing is in progress', () => {
    expect(statusLine(0, 5)).toEqual({ kind: 'idle' })
  })

  it('says nothing when there is neither', () => {
    expect(statusLine(0, 0)).toBeNull()
  })
})
