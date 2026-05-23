import { useEffect, useRef } from 'react'

export interface Keys {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
}

export function useKeyboard() {
  const keys = useRef<Keys>({ up: false, down: false, left: false, right: false })

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp')    { e.preventDefault(); keys.current.up    = true }
      if (e.key === 'ArrowDown')  { e.preventDefault(); keys.current.down  = true }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); keys.current.left  = true }
      if (e.key === 'ArrowRight') { e.preventDefault(); keys.current.right = true }
    }
    const onUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp')    keys.current.up    = false
      if (e.key === 'ArrowDown')  keys.current.down  = false
      if (e.key === 'ArrowLeft')  keys.current.left  = false
      if (e.key === 'ArrowRight') keys.current.right = false
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  return keys
}
