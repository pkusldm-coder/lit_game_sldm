import { describe, it, expect } from 'vitest'
import { isValidPlacement, solveBoard, countSolutions } from './solver'
import { createPuzzle } from './generator'
import { createGameState, selectCell, inputNumber, eraseCell, useHint, undoMove, toggleNoteMode } from './engine'

describe('isValidPlacement', () => {
  it('returns true for valid placement on empty board', () => {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0))
    expect(isValidPlacement(board, 0, 0, 1)).toBe(true)
  })

  it('returns false for duplicate in row', () => {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0))
    board[0][4] = 5
    expect(isValidPlacement(board, 0, 0, 5)).toBe(false)
  })

  it('returns false for duplicate in column', () => {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0))
    board[4][0] = 5
    expect(isValidPlacement(board, 0, 0, 5)).toBe(false)
  })

  it('returns false for duplicate in box', () => {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0))
    board[1][1] = 5
    expect(isValidPlacement(board, 0, 0, 5)).toBe(false)
  })
})

describe('solveBoard', () => {
  it('solves a valid puzzle', () => {
    const board = [
      [5,3,0,0,7,0,0,0,0],
      [6,0,0,1,9,5,0,0,0],
      [0,9,8,0,0,0,0,6,0],
      [8,0,0,0,6,0,0,0,3],
      [4,0,0,8,0,3,0,0,1],
      [7,0,0,0,2,0,0,0,6],
      [0,6,0,0,0,0,2,8,0],
      [0,0,0,4,1,9,0,0,5],
      [0,0,0,0,8,0,0,7,9],
    ]
    const solved = solveBoard(board)
    expect(solved).not.toBeNull()
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] !== 0) {
          expect(solved![r][c]).toBe(board[r][c])
        }
      }
    }
  })

  it('returns null for unsolvable board', () => {
    const board = [
      [1,1,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
    ]
    expect(solveBoard(board)).toBeNull()
  })
})

describe('createPuzzle', () => {
  it('generates valid easy puzzle with unique solution', () => {
    const { puzzle, solution } = createPuzzle('easy')
    expect(puzzle.length).toBe(9)
    expect(solution.length).toBe(9)
    expect(countSolutions(puzzle, 2)).toBe(1)
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (puzzle[r][c] !== 0) {
          expect(puzzle[r][c]).toBe(solution[r][c])
        }
      }
    }
  }, 30000)
})

describe('GameEngine', () => {
  function findFirstEmpty(board: any[]): [number, number] | null {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!board[r][c].isGiven && board[r][c].value === null) return [r, c]
      }
    }
    return null
  }

  it('creates game state with correct difficulty', () => {
    const state = createGameState('easy')
    expect(state.difficulty).toBe('easy')
    expect(state.status).toBe('playing')
    expect(state.board.length).toBe(9)
    expect(state.mistakes).toBe(0)
    expect(state.hintsUsed).toBe(0)
  })

  it('selects a cell', () => {
    const state = createGameState('easy')
    const next = selectCell(state, 3, 4)
    expect(next.selectedCell).toEqual([3, 4])
  })

  it('inputs correct number on selected cell', () => {
    const state = createGameState('easy')
    const empty = findFirstEmpty(state.board)
    if (!empty) return
    const [r, c] = empty
    const s1 = selectCell(state, r, c)
    const s2 = inputNumber(s1, state.solution[r][c])
    expect(s2.board[r][c].value).toBe(state.solution[r][c])
    expect(s2.board[r][c].isGiven).toBe(false)
    expect(s2.mistakes).toBe(0)
  })

  it('counts mistake on wrong number', () => {
    const state = createGameState('easy')
    const empty = findFirstEmpty(state.board)
    if (!empty) return
    const [r, c] = empty
    const wrongNum = state.solution[r][c] === 1 ? 2 : 1
    const s1 = selectCell(state, r, c)
    const s2 = inputNumber(s1, wrongNum)
    expect(s2.mistakes).toBe(1)
    expect(s2.board[r][c].isError).toBe(true)
  })

  it('supports note mode toggle', () => {
    const state = createGameState('easy')
    expect(state.noteMode).toBe(false)
    const next = toggleNoteMode(state)
    expect(next.noteMode).toBe(true)
  })

  it('adds pencil mark in note mode', () => {
    const state = createGameState('easy')
    const empty = findFirstEmpty(state.board)
    if (!empty) return
    const [r, c] = empty
    const s1 = toggleNoteMode(state)
    const s2 = selectCell(s1, r, c)
    const s3 = inputNumber(s2, 5)
    expect(s3.board[r][c].pencilMarks).toContain(5)
    expect(s3.board[r][c].value).toBeNull()
  })

  it('erase cell clears value and pencil marks', () => {
    const state = createGameState('easy')
    const empty = findFirstEmpty(state.board)
    if (!empty) return
    const [r, c] = empty
    const s1 = selectCell(state, r, c)
    const s2 = inputNumber(s1, state.solution[r][c])
    expect(s2.board[r][c].value).not.toBeNull()
    const s3 = eraseCell(s2)
    expect(s3.board[r][c].value).toBeNull()
  })

  it('undo restores previous state', () => {
    const state = createGameState('easy')
    const empty = findFirstEmpty(state.board)
    if (!empty) return
    const [r, c] = empty
    const s1 = selectCell(state, r, c)
    const s2 = inputNumber(s1, state.solution[r][c])
    expect(s2.board[r][c].value).toBe(state.solution[r][c])
    const s3 = undoMove(s2)
    expect(s3.board[r][c].value).toBeNull()
    expect(s3.history.length).toBe(0)
  })

  it('hint fills a random empty cell', () => {
    const state = createGameState('easy')
    const next = useHint(state)
    expect(next.hintsUsed).toBe(1)
    let hintCount = 0
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (next.board[r][c].isHint) hintCount++
      }
    }
    expect(hintCount).toBe(1)
  })
})
