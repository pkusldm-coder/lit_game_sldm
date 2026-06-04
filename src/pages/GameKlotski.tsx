import { useEffect } from 'react'
import AppKlotski from '@klotski/App'

export default function GameKlotski() {
  useEffect(() => {
    const prevBg = document.body.style.background
    const prevColor = document.body.style.color
    const prevOverflow = document.body.style.overflow
    const prevTouchAction = document.body.style.touchAction
    const prevUserSelect = document.body.style.userSelect
    document.body.style.background = '#f5f0e8'
    document.body.style.color = '#5a4a3a'
    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'
    document.body.style.userSelect = 'none'
    return () => {
      document.body.style.background = prevBg
      document.body.style.color = prevColor
      document.body.style.overflow = prevOverflow
      document.body.style.touchAction = prevTouchAction
      document.body.style.userSelect = prevUserSelect
    }
  }, [])

  return (
    <div className="klotski">
      <AppKlotski />
    </div>
  )
}
