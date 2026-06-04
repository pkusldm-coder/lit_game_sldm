import { useGame } from './hooks/useGame'
import { LEVELS } from './core/levels'
import Header from './components/Header'
import GameBoard from './components/GameBoard'
import WinOverlay from './components/WinOverlay'
import LevelSelect from './components/LevelSelect'
import './App.css'

function App() {
  const { state, showLevelSelect, setShowLevelSelect, handlePointerDown, handlePointerMove, handlePointerUp, nextLevel, resetLevel, startLevel } = useGame()

  return (
    <div className="fg-app">
      <Header
        level={state.level}
        moves={state.moves}
        onLevelSelect={() => setShowLevelSelect(true)}
        onReset={resetLevel}
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
    </div>
  )
}

export default App
