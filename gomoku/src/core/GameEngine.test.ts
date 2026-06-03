import { describe, it, expect } from 'vitest'
import { createBoard, placeStone, isValidMove, checkFiveInARow, hasExactlyFive, getWinLine, cloneBoard, analyzeDirection } from './GameEngine'
import { checkForbidden } from './rules'
import { findBestMove } from './ai'

describe('GameEngine', () => {
  it('creates empty board', () => {
    const b = createBoard(15)
    expect(b.length).toBe(15)
    expect(b[0]!.length).toBe(15)
    expect(b[7]![7]).toBeNull()
  })

  it('places a stone', () => {
    const b = placeStone(createBoard(), 7, 7, 'black')
    expect(b[7][7]).toBe('black')
  })

  it('clones without mutation', () => {
    const o = createBoard()
    const c = cloneBoard(o)
    c[0][0] = 'black'
    expect(o[0][0]).toBeNull()
  })

  it('isValidMove rejects out of bounds', () => {
    expect(isValidMove(createBoard(), -1, 0)).toBe(false)
    expect(isValidMove(createBoard(), 0, 15)).toBe(false)
  })

  it('isValidMove rejects occupied cell', () => {
    const b = placeStone(createBoard(), 5, 5, 'black')
    expect(isValidMove(b, 5, 5)).toBe(false)
  })

  it('isValidMove accepts empty cell', () => {
    expect(isValidMove(createBoard(), 5, 5)).toBe(true)
  })
})

describe('checkFiveInARow / hasExactlyFive', () => {
  it('detects horizontal five', () => {
    const b = createBoard()
    for (let c = 3; c <= 7; c++) b[7][c] = 'black'
    expect(checkFiveInARow(b, 7, 5, 'black')).toBe(true)
    expect(hasExactlyFive(b, 7, 5, 'black')).toBe(true)
  })

  it('detects vertical five', () => {
    const b = createBoard()
    for (let r = 2; r <= 6; r++) b[r][4] = 'white'
    expect(checkFiveInARow(b, 4, 4, 'white')).toBe(true)
  })

  it('detects diagonal five', () => {
    const b = createBoard()
    for (let i = 0; i < 5; i++) b[i][i] = 'black'
    expect(checkFiveInARow(b, 2, 2, 'black')).toBe(true)
  })

  it('overline is five-in-a-row for white', () => {
    const b = createBoard()
    for (let c = 2; c <= 8; c++) b[7][c] = 'white'
    expect(checkFiveInARow(b, 7, 5, 'white')).toBe(true)
  })

  it('hasExactlyFive returns false for overline', () => {
    const b = createBoard()
    for (let c = 2; c <= 8; c++) b[7][c] = 'black'
    expect(hasExactlyFive(b, 7, 5, 'black')).toBe(false)
  })
})

describe('getWinLine', () => {
  it('returns winning positions', () => {
    const b = createBoard()
    for (let c = 3; c <= 7; c++) b[7][c] = 'black'
    const line = getWinLine(b, 7, 5, 'black')
    expect(line).not.toBeNull()
    expect(line!.length).toBe(5)
    expect(line![0]).toEqual([7, 3])
    expect(line![4]).toEqual([7, 7])
  })
})

describe('analyzeDirection', () => {
  it('counts consecutive stones', () => {
    const b = createBoard()
    b[7][3] = 'black'
    b[7][4] = 'black'
    b[7][6] = 'black'
    const a = analyzeDirection(b, 7, 4, 'black', 0, 1)
    // (7,5) is null, so only (7,4) itself and (7,3) are contiguous
    expect(a.total).toBe(2)
    expect(a.bothOpen).toBe(true)
  })
})

describe('rules - checkForbidden', () => {
  it('double-three is forbidden', () => {
    // Place at (7,5):
    // Horizontal: (7,3)=B, (7,4)=B, (7,5)=X → _BBB_ (3 in row, both open)  ✓
    // Vertical: (5,5)=B, (6,5)=B, (7,5)=X → _BBB_ (3 in row, both open)   ✓
    const b = createBoard()
    b[7][3] = 'black'
    b[7][4] = 'black'
    b[5][5] = 'black'
    b[6][5] = 'black'

    const result = checkForbidden(b, 7, 5)
    expect(result.forbidden).toBe(true)
    expect(result.reason).toContain('三三')
  })

  it('double-four is forbidden', () => {
    // Place at (7,7):
    // Horizontal: (7,4)=B, (7,5)=B, (7,6)=B, (7,7)=X → _BBBB_ (4 in row)  ✓
    // Vertical: (4,7)=B, (5,7)=B, (6,7)=B, (7,7)=X → _BBBB_ (4 in row)    ✓
    const b = createBoard()
    b[7][4] = 'black'
    b[7][5] = 'black'
    b[7][6] = 'black'
    b[4][7] = 'black'
    b[5][7] = 'black'
    b[6][7] = 'black'

    const result = checkForbidden(b, 7, 7)
    expect(result.forbidden).toBe(true)
    expect(result.reason).toContain('四四')
  })

  it('overline is forbidden for black', () => {
    // 6 in a row, place at (7,7):
    // (7,2)=B, (7,3)=B, (7,4)=B, (7,5)=B, (7,6)=B, (7,7)=X → 6 in a row
    const b = createBoard()
    for (let c = 2; c <= 6; c++) b[7][c] = 'black'

    const result = checkForbidden(b, 7, 7)
    expect(result.forbidden).toBe(true)
    expect(result.reason).toContain('长连')
  })

  it('exactly five takes precedence over forbidden', () => {
    // Place at (7,7): creates 5 in a row
    const b = createBoard()
    for (let c = 3; c <= 6; c++) b[7][c] = 'black'
    // Also creates 4 in vertical - would be double-four if five didn't take precedence
    b[4][7] = 'black'
    b[5][7] = 'black'
    b[6][7] = 'black'

    const result = checkForbidden(b, 7, 7)
    expect(result.forbidden).toBe(false)
  })
})

describe('findBestMove', () => {
  it('returns center on empty board', () => {
    const b = createBoard()
    const move = findBestMove(b, 'black', 'easy')
    expect(move).not.toBeNull()
    expect(move![0]).toBe(7)
    expect(move![1]).toBe(7)
  })

  it('blocks opponent four', () => {
    const b = createBoard()
    for (let c = 3; c <= 6; c++) b[7][c] = 'white'
    const move = findBestMove(b, 'black', 'easy')
    expect(move).not.toBeNull()
    // Should block at one of the ends
    expect(move).toEqual([7, 2])
  })

  it('takes winning move', () => {
    const b = createBoard()
    for (let c = 3; c <= 6; c++) b[7][c] = 'black'
    const move = findBestMove(b, 'black', 'easy')
    expect(move).not.toBeNull()
    expect(move).toEqual([7, 2])
  })
})
