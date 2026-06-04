import { useState, useCallback } from 'react'
import type { GameState } from '../core/types'
import { LEVELS } from '../core/levels'
import { computeClues, createEmptyBoard, checkWin } from '../core/logic'

const LEVEL_KEY = 'nonogram_level'

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
  const { rowClues, colClues } = computeClues(level.solution)
  return {
    level: levelIndex + 1,
    gridSize: level.gridSize,
    board: createEmptyBoard(level.gridSize),
    solution: level.solution,
    rowClues,
    colClues,
    won: false,
    moves: 0,
    mode: 'fill',
  }
}

export function useGame() {
  const [state, setState] = useState<GameState>(() => initState(loadLevel()))
  const [showLevelSelect, setShowLevelSelect] = useState(false)

  const startLevel = useCallback((index: number) => {
    setState(initState(index))
    setShowLevelSelect(false)
    saveLevel(index)
  }, [])

  const handleCellClick = useCallback((row: number, col: number) => {
    setState(prev => {
      if (prev.won) return prev
      const newBoard = prev.board.map(r => [...r])
      const current = newBoard[row][col]

      if (prev.mode === 'fill') {
        newBoard[row][col] = current === 'filled' ? 'empty' : 'filled'
      } else {
        newBoard[row][col] = current === 'marked' ? 'empty' : 'marked'
      }

      const won = checkWin(newBoard, prev.solution)
      return {
        ...prev,
        board: newBoard,
        moves: prev.moves + 1,
        won,
      }
    })
  }, [])

  const handleCellContextMenu = useCallback((e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault()
    setState(prev => {
      if (prev.won) return prev
      const newBoard = prev.board.map(r => [...r])
      const current = newBoard[row][col]
      newBoard[row][col] = current === 'marked' ? 'empty' : 'marked'
      return { ...prev, board: newBoard, moves: prev.moves + 1 }
    })
  }, [])

  const toggleMode = useCallback(() => {
    setState(prev => ({ ...prev, mode: prev.mode === 'fill' ? 'mark' : 'fill' }))
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
    handleCellClick,
    handleCellContextMenu,
    toggleMode,
    nextLevel,
    resetLevel,
    startLevel,
  }
}
