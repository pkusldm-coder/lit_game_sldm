import { useState, useRef } from 'react'
import type { GameState } from '@wordcore/types'
import type { Xiehouyu } from './core/types'
import { initGameFrom, nextRiddle, getDifficultyLabel } from '@wordcore/game'
import DATA from './core/data'

interface Props { onBack: () => void }

export default function Xiehouyu({ onBack }: Props) {
  const [state, setState] = useState<GameState>(() => initGameFrom(DATA as any))
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handlePick(ch: string) {
    if (state.showResult) {
      if (timerRef.current) clearTimeout(timerRef.current)
      setState(prev => nextRiddle(prev))
      return
    }
    const item = state.riddles[state.index] as unknown as Xiehouyu
    const correct = ch === item.back
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
    setState(initGameFrom(DATA as any))
  }

  if (state.done) {
    const total = state.riddles.length
    return (
      <div className="xhy-app">
        <div className="xhy-result">
          <div className="xhy-result-title">歇后语闯关结束</div>
          <div className="xhy-result-score">{state.score} / {total}</div>
          <div className="xhy-result-bar-wrap">
            <div className="xhy-result-bar" style={{ width: `${(state.score / total) * 100}%` }} />
          </div>
          <div className="xhy-result-msg">
            {state.score === total ? '全对！歇后语大师！' : state.score >= total * 0.7 ? '学识渊博！' : '再来一轮吧！'}
          </div>
          <button className="xhy-btn xhy-btn-primary" onClick={handleRestart}>再来一轮</button>
          <button className="xhy-btn" style={{ background: '#2a2e1e', color: '#e80' }} onClick={onBack}>返回</button>
        </div>
      </div>
    )
  }

  const item = state.riddles[state.index] as unknown as Xiehouyu
  const total = state.riddles.length

  return (
    <div className="xhy-app">
      <div className="xhy-header">
        <div className="wg-bar">
          <button className="wg-bar-btn" onClick={onBack}>← 返回</button>
          <div className="xhy-title">歇后语闯关</div>
        </div>
        <div className="xhy-progress">
          <div className="xhy-progress-bar" style={{ width: `${((state.index + 1) / total) * 100}%` }} />
        </div>
        <div className="xhy-stat-row">
          <span>{state.index + 1}/{total}</span>
          <span className="xhy-tag">{getDifficultyLabel(item.difficulty)}</span>
          <span className="xhy-score">得分：{state.score}</span>
        </div>
      </div>

      <div className="xhy-question">{item.front}</div>

      <div className="xhy-options">
        {item.options.map(ch => {
          let cls = 'xhy-opt'
          if (state.showResult) {
            if (ch === item.back) cls += ' xhy-opt-correct'
            else if (ch === state.showResult.selected && !state.showResult.correct) cls += ' xhy-opt-wrong'
            else cls += ' xhy-opt-dim'
          }
          return (
            <button key={ch} className={cls} onClick={() => handlePick(ch)}>
              {ch}
            </button>
          )
        })}
      </div>

      {state.showResult && (
        <div className="xhy-explain">
          {state.showResult.correct ? '✓ 正确！' : `✗ 答案是「${item.back}」`}
          <br />
          {item.explanation}
        </div>
      )}
    </div>
  )
}