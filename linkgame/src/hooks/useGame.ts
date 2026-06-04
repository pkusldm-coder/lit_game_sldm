import { useState, useCallback, useEffect, useRef } from 'react'
import type { GameState } from '../core/types'
import { findPath } from '../core/pathfinder'
import { generateBoard, removeTiles, shuffleBoard, resetIdCounter } from '../core/board'
import { getLevelConfig } from '../core/level'

const LEVEL_KEY = 'linkgame_level'

function loadLevel(): number {
  try {
    const saved = localStorage.getItem(LEVEL_KEY)
    if (saved) return Math.max(1, parseInt(saved, 10))
  } catch {}
  return 1
}

function saveLevel(level: number): void {
  try {
    localStorage.setItem(LEVEL_KEY, String(level))
  } catch {}
}

function initState(level: number): GameState {
  resetIdCounter()
  const config = getLevelConfig(level)
  const board = generateBoard(config.rows, config.cols, config.tileTypes)
  return {
    board,
    selected: null,
    level,
    pairsRemaining: (config.rows * config.cols) / 2,
    won: false,
    path: null,
    animating: false,
    timeLeft: config.timeLimit,
    timeout: false,
  }
}

export function useGame() {
  const [state, setState] = useState<GameState>(() => initState(loadLevel()))
  const [shuffled, setShuffled] = useState(false)
  const [showLevelSelect, setShowLevelSelect] = useState(false)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (state.won || state.timeout || state.timeLeft <= 0) {
      if (tickRef.current) clearInterval(tickRef.current)
      return
    }
    tickRef.current = setInterval(() => {
      setState(prev => {
        if (prev.won || prev.timeout) return prev
        const next = prev.timeLeft - 1
        if (next <= 0) {
          return { ...prev, timeLeft: 0, timeout: true }
        }
        return { ...prev, timeLeft: next }
      })
    }, 1000)
    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [state.won, state.timeout, state.timeLeft])

  const startNewGame = useCallback((level: number) => {
    setState(initState(level))
    setShuffled(false)
    saveLevel(level)
  }, [])

  const handleCellClick = useCallback((row: number, col: number) => {
    setState(prev => {
      if (prev.won || prev.animating || prev.timeout) return prev

      const tile = prev.board[row][col]
      if (!tile) return prev

      if (prev.selected === null) {
        return { ...prev, selected: { row, col }, path: null }
      }

      const selRow = prev.selected.row
      const selCol = prev.selected.col

      if (selRow === row && selCol === col) {
        return { ...prev, selected: null, path: null }
      }

      const firstTile = prev.board[selRow][selCol]
      if (!firstTile || firstTile.type !== tile.type) {
        return { ...prev, selected: { row, col }, path: null }
      }

      const path = findPath(prev.board, selRow, selCol, row, col)
      if (!path) {
        return { ...prev, selected: { row, col }, path: null }
      }

      const newBoard = removeTiles(prev.board, selRow, selCol, row, col)
      const newPairsRemaining = prev.pairsRemaining - 1
      const won = newPairsRemaining === 0

      return {
        board: newBoard,
        selected: null,
        level: prev.level,
        pairsRemaining: newPairsRemaining,
        won,
        path,
        animating: false,
        timeLeft: prev.timeLeft,
        timeout: false,
      }
    })
  }, [])

  const nextLevel = useCallback(() => {
    const next = state.level + 1
    startNewGame(next)
  }, [state.level, startNewGame])

  const handleShuffle = useCallback(() => {
    setState(prev => {
      if (prev.won || prev.timeout) return prev
      const newBoard = shuffleBoard(prev.board)
      return {
        ...prev,
        board: newBoard,
        selected: null,
        path: null,
      }
    })
    setShuffled(true)
  }, [])

  const handleRetry = useCallback(() => {
    startNewGame(state.level)
  }, [state.level, startNewGame])

  return {
    state,
    shuffled,
    showLevelSelect,
    setShowLevelSelect,
    handleCellClick,
    nextLevel,
    handleShuffle,
    startNewGame,
    handleRetry,
  }
}
