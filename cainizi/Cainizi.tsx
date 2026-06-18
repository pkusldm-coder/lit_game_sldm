import { useState, useRef } from 'react'
import type { GameState } from '@wordcore/types'
import { initGameFrom, submitAnswer, nextRiddle, getDifficultyLabel } from '@wordcore/game'
import RIDDLES from './riddles'

interface Props { onBack: () => void }

export default function Cainizi({ onBack }: Props) {
  const [state, setState] = useState<GameState>(() => initGameFrom(RIDDLES))
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handlePick(ch: string) {
    if (state.showResult) {
      if (timerRef.current) clearTimeout(timerRef.current)
      setState(prev => nextRiddle(prev))
      return
    }
    const riddle = state.riddles[state.index]
    const correct = ch === riddle.answer
    setState(prev => submitAnswer(prev, ch))
    const delay = correct ? 1200 : 2800
    timerRef.current = setTimeout(() => {
      setState(prev => nextRiddle(prev))
      timerRef.current = null
    }, delay)
  }

  function handleRestart() {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
    setState(initGameFrom(RIDDLES))
  }

  if (state.done) {
    const total = state.riddles.length
    return (
      <div className="cz-app">
        <div className="cz-result">
          <div className="cz-result-title">答题结束</div>
          <div className="cz-result-score">{state.score} / {total}</div>
          <div className="cz-result-bar-wrap">
            <div className="cz-result-bar" style={{ width: `${(state.score / total) * 100}%` }} />
          </div>
          <div className="cz-result-msg">
            {state.score === total ? '全对！字谜大师！' : state.score >= total * 0.7 ? '很不错！' : '继续加油！'}
          </div>
          <button className="cz-btn cz-btn-primary" onClick={handleRestart}>再来一轮</button>
          <button className="cz-btn" style={{ background: '#3a4a6e', color: '#eee' }} onClick={onBack}>返回</button>
        </div>
      </div>
    )
  }

  const riddle = state.riddles[state.index]
  const total = state.riddles.length

  return (
    <div className="cz-app">
      <div className="cz-header">
        <div className="wg-bar">
          <button className="wg-bar-btn" onClick={onBack}>← 返回</button>
          <div className="cz-title">猜字谜</div>
        </div>
        <div className="cz-progress">
          <div className="cz-progress-bar" style={{ width: `${((state.index + 1) / total) * 100}%` }} />
        </div>
        <div className="cz-stat-row">
          <span>{state.index + 1}/{total}</span>
          <span className="cz-diff">{getDifficultyLabel(riddle.difficulty)}</span>
          <span className="cz-score">得分：{state.score}</span>
        </div>
      </div>

      <div className="cz-hint">{riddle.hint}</div>

      <div className="cz-options">
        {riddle.options.map(ch => {
          let cls = 'cz-opt'
          if (state.showResult) {
            if (ch === riddle.answer) cls += ' cz-opt-correct'
            else if (ch === state.showResult.selected && !state.showResult.correct) cls += ' cz-opt-wrong'
            else cls += ' cz-opt-dim'
          }
          return (
            <button key={ch} className={cls} onClick={() => handlePick(ch)}>
              {ch}
            </button>
          )
        })}
      </div>

      {state.showResult && (
        <div className="cz-explain">
          {state.showResult.correct ? '✓ 正确！' : '✗ 不对哦'}
          <br />
          {riddle.explanation}
        </div>
      )}
    </div>
  )
}
