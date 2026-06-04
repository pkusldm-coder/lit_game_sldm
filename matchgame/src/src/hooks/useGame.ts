import { useState, useCallback, useRef } from 'react'
import type { GameState, Board, Cell } from '../core/types'
import { generateBoard, removeMatches, dropTiles, fillEmpty, swapTiles, resetIdCounter } from '../core/board'
import { findMatches, hasAnyMove } from '../core/matcher'
import { getLevelConfig } from '../core/level'

const LEVEL_KEY = 'matchgame_level'

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
    score: 0,
    targetScore: config.targetScore,
    movesLeft: config.maxMoves,
    maxMoves: config.maxMoves,
    won: false,
    lost: false,
    animating: false,
  }
}

function isAdjacent(a: Cell, b: Cell): boolean {
  const dr = Math.abs(a.row - b.row)
  const dc = Math.abs(a.col - b.col)
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1)
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function shuffleBoard(board: Board): Board {
  const rows = board.length
  const cols = board[0].length
  const tiles = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c]) tiles.push(board[r][c]!.type)
    }
  }
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]]
  }
  const newBoard = board.map(row => row.map(() => null as (typeof row[0])))
  let idx = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c]) {
        newBoard[r][c] = { id: board[r][c]!.id, type: tiles[idx++] }
      }
    }
  }
  return newBoard
}

export function useGame() {
  const [state, setState] = useState<GameState>(() => initState(loadLevel()))
  const [showLevelSelect, setShowLevelSelect] = useState(false)
  const animatingRef = useRef(false)

  const startNewGame = useCallback((level: number) => {
    setState(initState(level))
    setShowLevelSelect(false)
    animatingRef.current = false
    saveLevel(level)
  }, [])

  const processCascade = useCallback(async (board: Board, baseScore: number, movesLeft: number) => {
    animatingRef.current = true
    const tileTypes = getLevelConfig(state.level).tileTypes
    let currentBoard = board
    let totalScore = baseScore
    let combo = 0

    while (true) {
      const result = findMatches(currentBoard)
      if (result.matches.length === 0) break

      combo++
      const comboScore = result.score * combo
      totalScore += comboScore

      currentBoard = removeMatches(currentBoard, result.matches)
      await delay(150)
      currentBoard = dropTiles(currentBoard)
      await delay(100)
      currentBoard = fillEmpty(currentBoard, tileTypes)
      await delay(100)
    }

    const newMovesLeft = movesLeft - 1
    const won = totalScore >= state.targetScore
    const lost = !won && newMovesLeft <= 0

    if (!won && !lost && !hasAnyMove(currentBoard)) {
      for (let attempt = 0; attempt < 50; attempt++) {
        currentBoard = shuffleBoard(currentBoard)
        if (hasAnyMove(currentBoard)) break
      }
    }

    setState(prev => ({
      ...prev,
      board: currentBoard,
      selected: null,
      score: totalScore,
      movesLeft: newMovesLeft,
      won,
      lost,
      animating: false,
    }))
    animatingRef.current = false
  }, [state.level, state.targetScore])

  const handleCellClick = useCallback((row: number, col: number) => {
    if (animatingRef.current) return

    setState(prev => {
      if (prev.won || prev.lost) return prev
      if (prev.animating) return prev

      if (prev.selected === null) {
        return { ...prev, selected: { row, col } }
      }

      const sel = prev.selected
      if (sel.row === row && sel.col === col) {
        return { ...prev, selected: null }
      }

      if (!isAdjacent(sel, { row, col })) {
        return { ...prev, selected: { row, col } }
      }

      const swapped = swapTiles(prev.board, sel.row, sel.col, row, col)
      const matches = findMatches(swapped)
      if (matches.matches.length === 0) {
        return { ...prev, selected: { row, col } }
      }

      return {
        ...prev,
        board: swapped,
        selected: null,
        animating: true,
      }
    })

    // after state commit, start cascade
    setState(prev => {
      if (prev.animating) {
        processCascade(prev.board, prev.score, prev.movesLeft)
      }
      return prev
    })
  }, [processCascade])

  const nextLevel = useCallback(() => {
    if (animatingRef.current) return
    const next = state.level + 1
    saveLevel(next)
    startNewGame(next)
  }, [state.level, startNewGame])

  const handleRetry = useCallback(() => {
    if (animatingRef.current) return
    startNewGame(state.level)
  }, [state.level, startNewGame])

  return {
    state,
    showLevelSelect,
    setShowLevelSelect,
    handleCellClick,
    nextLevel,
    handleRetry,
    startNewGame,
  }
}
