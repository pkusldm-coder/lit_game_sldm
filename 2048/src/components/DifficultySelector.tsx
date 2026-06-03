import type { FC } from 'react'
import type { Difficulty } from '../core/types'
import { DIFFICULTY_CONFIG } from '../core/config'
import './DifficultySelector.css'

interface DifficultySelectorProps {
  current: Difficulty
  onChange: (d: Difficulty) => void
}

const difficulties: Difficulty[] = ['easy', 'normal', 'hard']

const DifficultySelector: FC<DifficultySelectorProps> = ({ current, onChange }) => (
  <div className="difficulty-selector">
    {difficulties.map(d => (
      <button
        key={d}
        className={`diff-btn${d === current ? ' active' : ''}`}
        onClick={() => onChange(d)}
      >
        {DIFFICULTY_CONFIG[d].label}
      </button>
    ))}
  </div>
)

export default DifficultySelector