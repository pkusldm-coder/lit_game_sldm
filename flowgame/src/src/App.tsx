import { useState } from 'react'
import { useGame } from './hooks/useGame'
import { LEVELS } from './core/levels'
import Header from './components/Header'
import GameBoard from './components/GameBoard'
import WinOverlay from './components/WinOverlay'
import LevelSelect from './components/LevelSelect'
import RulesModal from './components/RulesModal'
import './App.css'

const RULES = [
  '点击一个彩色端点开始绘制管道',
  '拖动到相邻格子延伸管道',
  '将同色的两个端点连接起来',
  '管道不能交叉或重叠',
  '所有格子必须被管道填满',
  '所有颜色都连接且格子填满即获胜',
  '拖动到已连接的管道上可撤销最后一段',
]

function App() {
  const { state, showLevelSelect, setShowLevelSelect, handlePointerDown, handlePointerMove, handlePointerUp, nextLevel, resetLevel, startLevel } = useGame()
  const [showRules, setShowRules] = useState(false)

  return (
    <div className="fg-app">
      <Header
        level={state.level}
        moves={state.moves}
        onLevelSelect={() => setShowLevelSelect(true)}
        onReset={resetLevel}
        onRules={() => setShowRules(true)}
      />
      <GameBoard
        board={state.board}
        gridSize={state.gridSize}
        colors={state.colors}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      {state.won && (
        <WinOverlay
          level={state.level}
          hasNext={state.level < LEVELS.length}
          onNext={nextLevel}
          onRetry={resetLevel}
        />
      )}
      {showLevelSelect && (
        <LevelSelect
          currentIndex={state.level - 1}
          onSelect={startLevel}
          onClose={() => setShowLevelSelect(false)}
        />
      )}
      {showRules && (
        <RulesModal
          title="数连规则"
          rules={RULES}
          onClose={() => setShowRules(false)}
        />
      )}
    </div>
  )
}

export default App
