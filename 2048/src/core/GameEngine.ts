import type { Direction, DifficultyConfig, TileMovement } from './types'
import { SPAWN_WEIGHT_TOTAL } from './config'

export function createEmptyBoard(size: number): number[][] {
  return Array.from({ length: size }, () => Array(size).fill(0))
}

export function getEmptyCells(grid: number[][]): { row: number; col: number }[] {
  const cells: { row: number; col: number }[] = []
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === 0) cells.push({ row: r, col: c })
    }
  }
  return cells
}

export function spawnTile(
  grid: number[][],
  rng: () => number,
  config: DifficultyConfig,
): number[][] {
  const empties = getEmptyCells(grid)
  if (empties.length === 0) return grid

  const newGrid = grid.map(row => [...row])
  const cell = empties[Math.floor(rng() * empties.length)]

  const roll = rng() * SPAWN_WEIGHT_TOTAL
  let cumulative = 0
  let value = 2
  for (const dist of config.spawnDistribution) {
    cumulative += dist.weight
    if (roll < cumulative) {
      value = dist.value
      break
    }
  }

  newGrid[cell.row][cell.col] = value
  return newGrid
}

export function slideRow(row: number[]): { row: number[]; scoreGain: number } {
  const filtered = row.filter(v => v !== 0)
  const out: number[] = []
  let scoreGain = 0

  let i = 0
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const merged = filtered[i] * 2
      out.push(merged)
      scoreGain += merged
      i += 2
    } else {
      out.push(filtered[i])
      i++
    }
  }

  while (out.length < row.length) out.push(0)
  return { row: out, scoreGain }
}

function moveInDirection(
  grid: number[][],
  direction: 'left' | 'right',
): { grid: number[][]; scoreGain: number; moved: boolean } {
  let totalScore = 0
  const newGrid = grid.map(row => {
    const r = direction === 'right' ? [...row].reverse() : [...row]
    const result = slideRow(r)
    totalScore += result.scoreGain
    return direction === 'right' ? [...result.row].reverse() : result.row
  })

  const moved = newGrid.some((row, r) =>
    row.some((val, c) => val !== grid[r][c]),
  )

  return { grid: newGrid, scoreGain: totalScore, moved }
}

function transpose(grid: number[][]): number[][] {
  return grid[0].map((_, c) => grid.map(row => row[c]))
}

export function move(
  grid: number[][],
  direction: Direction,
): { grid: number[][]; scoreGain: number; moved: boolean } {
  if (direction === 'left') return moveInDirection(grid, 'left')
  if (direction === 'right') return moveInDirection(grid, 'right')

  const t = transpose(grid)
  if (direction === 'up') {
    const result = moveInDirection(t, 'left')
    return { grid: transpose(result.grid), scoreGain: result.scoreGain, moved: result.moved }
  }
  const result = moveInDirection(t, 'right')
  return { grid: transpose(result.grid), scoreGain: result.scoreGain, moved: result.moved }
}

export function isGameOver(grid: number[][]): boolean {
  const size = grid.length
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === 0) return false
      if (c < size - 1 && grid[r][c] === grid[r][c + 1]) return false
      if (r < size - 1 && grid[r][c] === grid[r + 1][c]) return false
    }
  }
  return true
}

export function getMaxTile(grid: number[][]): number {
  return Math.max(...grid.flat())
}

export function eraseTile(
  grid: number[][],
  row: number,
  col: number,
): number[][] {
  const newGrid = grid.map(r => [...r])
  newGrid[row][col] = 0
  return newGrid
}

type IdGrid = (number | null)[][]

function createIdGrid(size: number): IdGrid {
  return Array.from({ length: size }, () => Array(size).fill(null))
}

export function slideRowWithIds(
  row: number[],
  ids: (number | null)[],
): { row: number[]; ids: (number | null)[]; scoreGain: number; movements: { fromIdx: number; toIdx: number; mergedWith?: number; newValue?: number }[] } {
  const nonEmpty: { value: number; id: number; origIdx: number }[] = []
  for (let i = 0; i < row.length; i++) {
    if (row[i] !== 0 && ids[i] !== null) {
      nonEmpty.push({ value: row[i], id: ids[i]!, origIdx: i })
    }
  }

  const outRow: number[] = []
  const outIds: (number | null)[] = []
  const movements: { fromIdx: number; toIdx: number; mergedWith?: number; newValue?: number }[] = []
  let scoreGain = 0

  let i = 0
  let outIdx = 0
  while (i < nonEmpty.length) {
    if (i + 1 < nonEmpty.length && nonEmpty[i].value === nonEmpty[i + 1].value) {
      const mergedValue = nonEmpty[i].value * 2
      outRow.push(mergedValue)
      outIds.push(nonEmpty[i].id)
      movements.push({ fromIdx: nonEmpty[i].origIdx, toIdx: outIdx, mergedWith: nonEmpty[i + 1].origIdx, newValue: mergedValue })
      movements.push({ fromIdx: nonEmpty[i + 1].origIdx, toIdx: outIdx, mergedWith: nonEmpty[i].origIdx })
      scoreGain += mergedValue
      i += 2
    } else {
      outRow.push(nonEmpty[i].value)
      outIds.push(nonEmpty[i].id)
      movements.push({ fromIdx: nonEmpty[i].origIdx, toIdx: outIdx })
      i++
    }
    outIdx++
  }

  while (outRow.length < row.length) {
    outRow.push(0)
    outIds.push(null)
  }

  return { row: outRow, ids: outIds, scoreGain, movements }
}

export function moveWithTracking(
  grid: number[][],
  idGrid: IdGrid,
  direction: Direction,
): { grid: number[][]; idGrid: IdGrid; scoreGain: number; moved: boolean; movements: TileMovement[] } {
  const size = grid.length
  const allMovements: TileMovement[] = []
  const resultGrid = createEmptyBoard(size)
  const resultIdGrid = createIdGrid(size)

  function processLines(lines: { values: number[]; ids: (number | null)[]; lineIndex: number }[], reverse: boolean, isVertical: boolean) {
    let totalScore = 0
    for (const line of lines) {
      const vals = reverse ? [...line.values].reverse() : line.values
      const ids = reverse ? [...line.ids].reverse() : line.ids
      const result = slideRowWithIds(vals, ids)
      totalScore += result.scoreGain

      const finalVals = reverse ? [...result.row].reverse() : result.row
      const finalIds = reverse ? [...result.ids].reverse() : result.ids

      for (let j = 0; j < size; j++) {
        const r = isVertical ? j : line.lineIndex
        const c = isVertical ? line.lineIndex : j
        resultGrid[r][c] = finalVals[j]
        resultIdGrid[r][c] = finalIds[j]
      }

      for (const m of result.movements) {
        const fromActual = reverse ? size - 1 - m.fromIdx : m.fromIdx
        const toActual = reverse ? size - 1 - m.toIdx : m.toIdx
        const fromRow = isVertical ? fromActual : line.lineIndex
        const fromCol = isVertical ? line.lineIndex : fromActual
        const toRow = isVertical ? toActual : line.lineIndex
        const toCol = isVertical ? line.lineIndex : toActual
        const tileId = (reverse ? [...line.ids].reverse() : line.ids)[m.fromIdx]!
        const movement: TileMovement = {
          id: tileId,
          fromRow,
          fromCol,
          toRow,
          toCol,
        }
        if (m.newValue) {
          movement.mergedInto = (reverse ? [...line.ids].reverse() : line.ids)[m.mergedWith!]!
          movement.newValue = m.newValue
        }
        allMovements.push(movement)
      }
    }
    return totalScore
  }

  let scoreGain: number

  if (direction === 'left') {
    const lines = []
    for (let r = 0; r < size; r++) {
      lines.push({ values: [...grid[r]], ids: [...idGrid[r]], lineIndex: r })
    }
    scoreGain = processLines(lines, false, false)
  } else if (direction === 'right') {
    const lines = []
    for (let r = 0; r < size; r++) {
      lines.push({ values: [...grid[r]], ids: [...idGrid[r]], lineIndex: r })
    }
    scoreGain = processLines(lines, true, false)
  } else if (direction === 'up') {
    const lines = []
    for (let c = 0; c < size; c++) {
      const values = grid.map(row => row[c])
      const ids = idGrid.map(row => row[c])
      lines.push({ values, ids, lineIndex: c })
    }
    scoreGain = processLines(lines, false, true)
  } else {
    const lines = []
    for (let c = 0; c < size; c++) {
      const values = grid.map(row => row[c])
      const ids = idGrid.map(row => row[c])
      lines.push({ values, ids, lineIndex: c })
    }
    scoreGain = processLines(lines, true, true)
  }

  const moved = resultGrid.some((row, r) =>
    row.some((val, c) => val !== grid[r][c]),
  )

  return { grid: resultGrid, idGrid: resultIdGrid, scoreGain, moved, movements: allMovements }
}

export function spawnTileWithId(
  grid: number[][],
  idGrid: IdGrid,
  rng: () => number,
  config: DifficultyConfig,
  nextId: number,
): { grid: number[][]; idGrid: IdGrid; newTileId: number; newTileRow: number; newTileCol: number } {
  const empties = getEmptyCells(grid)
  if (empties.length === 0) return { grid, idGrid, newTileId: nextId, newTileRow: -1, newTileCol: -1 }

  const newGrid = grid.map(row => [...row])
  const newIdGrid = idGrid.map(row => [...row])
  const cell = empties[Math.floor(rng() * empties.length)]

  const roll = rng() * SPAWN_WEIGHT_TOTAL
  let cumulative = 0
  let value = 2
  for (const dist of config.spawnDistribution) {
    cumulative += dist.weight
    if (roll < cumulative) {
      value = dist.value
      break
    }
  }

  newGrid[cell.row][cell.col] = value
  newIdGrid[cell.row][cell.col] = nextId
  return { grid: newGrid, idGrid: newIdGrid, newTileId: nextId, newTileRow: cell.row, newTileCol: cell.col }
}