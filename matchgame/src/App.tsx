import { useState } from 'react'
import { useGame } from './hooks/useGame'
import Header from './components/Header'
import GameBoard from './components/GameBoard'
import WinOverlay from './components/WinOverlay'
import LevelSelect from './components/LevelSelect'
import RulesModal from './components/RulesModal'
import './App.css'

const RULES = [
  '点击相邻的两个水果交换位置',
  '交换后如果形成 3 个或以上相同水果连成一线（横或竖），即可消除',
  '消除后上方水果会下落，顶部会补充新水果',
  '连续消除会产生连击，分数翻倍',
  '3 连 = 30 分，4 连 = 60 分，5 连及以上 = 100 分',
  '在限定步数内达到目标分数即可过关',
  '步数用完仍未达标则失败',
]

function App() {
  const { state, showLevelSelect, setShowLevelSelect, handleCellClick, nextLevel, handleRetry, startNewGame } = useGame()
  const [showRules, setShowRules] = useState(false)

  return (
    <div className="mg-app">
      <Header
        level={state.level}
        score={state.score}
        targetScore={state.targetScore}
        movesLeft={state.movesLeft}
        onLevelSelect={() => setShowLevelSelect(true)}
        onRules={() => setShowRules(true)}
      />
      <GameBoard
        board={state.board}
        selected={state.selected}
        onCellClick={handleCellClick}
      />
      {(state.won || state.lost) && (
        <WinOverlay
          won={state.won}
          level={state.level}
          score={state.score}
          targetScore={state.targetScore}
          onNextLevel={nextLevel}
          onRetry={handleRetry}
        />
      )}
      {showLevelSelect && (
        <LevelSelect
          onSelect={(level) => startNewGame(level)}
          onClose={() => setShowLevelSelect(false)}
        />
      )}
      {showRules && (
        <RulesModal
          title="消消乐规则"
          rules={RULES}
          onClose={() => setShowRules(false)}
        />
      )}
    </div>
  )
}

export default App
