import type { Direction } from '../core/types'

const KEY_MAP: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
}

export function mapKeyToDirection(key: string): Direction | null {
  return KEY_MAP[key] ?? null
}

export function getSwipeDirection(
  dx: number,
  dy: number,
  threshold = 30,
): Direction | null {
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)
  if (absDx < threshold && absDy < threshold) return null

  if (absDx > absDy) return dx > 0 ? 'right' : 'left'
  return dy > 0 ? 'down' : 'up'
}