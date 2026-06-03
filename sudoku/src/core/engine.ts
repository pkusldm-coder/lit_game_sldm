import type { GameState, Difficulty, Board, RawBoard, HistoryEntry } from './types'
import { createPuzzle } from './generator'

function rawBoardToBoard(raw: RawBoard): Board {
  return raw.map(row =>
    row.map(val => ({
      value: val === 0 ? null : val,
      isGiven: val !== 0,
      pencilMarks: [],
      isError: false,
      isHint: false,
    }))
  )
}

export function createGameState(difficulty: Difficulty): GameState {
  const { puzzle, solution } = createPuzzle(difficulty)
  return {
    board: rawBoardToBoard(puzzle),
    solution,
    difficulty,
    selectedCell: null,
    status: 'playing',
    mistakes: 0,
    hintsUsed: 0,
    timer: 0,
    history: [],
    noteMode: false,
  }
}

export function selectCell(state: GameState, row: number, col: number): GameState {
  if (state.status !== 'playing') return state
  return { ...state, selectedCell: [row, col] }
}

export function inputNumber(state: GameState, num: number): GameState {
  if (state.status !== 'playing') return state
  const [r, c] = state.selectedCell ?? [-1, -1]
  if (r < 0 || c < 0) return state
  if (state.board[r][c].isGiven) return state

  const newBoard = state.board.map(row => row.map(cell => ({ ...cell, isError: false, isHint: false })))

  if (state.noteMode) {
    const marks = [...newBoard[r][c].pencilMarks]
    const idx = marks.indexOf(num)
    if (idx >= 0) {
      marks.splice(idx, 1)
    } else {
      marks.push(num)
      marks.sort()
    }
    const entry: HistoryEntry = {
      row: r,
      col: c,
      prevValue: newBoard[r][c].value,
      prevPencilMarks: newBoard[r][c].pencilMarks,
    }
    newBoard[r][c] = { ...newBoard[r][c], pencilMarks: marks, value: null }
    return {
      ...state,
      board: newBoard,
      history: [...state.history, entry],
    }
  }

  const correct = state.solution[r][c] === num
  let mistakes = state.mistakes
  const entry: HistoryEntry = {
    row: r,
    col: c,
    prevValue: newBoard[r][c].value,
    prevPencilMarks: newBoard[r][c].pencilMarks,
  }

  if (correct) {
    newBoard[r][c] = { ...newBoard[r][c], value: num, pencilMarks: [], isError: false }

    const won = checkWin(newBoard, state.solution)
    return {
      ...state,
      board: newBoard,
      history: [...state.history, entry],
      status: won ? 'won' : 'playing',
      selectedCell: won ? null : state.selectedCell,
    }
  } else {
    mistakes++
    newBoard[r][c] = { ...newBoard[r][c], isError: true }
    return {
      ...state,
      board: newBoard,
      mistakes,
      history: [...state.history, entry],
      selectedCell: state.selectedCell,
    }
  }
}

export function eraseCell(state: GameState): GameState {
  if (state.status !== 'playing') return state
  const [r, c] = state.selectedCell ?? [-1, -1]
  if (r < 0 || c < 0) return state
  if (state.board[r][c].isGiven) return state

  const newBoard = state.board.map(row => row.map(cell => ({ ...cell, isError: false, isHint: false })))
  const entry: HistoryEntry = {
    row: r, col: c,
    prevValue: newBoard[r][c].value,
    prevPencilMarks: newBoard[r][c].pencilMarks,
  }
  newBoard[r][c] = { ...newBoard[r][c], value: null, pencilMarks: [], isError: false }
  return { ...state, board: newBoard, history: [...state.history, entry] }
}

export function useHint(state: GameState): GameState {
  if (state.status !== 'playing') return state
  const empty: [number, number][] = []
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (!state.board[r][c].isGiven && state.board[r][c].value === null) {
        empty.push([r, c])
      }
    }
  }
  if (empty.length === 0) return state

  const [r, c] = empty[Math.floor(Math.random() * empty.length)]
  const newBoard = state.board.map(row => row.map(cell => ({ ...cell, isError: false, isHint: false })))
  newBoard[r][c] = { value: state.solution[r][c], isGiven: true, pencilMarks: [], isError: false, isHint: true }

  const won = checkWin(newBoard, state.solution)
  return {
    ...state,
    board: newBoard,
    hintsUsed: state.hintsUsed + 1,
    selectedCell: [r, c],
    status: won ? 'won' : 'playing',
  }
}

export function undoMove(state: GameState): GameState {
  if (state.status !== 'playing' || state.history.length === 0) return state
  const history = [...state.history]
  const entry = history.pop()!
  const newBoard = state.board.map(row => row.map(cell => ({ ...cell, isError: false, isHint: false })))
  newBoard[entry.row][entry.col] = {
    ...newBoard[entry.row][entry.col],
    value: entry.prevValue,
    pencilMarks: entry.prevPencilMarks,
  }
  return { ...state, board: newBoard, history, selectedCell: [entry.row, entry.col] }
}

export function toggleNoteMode(state: GameState): GameState {
  if (state.status !== 'playing') return state
  return { ...state, noteMode: !state.noteMode }
}

function checkWin(board: Board, solution: RawBoard): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c].value !== solution[r][c]) return false
    }
  }
  return true
}
