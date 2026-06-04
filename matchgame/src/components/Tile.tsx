import type { FC } from 'react'
import { getFruit } from '../core/emoji'
import './Tile.css'

interface MatchTileProps {
  type: number
  selected: boolean
  onClick: () => void
}

const MatchTile: FC<MatchTileProps> = ({ type, selected, onClick }) => {
  return (
    <div
      className={`mg-tile${selected ? ' selected' : ''}`}
      onClick={onClick}
    >
      <span className="mg-tile-fruit">{getFruit(type)}</span>
    </div>
  )
}

export default MatchTile
