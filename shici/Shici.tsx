import { useState, useRef } from 'react'
import type { GameState } from '@wordcore/types'
import type { Poem } from './core/types'
import { initGameFrom, nextRiddle, getDifficultyLabel } from '@wordcore/game'
import POEMS from './core/poems'

interface Props { onBack: () => void }

export default function Shici({ onBack }: Props) {
  const [state, setState] = useState<GameState>(() => initGameFrom(POEMS as any))
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handlePick(ch: string) {
    if (state.showResult) {
      if (timerRef.current) clearTimeout(timerRef.current)
      setState(prev => nextRiddle(prev))
      return
    }
    const poem = state.riddles[state.index] as unknown as Poem
    const correct = ch === poem.lower
    setState(prev => ({ ...prev, showResult: { selected: ch, correct } }))
    const delay = correct ? 1200 : 2800
    timerRef.current = setTimeout(() => {
      setState(prev => nextRiddle(prev))
      timerRef.current = null
    }, delay)
  }

  function handleRestart() {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
    setState(initGameFrom(POEMS as any))
  }

  if (state.done) {
    const total = state.riddles.length
    return (
      <div className="sc-app">
        <div className="sc-result">
          <div className="sc-result-title">诗词接龙结束</div>
          <div className="sc-result-score">{state.score} / {total}</div>
          <div className="sc-result-bar-wrap">
            <div className="sc-result-bar" style={{ width: `${(state.score / total) * 100}%` }} />
          </div>
          <div className="sc-result-msg">
            {state.score === total ? '全对！诗词达人！' : state.score >= total * 0.7 ? '腹有诗书气自华！' : '继续读诗吧！'}
          </div>
          <button className="sc-btn sc-btn-primary" onClick={handleRestart}>再来一轮</button>
          <button className="sc-btn" style={{ background: '#1a3a1a', color: '#8c4' }} onClick={onBack}>返回</button>
        </div>
      </div>
    )
  }

  const poem = state.riddles[state.index] as unknown as Poem
  const total = state.riddles.length

  return (
    <div className="sc-app">
      <div className="sc-header">
        <div className="wg-bar">
          <button className="wg-bar-btn" onClick={onBack}>← 返回</button>
          <div className="sc-title">诗词接龙</div>
        </div>
        <div className="sc-progress">
          <div className="sc-progress-bar" style={{ width: `${((state.index + 1) / total) * 100}%` }} />
        </div>
        <div className="sc-stat-row">
          <span>{state.index + 1}/{total}</span>
          <span className="sc-tag">{getDifficultyLabel(poem.difficulty)}</span>
          <span className="sc-score">得分：{state.score}</span>
        </div>
      </div>

      <div className="sc-poem-card">
        <div className="sc-upper">{poem.upper}</div>
        <div className="sc-source">{poem.dynasty}·{poem.author}《{poem.title}》</div>
      </div>

      <div className="sc-options">
        {poem.options.map(ch => {
          let cls = 'sc-opt'
          if (state.showResult) {
            if (ch === poem.lower) cls += ' sc-opt-correct'
            else if (ch === state.showResult.selected && !state.showResult.correct) cls += ' sc-opt-wrong'
            else cls += ' sc-opt-dim'
          }
          return (
            <button key={ch} className={cls} onClick={() => handlePick(ch)}>
              {ch}
            </button>
          )
        })}
      </div>

      {state.showResult && (
        <div className="sc-explain">
          {state.showResult.correct ? '✓ 正确！' : '✗ 不对哦'}
          <br />
          {poem.upper} → {poem.lower}
        </div>
      )}
    </div>
  )
}