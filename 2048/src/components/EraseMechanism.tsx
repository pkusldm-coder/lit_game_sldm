import type { FC } from 'react'
import { ERASER_MAX } from '../core/config'
import './EraseMechanism.css'

interface EraseMechanismProps {
  eraserRemaining: number
  onActivateErase: () => void
}

const EraseMechanism: FC<EraseMechanismProps> = ({ eraserRemaining, onActivateErase }) => {
  const disabled = eraserRemaining <= 0

  return (
    <div className={`erase-mechanism${disabled ? ' disabled' : ''}`}>
      <button
        className="erase-btn"
        onClick={onActivateErase}
        disabled={disabled}
        title="消除一个方块"
      >
        🗑️ 消除 {eraserRemaining}/{ERASER_MAX}
      </button>
    </div>
  )
}

export default EraseMechanism