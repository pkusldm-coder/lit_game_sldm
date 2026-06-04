import { useState } from 'react'
import { useGame } from './hooks/useGame'
import Header from './components/Header'
import GameBoard from './components/GameBoard'
import WinOverlay from './components/WinOverlay'
import LevelSelect from './components/LevelSelect'
import TimeoutOverlay from './components/TimeoutOverlay'
import RulesModal from './components/RulesModal'
import './App.css'

const RULES = [
  '点击两个相同的图案，如果它们可以用不超过 2 个拐角的直线连接，即可消除',
  '连线只能在空白格子上通过，不能穿过其他图案',
  '0 个拐角：同行或同列直接相连',
  '1 个拐角：通过一个拐角连接',
  '2 个拐角：通过两个拐角连接',
  '消除所有图案即可过关',
  '在规定时间内完成，时间耗尽则失败',
  '点击  可重新洗牌（每关限一次）',
]

function App() {
  const { state, shuffled, showLevelSelect, setShowLevelSelect, handleCellClick, nextLevel, handleShuffle, startNewGame, handleRetry } = useGame()
  const [showRules, setShowRules] = useState(false)

  return (
    <div className="link-app">
      <Header
        level={state.level}
        timeLeft={state.timeLeft}
        onHome={() => startNewGame(1)}
        onShuffle={handleShuffle}
        shuffled={shuffled}
        onLevelSelect={() => setShowLevelSelect(true)}
        onRules={() => setShowRules(true)}
      />
      <GameBoard
        board={state.board}
        selected={state.selected}
        path={state.path}
        onCellClick={handleCellClick}
      />
      {state.won && (
        <WinOverlay
          level={state.level}
          onNextLevel={nextLevel}
        />
      )}
      {state.timeout && (
        <TimeoutOverlay
          level={state.level}
          onRetry={handleRetry}
        />
      )}
      {showLevelSelect && (
        <LevelSelect
          onSelect={(level) => {
            startNewGame(level)
            setShowLevelSelect(false)
          }}
          onClose={() => setShowLevelSelect(false)}
        />
      )}
      {showRules && (
        <RulesModal
          title="连连看规则"
          rules={RULES}
          onClose={() => setShowRules(false)}
        />
      )}
    </div>
  )
}

export default App
