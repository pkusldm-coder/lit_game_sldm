import { useState, useCallback, useRef } from 'react'
import type { Cell, GameState } from '../core/types'
import { LEVELS } from '../core/levels'
import { createBoard, canExtend, extendPath, clearPath, checkWin } from '../core/logic'

const LEVEL_KEY = 'flowgame_level'

function loadLevel(): number {
  try {
    const saved = localStorage.getItem(LEVEL_KEY)
    if (saved) return Math.min(LEVELS.length - 1, Math.max(0, parseInt(saved, 10)))
  } catch {}
  return 0
}

function saveLevel(level: number): void {
  try {
    localStorage.setItem(LEVEL_KEY, String(level))
  } catch {}
}

function initState(levelIndex: number): GameState {
  const level = LEVELS[levelIndex]
  const board = createBoard(level.gridSize, level.colors)
  return {
    board,
    colors: level.colors,
    level: levelIndex + 1,
    gridSize: level.gridSize,
    won: false,
    drawing: false,
    currentColor: null,
    path: [],
    moves: 0,
  }
}

export function useGame() {
  const [state, setState] = useState<GameState>(() => initState(loadLevel()))
  const [showLevelSelect, setShowLevelSelect] = useState(false)
  const touchRef = useRef<Cell | null>(null)

  const startLevel = useCallback((index: number) => {
    setState(initState(index))
    setShowLevelSelect(false)
    saveLevel(index)
  }, [])

  const getCellFromEvent = useCallback((e: React.PointerEvent | PointerEvent): Cell | null => {
    const el = document.elementFromPoint(e.clientX, e.clientY)
    if (!el) return null
    const cellEl = el.closest('[data-row][data-col]') as HTMLElement | null
    if (!cellEl) return null
    return {
      row: parseInt(cellEl.dataset.row!, 10),
      col: parseInt(cellEl.dataset.col!, 10),
    }
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (state.won) return
    e.preventDefault()
    const cell = getCellFromEvent(e)
    if (!cell) return

    const cellData = state.board[cell.row][cell.col]
    if (cellData.colorId !== null && cellData.isEndpoint) {
      setState(prev => ({
        ...prev,
        drawing: true,
        currentColor: cellData.colorId,
        path: [cell],
      }))
      touchRef.current = cell
    }
  }, [state.won, state.board, getCellFromEvent])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!state.drawing || state.currentColor === null) return
    e.preventDefault()
    const cell = getCellFromEvent(e)
    if (!cell) return

    const lastCell = state.path[state.path.length - 1]
    if (!lastCell || (lastCell.row === cell.row && lastCell.col === cell.col)) return

    setState(prev => {
      if (!prev.drawing || prev.currentColor === null) return prev
      const last = prev.path[prev.path.length - 1]
      if (!last) return prev

      if (prev.board[cell.row][cell.col].colorId === prev.currentColor) {
        if (prev.board[cell.row][cell.col].isEndpoint) {
          const newBoard = prev.path
            .filter((_, i) => i > 0)
            .reduce((b, c) => extendPath(b, { row: c.row, col: c.col }, c, prev.currentColor!), prev.board)
          const won = checkWin(newBoard, prev.colors)
          return {
            ...prev,
            board: newBoard,
            drawing: false,
            currentColor: null,
            path: [],
            moves: prev.moves + 1,
            won,
          }
        }
        const backtrackIndex = prev.path.findIndex(
          (c, i) => i > 0 && c.row === cell.row && c.col === cell.col
        )
        if (backtrackIndex > 0) {
          const newPath = prev.path.slice(0, backtrackIndex)
          const clearedBoard = clearPath(prev.board, prev.path.slice(backtrackIndex), prev.currentColor!)
          return { ...prev, board: clearedBoard, path: newPath }
        }
        return prev
      }

      if (!canExtend(prev.board, last, cell, prev.currentColor)) return prev

      const newBoard = extendPath(prev.board, last, cell, prev.currentColor)
      return {
        ...prev,
        board: newBoard,
        path: [...prev.path, cell],
      }
    })
  }, [state.drawing, state.currentColor, state.path, getCellFromEvent])

  const handlePointerUp = useCallback(() => {
    setState(prev => ({
      ...prev,
      drawing: false,
      currentColor: null,
      path: [],
    }))
    touchRef.current = null
  }, [])

  const nextLevel = useCallback(() => {
    const next = state.level
    if (next < LEVELS.length) {
      startLevel(next)
    }
  }, [state.level, startLevel])

  const resetLevel = useCallback(() => {
    setState(initState(state.level - 1))
  }, [state.level])

  return {
    state,
    showLevelSelect,
    setShowLevelSelect,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    nextLevel,
    resetLevel,
    startLevel,
  }
}
