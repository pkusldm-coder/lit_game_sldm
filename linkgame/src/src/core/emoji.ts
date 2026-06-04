export const EMOJI_LIST = [
  '🍎', '🍊', '🍋', '🍇', '🍉', '🍓',
  '🍑', '🍒', '🥝', '🍌', '🍍', '🥭',
  '🌽', '🥕', '🥦', '🥒', '🫑', '🌶️',
  '🥑', '🧅', '🥜', '🫐', '🥥', '🍄',
]

export function getEmoji(typeIndex: number): string {
  return EMOJI_LIST[typeIndex % EMOJI_LIST.length]
}
