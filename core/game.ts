import type { GameState, Riddle } from './types'

function shuffle<T>(a: T[]): T[] {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]]
  }
  return b
}

export function initGameFrom(riddles: Riddle[]): GameState {
  const shuffled = shuffle(riddles).map(r => ({ ...r, options: shuffle(r.options) }))
  return { riddles: shuffled, index: 0, score: 0, showResult: null, done: false }
}

export function submitAnswer(state: GameState, selected: string): GameState {
  if (state.showResult || state.done) return state
  const riddle = state.riddles[state.index]
  const correct = selected === riddle.answer
  return { ...state, showResult: { selected, correct } }
}

export function nextRiddle(state: GameState): GameState {
  if (!state.showResult) return state
  const newScore = state.showResult.correct ? state.score + 1 : state.score
  const nextIdx = state.index + 1
  if (nextIdx >= state.riddles.length) {
    return { ...state, score: newScore, showResult: null, done: true }
  }
  return { ...state, score: newScore, index: nextIdx, showResult: null }
}

export function getDifficultyLabel(d: string): string {
  return d === 'easy' ? '简单' : d === 'medium' ? '中等' : '困难'
}
