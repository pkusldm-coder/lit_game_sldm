import { describe, it, expect } from 'vitest'
import {
  slideRow,
  slideRowWithIds,
  move,
  moveWithTracking,
  isGameOver,
  eraseTile,
  spawnTile,
  spawnTileWithId,
  createEmptyBoard,
  getEmptyCells,
  getMaxTile,
} from './GameEngine'
import { DIFFICULTY_CONFIG } from './config'

describe('slideRow', () => {
  it('basic merge: [2,2,0,0] -> [4,0,0,0] score 4', () => {
    const r = slideRow([2, 2, 0, 0])
    expect(r.row).toEqual([4, 0, 0, 0])
    expect(r.scoreGain).toBe(4)
  })

  it('merge across gap: [2,0,0,2] -> [4,0,0,0] score 4', () => {
    const r = slideRow([2, 0, 0, 2])
    expect(r.row).toEqual([4, 0, 0, 0])
    expect(r.scoreGain).toBe(4)
  })

  it('no chain merge: [2,2,2,0] -> [4,2,0,0] score 4', () => {
    const r = slideRow([2, 2, 2, 0])
    expect(r.row).toEqual([4, 2, 0, 0])
    expect(r.scoreGain).toBe(4)
  })

  it('two merges no chain: [2,2,2,2] -> [4,4,0,0] score 8', () => {
    const r = slideRow([2, 2, 2, 2])
    expect(r.row).toEqual([4, 4, 0, 0])
    expect(r.scoreGain).toBe(8)
  })

  it('no matches: [2,4,2,4] -> [2,4,2,4] score 0', () => {
    const r = slideRow([2, 4, 2, 4])
    expect(r.row).toEqual([2, 4, 2, 4])
    expect(r.scoreGain).toBe(0)
  })

  it('empty row: [0,0,0,0] -> [0,0,0,0] score 0', () => {
    const r = slideRow([0, 0, 0, 0])
    expect(r.row).toEqual([0, 0, 0, 0])
    expect(r.scoreGain).toBe(0)
  })

  it('complex merge: [8,8,16,16] -> [16,32,0,0] score 48', () => {
    const r = slideRow([8, 8, 16, 16])
    expect(r.row).toEqual([16, 32, 0, 0])
    expect(r.scoreGain).toBe(48)
  })

  it('single tile: [4,0,0,0] -> [4,0,0,0] score 0', () => {
    const r = slideRow([4, 0, 0, 0])
    expect(r.row).toEqual([4, 0, 0, 0])
    expect(r.scoreGain).toBe(0)
  })
})

describe('move', () => {
  const grid = [
    [0, 0, 0, 0],
    [2, 2, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]

  it('left: row 1 becomes [4,0,0,0]', () => {
    const result = move(grid, 'left')
    expect(result.grid[1]).toEqual([4, 0, 0, 0])
    expect(result.scoreGain).toBe(4)
    expect(result.moved).toBe(true)
  })

  it('right: row 1 becomes [0,0,0,4]', () => {
    const result = move(grid, 'right')
    expect(result.grid[1]).toEqual([0, 0, 0, 4])
    expect(result.scoreGain).toBe(4)
    expect(result.moved).toBe(true)
  })

  it('up: column merges correctly', () => {
    const g = [
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const result = move(g, 'up')
    expect(result.grid[0][0]).toBe(4)
    expect(result.scoreGain).toBe(4)
    expect(result.moved).toBe(true)
  })

  it('down: column merges correctly', () => {
    const g = [
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const result = move(g, 'down')
    expect(result.grid[3][0]).toBe(4)
    expect(result.scoreGain).toBe(4)
    expect(result.moved).toBe(true)
  })

  it('no movement returns moved=false', () => {
    const g = [
      [4, 8, 16, 32],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const result = move(g, 'left')
    expect(result.moved).toBe(false)
  })
})

describe('spawnTile', () => {
  function mockRng(values: number[]) {
    let i = 0
    return () => values[i++ % values.length]
  }

  it('spawns tile at position determined by RNG', () => {
    const board = createEmptyBoard(4)
    const rng = mockRng([0.5, 0.0])
    const config = DIFFICULTY_CONFIG.normal
    const result = spawnTile(board, rng, config)
    const nonZero = result.flat().filter(v => v !== 0)
    expect(nonZero.length).toBe(1)
    expect(nonZero[0]).toBe(2)
  })

  it('spawns value 4 when RNG roll >= 0.9', () => {
    const board = createEmptyBoard(4)
    const rng = mockRng([0.5, 0.95])
    const config = DIFFICULTY_CONFIG.normal
    const result = spawnTile(board, rng, config)
    const nonZero = result.flat().filter(v => v !== 0)
    expect(nonZero[0]).toBe(4)
  })

  it('full board returns unchanged', () => {
    const board = [
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 2048, 4096],
      [8192, 16384, 32768, 65536],
    ]
    const rng = mockRng([0])
    const result = spawnTile(board, rng, DIFFICULTY_CONFIG.normal)
    expect(result).toEqual(board)
  })

  it('hard mode spawns 8 at weight 10%', () => {
    const board = createEmptyBoard(4)
    const rng = mockRng([0.5, 0.97])
    const config = DIFFICULTY_CONFIG.hard
    const result = spawnTile(board, rng, config)
    const nonZero = result.flat().filter(v => v !== 0)
    expect(nonZero[0]).toBe(8)
  })
})

describe('isGameOver', () => {
  it('empty board is not game over', () => {
    expect(isGameOver(createEmptyBoard(4))).toBe(false)
  })

  it('board with empty cell is not game over', () => {
    const g = [
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 2048, 4096],
      [8192, 16384, 32768, 0],
    ]
    expect(isGameOver(g)).toBe(false)
  })

  it('full board with adjacent match is not game over', () => {
    const g = [
      [2, 2, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 2048, 4096],
      [8192, 16384, 32768, 65536],
    ]
    expect(isGameOver(g)).toBe(false)
  })

  it('full board with vertical match is not game over', () => {
    const g = [
      [2, 4, 8, 16],
      [2, 64, 128, 256],
      [512, 1024, 2048, 4096],
      [8192, 16384, 32768, 65536],
    ]
    expect(isGameOver(g)).toBe(false)
  })

  it('full board no matches is game over', () => {
    const g = [
      [2, 4, 8, 16],
      [32, 64, 128, 256],
      [512, 1024, 2048, 4096],
      [8192, 16384, 32768, 65536],
    ]
    expect(isGameOver(g)).toBe(true)
  })
})

describe('eraseTile', () => {
  it('erases tile with value', () => {
    const g = [
      [2, 4, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const result = eraseTile(g, 0, 1)
    expect(result[0][1]).toBe(0)
    expect(result[0][0]).toBe(2)
  })

  it('erasing empty cell stays 0', () => {
    const g = createEmptyBoard(4)
    const result = eraseTile(g, 0, 0)
    expect(result[0][0]).toBe(0)
  })
})

describe('createEmptyBoard', () => {
  it('creates 4x4 zero matrix', () => {
    const board = createEmptyBoard(4)
    expect(board.length).toBe(4)
    expect(board[0].length).toBe(4)
    expect(board.flat().every(v => v === 0)).toBe(true)
  })

  it('creates 6x6 zero matrix', () => {
    const board = createEmptyBoard(6)
    expect(board.length).toBe(6)
    expect(board[0].length).toBe(6)
    expect(board.flat().every(v => v === 0)).toBe(true)
  })
})

describe('getMaxTile', () => {
  it('returns max value on board', () => {
    const g = [
      [0, 2, 0, 0],
      [0, 0, 64, 0],
      [0, 8, 0, 0],
      [0, 0, 0, 0],
    ]
    expect(getMaxTile(g)).toBe(64)
  })

  it('empty board returns 0', () => {
    expect(getMaxTile(createEmptyBoard(4))).toBe(0)
  })
})

describe('getEmptyCells', () => {
  it('returns all cells for empty board', () => {
    const cells = getEmptyCells(createEmptyBoard(4))
    expect(cells.length).toBe(16)
  })

  it('returns only empty cells', () => {
    const g = [
      [2, 0, 0, 0],
      [0, 4, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const cells = getEmptyCells(g)
    expect(cells.length).toBe(14)
  })
})

describe('slideRowWithIds', () => {
  it('basic merge tracks IDs', () => {
    const result = slideRowWithIds([2, 2, 0, 0], [0, 1, null, null])
    expect(result.row).toEqual([4, 0, 0, 0])
    expect(result.ids).toEqual([0, null, null, null])
    expect(result.scoreGain).toBe(4)
    expect(result.movements.length).toBe(2)
  })

  it('no merge just moves', () => {
    const result = slideRowWithIds([2, 4, 0, 0], [0, 1, null, null])
    expect(result.row).toEqual([2, 4, 0, 0])
    expect(result.ids).toEqual([0, 1, null, null])
  })

  it('two merges track IDs', () => {
    const result = slideRowWithIds([2, 2, 4, 4], [0, 1, 2, 3])
    expect(result.row).toEqual([4, 8, 0, 0])
    expect(result.ids).toEqual([0, 2, null, null])
    expect(result.scoreGain).toBe(12)
  })
})

describe('moveWithTracking', () => {
  const grid = [
    [0, 0, 0, 0],
    [2, 2, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]
  const idGrid = [
    [null, null, null, null],
    [0, 1, null, null],
    [null, null, null, null],
    [null, null, null, null],
  ]

  it('left: merges and tracks movements', () => {
    const result = moveWithTracking(grid, idGrid, 'left')
    expect(result.grid[1]).toEqual([4, 0, 0, 0])
    expect(result.idGrid[1][0]).toBe(0)
    expect(result.moved).toBe(true)
    expect(result.movements.length).toBe(2)
  })

  it('right: merges and tracks movements', () => {
    const result = moveWithTracking(grid, idGrid, 'right')
    expect(result.grid[1]).toEqual([0, 0, 0, 4])
    expect(result.idGrid[1][3]).toBe(1)
    expect(result.movements.length).toBe(2)
  })

  it('no movement returns moved=false', () => {
    const g = [
      [4, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ]
    const ig = [
      [0, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ]
    const result = moveWithTracking(g, ig, 'left')
    expect(result.moved).toBe(false)
  })
})

describe('spawnTileWithId', () => {
  function mockRng(values: number[]) {
    let i = 0
    return () => values[i++ % values.length]
  }

  it('spawns tile with ID', () => {
    const board = createEmptyBoard(4)
    const idGrid = Array.from({ length: 4 }, () => Array(4).fill(null))
    const result = spawnTileWithId(board, idGrid, mockRng([0.5, 0.0]), DIFFICULTY_CONFIG.normal, 0)
    expect(result.newTileId).toBe(0)
    expect(result.newTileRow).toBeGreaterThanOrEqual(0)
    expect(result.newTileCol).toBeGreaterThanOrEqual(0)
    expect(result.idGrid[result.newTileRow][result.newTileCol]).toBe(0)
  })
})