import type { Difficulty, GameState } from '../core/types'

const KEY_PREFIX = '2048_'

function getKey(difficulty: Difficulty): string {
  return `${KEY_PREFIX}highscore_${difficulty}`
}

const GAMESTATE_KEY = `${KEY_PREFIX}gamestate`

function safeGetItem(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}

function safeSetItem(key: string, value: string): void {
  try { localStorage.setItem(key, value) } catch {}
}

export function saveHighScore(difficulty: Difficulty, score: number): void {
  const current = getHighScore(difficulty)
  if (score > current) safeSetItem(getKey(difficulty), String(score))
}

export function getHighScore(difficulty: Difficulty): number {
  const val = safeGetItem(getKey(difficulty))
  return val ? parseInt(val, 10) : 0
}

export function saveGameState(state: GameState): void {
  safeSetItem(GAMESTATE_KEY, JSON.stringify(state))
}

export function loadGameState(): GameState | null {
  const raw = safeGetItem(GAMESTATE_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) as GameState } catch { return null }
}

export function clearGameState(): void {
  try { localStorage.removeItem(GAMESTATE_KEY) } catch {}
}