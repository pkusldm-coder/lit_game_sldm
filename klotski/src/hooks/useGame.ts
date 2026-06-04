import { useState, useCallback } from 'react'
import type { Block, Direction, GameState } from '../core/types'
import { LEVELS } from '../core/levels'
import { canMove, moveBlock, checkWin } from '../core/logic'

const LEVEL_KEY = 'klotski_level'

function loadLevel(): number {
  try {
    const saved = localStorage.getItem(LEVEL_KEY)
    if (saved) return Math.min(LEVELS.length - 1, Math.max(0, parseInt(saved, 10)))
  } catch {}
  return 0
}

function saveLevel(index: number): void {
  try {
    localStorage.setItem(LEVEL_KEY, String(index))
  } catch {}
}

function initState(levelIndex: number): GameState {
  const level = LEVELS[levelIndex]
  const blocks: Block[] = level.blocks.map((def, i) => ({
    ...def,
    row: level.init[i][0],
    col: level.init[i][1],
  }))
  return { blocks, levelIndex, moves: 0, won: false, selectedId: null }
}

export function useGame() {
  const [state, setState] = useState<GameState>(() => initState(loadLevel()))
  const [showLevelSelect, setShowLevelSelect] = useState(false)

  const startLevel = useCallback((index: number) => {
    setState(initState(index))
    setShowLevelSelect(false)
    saveLevel(index)
  }, [])

  const handleSelect = useCallback((id: number) => {
    setState(prev => {
      if (prev.won) return prev
      return { ...prev, selectedId: prev.selectedId === id ? null : id }
    })
  }, [])

  const handleMove = useCallback((id: number, dir: Direction) => {
    setState(prev => {
      if (prev.won) return prev
      if (!canMove(prev.blocks, id, dir)) return prev
      const newBlocks = moveBlock(prev.blocks, id, dir)
      const won = checkWin(newBlocks)
      return {
        ...prev,
        blocks: newBlocks,
        moves: prev.moves + 1,
        won,
        selectedId: null,
      }
    })
  }, [])

  const resetLevel = useCallback(() => {
    setState(initState(state.levelIndex))
  }, [state.levelIndex])

  const nextLevel = useCallback(() => {
    const next = state.levelIndex + 1
    if (next < LEVELS.length) {
      startLevel(next)
    }
  }, [state.levelIndex, startLevel])

  return {
    state,
    showLevelSelect,
    setShowLevelSelect,
    handleSelect,
    handleMove,
    resetLevel,
    nextLevel,
    startLevel,
  }
}
