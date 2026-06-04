export interface BlockDef {
  id: number
  name: string
  w: number
  h: number
}

export interface Block extends BlockDef {
  row: number
  col: number
}

export type Direction = 'up' | 'down' | 'left' | 'right'

export interface LevelData {
  name: string
  moves: number
  blocks: BlockDef[]
  init: [number, number][]
}

export interface GameState {
  blocks: Block[]
  levelIndex: number
  moves: number
  won: boolean
  selectedId: number | null
}
