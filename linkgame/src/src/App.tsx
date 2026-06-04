import { useGame } from './hooks/useGame'
import { getLevelConfig } from './core/level'
import Header from './components/Header'
import GameBoard from './components/GameBoard'
import WinOverlay from './components/WinOverlay'
import LevelSelect from './components/LevelSelect'
import TimeoutOverlay from './components/TimeoutOverlay'
import './App.css'

function App() {
  const { state, shuffled, showLevelSelect, setShowLevelSelect, handleCellClick, nextLevel, handleShuffle, startNewGame, handleRetry } = useGame()
  const config = getLevelConfig(state.level)

  return (
    <div className="link-app">
      <Header
        level={state.level}
        pairsRemaining={state.pairsRemaining}
        timeLeft={state.timeLeft}
        timeLimit={config.timeLimit}
        onHome={() => startNewGame(1)}
        onShuffle={handleShuffle}
        shuffled={shuffled}
        onLevelSelect={() => setShowLevelSelect(true)}
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
    </div>
  )
}

export default App
