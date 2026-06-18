export const FRUITS = [
  '🍎', '🍊', '🍋', '🍇', '🍓', '🫐', '🥝', '🍌', '🍑', '🥭',
]

export function getFruit(typeIndex: number): string {
  return FRUITS[typeIndex % FRUITS.length]
}