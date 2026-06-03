import type { Difficulty, RawBoard } from './types'
import { BOARD_SIZE, BOX_SIZE } from './types'
import { solveBoard, countSolutions } from './solver'
import { DIFFICULTY_CONFIG } from './config'

function generateCompleteBoard(): RawBoard {
  const board: RawBoard = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0))

  fillDiagonalBoxes(board)
  return solveBoard(board)!
}

function fillDiagonalBoxes(board: RawBoard): void {
  for (let box = 0; box < BOARD_SIZE; box += BOX_SIZE) {
    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
    let idx = 0
    for (let r = box; r < box + BOX_SIZE; r++) {
      for (let c = box; c < box + BOX_SIZE; c++) {
        board[r][c] = nums[idx++]
      }
    }
  }
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function createPuzzle(difficulty: Difficulty): { puzzle: RawBoard; solution: RawBoard } {
  const solution = generateCompleteBoard()
  const puzzle = solution.map(row => [...row])

  const { cellsToRemove } = DIFFICULTY_CONFIG[difficulty]

  const positions: [number, number][] = []
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      positions.push([r, c])
    }
  }
  shuffle(positions)

  let removed = 0
  for (const [r, c] of positions) {
    if (removed >= cellsToRemove) break
    const backup = puzzle[r][c]
    puzzle[r][c] = 0

    if (countSolutions(puzzle, 2) === 1) {
      removed++
    } else {
      puzzle[r][c] = backup
    }
  }

  return { puzzle, solution }
}
