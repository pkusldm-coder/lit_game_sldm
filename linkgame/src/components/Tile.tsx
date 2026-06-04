import type { FC } from 'react'
import type { Tile as TileData } from '../core/types'
import { getEmoji } from '../core/emoji'
import './Tile.css'

interface TileProps {
  tile: TileData
  selected: boolean
  onClick: () => void
}

const Tile: FC<TileProps> = ({ tile, selected, onClick }) => {
  return (
    <div
      className={`lg-tile${selected ? ' selected' : ''}`}
      onClick={onClick}
    >
      <span className="lg-tile-emoji">{getEmoji(tile.type)}</span>
    </div>
  )
}

export default Tile
