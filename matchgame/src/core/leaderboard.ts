import type { DifficultyKey } from './types'

export interface LeaderboardEntry {
  score: number
  date: string
}

const KEYS: Record<DifficultyKey, string> = {
  easy: 'matchgame_lb_easy',
  medium: 'matchgame_lb_medium',
  hard: 'matchgame_lb_hard',
}

const MAX = 5

export function getLeaderboard(dk: DifficultyKey): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(KEYS[dk])
    if (!raw) return []
    const entries: LeaderboardEntry[] = JSON.parse(raw)
    return entries.sort((a, b) => b.score - a.score).slice(0, MAX)
  } catch { return [] }
}

export function saveScore(dk: DifficultyKey, score: number): number {
  const entries = getLeaderboard(dk)
  const date = new Date().toLocaleDateString('zh-CN')
  entries.push({ score, date })
  entries.sort((a, b) => b.score - a.score)
  const trimmed = entries.slice(0, MAX)
  try { localStorage.setItem(KEYS[dk], JSON.stringify(trimmed)) } catch {}
  return trimmed.findIndex(e => e.score === score && e.date === date) + 1 || 0
}