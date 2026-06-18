import { useState, useRef } from 'react'
import type { GameState } from '@wordcore/types'
import type { FillEntry } from './core/types'
import { initGameFrom, nextRiddle, getDifficultyLabel } from '@wordcore/game'
import ENTRIES from './core/entries'

interface Props { onBack: () => void }

export default function Shicitian({ onBack }: Props) {
  const [state, setState] = useState<GameState>(() => initGameFrom(ENTRIES as any))
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handlePick(ch: string) {
    if (state.showResult) {
      if (timerRef.current) clearTimeout(timerRef.current)
      setState(prev => nextRiddle(prev))
      return
    }
    const entry = state.riddles[state.index] as unknown as FillEntry
    const correct = ch === entry.answer
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
    setState(initGameFrom(ENTRIES as any))
  }

  if (state.done) {
    const total = state.riddles.length
    return (
      <div className="st-app">
        <div className="st-result">
          <div className="st-result-title">诗词填字结束</div>
          <div className="st-result-score">{state.score} / {total}</div>
          <div className="st-result-bar-wrap">
            <div className="st-result-bar" style={{ width: `${(state.score / total) * 100}%` }} />
          </div>
          <div className="st-result-msg">
            {state.score === total ? '全对！诗词达人！' : state.score >= total * 0.7 ? '腹有诗书气自华！' : '继续读诗吧！'}
          </div>
          <button className="st-btn st-btn-primary" onClick={handleRestart}>再来一轮</button>
          <button className="st-btn" style={{ background: '#0a2a3e', color: '#6ac' }} onClick={onBack}>返回</button>
        </div>
      </div>
    )
  }

  const entry = state.riddles[state.index] as unknown as FillEntry
  const total = state.riddles.length
  const parts = entry.line.split(entry.blank)

  return (
    <div className="st-app">
      <div className="st-header">
        <div className="wg-bar">
          <button className="wg-bar-btn" onClick={onBack}>← 返回</button>
          <div className="st-title">诗词填字</div>
        </div>
        <div className="st-progress">
          <div className="st-progress-bar" style={{ width: `${((state.index + 1) / total) * 100}%` }} />
        </div>
        <div className="st-stat-row">
          <span>{state.index + 1}/{total}</span>
          <span className="st-tag">{getDifficultyLabel(entry.difficulty)}</span>
          <span className="st-score">得分：{state.score}</span>
        </div>
      </div>

      <div className="st-poem-card">
        <div className="st-line">
          {parts[0]}
          <span className={state.showResult ? (state.showResult.correct ? 'st-blank-correct' : 'st-blank-wrong') : 'st-blank'}>
            {state.showResult ? entry.answer : entry.blank}
          </span>
          {parts[1] || ''}
        </div>
        <div className="st-source">{entry.dynasty}·{entry.author}《{entry.title}》</div>
      </div>

      <div className="st-options">
        {entry.options.map(ch => {
          let cls = 'st-opt'
          if (state.showResult) {
            if (ch === entry.answer) cls += ' st-opt-correct'
            else if (ch === state.showResult.selected && !state.showResult.correct) cls += ' st-opt-wrong'
            else cls += ' st-opt-dim'
          }
          return (
            <button key={ch} className={cls} onClick={() => handlePick(ch)}>
              {ch}
            </button>
          )
        })}
      </div>

      {state.showResult && (
        <div className="st-explain">
          {state.showResult.correct ? '✓ 正确！' : `✗ 应填「${entry.answer}」`}
          <br />
          {parts[0]}{entry.answer}{parts[1] || ''}
        </div>
      )}
    </div>
  )
}