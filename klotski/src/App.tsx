import { useGame } from './hooks/useGame'
import { LEVELS } from './core/levels'
import Header from './components/Header'
import GameBoard from './components/GameBoard'
import WinOverlay from './components/WinOverlay'
import LevelSelect from './components/LevelSelect'
import './App.css'

function App() {
  const { state, showLevelSelect, setShowLevelSelect, handleSelect, handleMove, resetLevel, nextLevel, startLevel } = useGame()

  return (
    <div className="kl-app">
      <Header
        levelIndex={state.levelIndex}
        moves={state.moves}
        onLevelSelect={() => setShowLevelSelect(true)}
        onReset={resetLevel}
      />
      <GameBoard
        blocks={state.blocks}
        selectedId={state.selectedId}
        onSelect={handleSelect}
        onMove={handleMove}
      />
      {state.won && (
        <WinOverlay
          levelName={LEVELS[state.levelIndex].name}
          moves={state.moves}
          hasNext={state.levelIndex + 1 < LEVELS.length}
          onNext={nextLevel}
          onRetry={() => startLevel(state.levelIndex)}
        />
      )}
      {showLevelSelect && (
        <LevelSelect
          currentIndex={state.levelIndex}
          onSelect={startLevel}
          onClose={() => setShowLevelSelect(false)}
        />
      )}
    </div>
  )
}

export default App
