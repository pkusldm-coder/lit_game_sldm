import type { FC } from 'react'

const TILE_COLORS: Record<number, { bg: string; text: string }> = {
  2: { bg: '#eee4da', text: '#776e65' },
  4: { bg: '#ede0c8', text: '#776e65' },
  8: { bg: '#f2b179', text: '#f9f6f2' },
  16: { bg: '#f59563', text: '#f9f6f2' },
  32: { bg: '#f67c5f', text: '#f9f6f2' },
  64: { bg: '#f65e3b', text: '#f9f6f2' },
  128: { bg: '#edcf72', text: '#f9f6f2' },
  256: { bg: '#edcc61', text: '#f9f6f2' },
  512: { bg: '#edc850', text: '#f9f6f2' },
  1024: { bg: '#edc53f', text: '#f9f6f2' },
  2048: { bg: '#edc22e', text: '#f9f6f2' },
}

interface TileProps {
  value: number
  row: number
  col: number
  gridSize: number
  isNew?: boolean
  isMerged?: boolean
}

const Tile: FC<TileProps> = ({ value, row, col, gridSize, isNew, isMerged }) => {
  if (value === 0) return null

  const colors = TILE_COLORS[value] ?? { bg: '#3c3a32', text: '#f9f6f2' }

  const fontSize = value >= 1000
    ? gridSize <= 4 ? '1.2em' : '1em'
    : value >= 100
      ? gridSize <= 4 ? '1.5em' : '1.3em'
      : gridSize <= 4 ? '2em' : '1.6em'

  return (
    <div
      className={`tile${isNew ? ' tile-new' : ''}${isMerged ? ' tile-merged' : ''}`}
      style={{
        gridRow: row + 1,
        gridColumn: col + 1,
        background: colors.bg,
        color: colors.text,
        fontSize,
      }}
      data-value={value}
    >
      {value}
    </div>
  )
}

export default Tile