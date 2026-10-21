/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import './BottomSheet.css'

// Модальная шторка снизу. Сама анимирует появление/уход и вызывает onClose после анимации.
// Закрытие: тап по затемнению, свайп вниз за «ручку» (или за всю шапку, если dragArea="header"),
// изнутри — const close = useSheetClose(); close().
// Пропсы: top — отступ шторки от верха экрана (px) или 'auto' (по контенту);
//         dark — тёмная Material-шторка; scrim — затемнение фона (по умолчанию true);
//         radius — скругление верха; handle — показывать ручку.
const SheetCtx = createContext(() => {})
export const useSheetClose = () => useContext(SheetCtx)

export default function BottomSheet({
  onClose, children, top = 'auto', dark = false, scrim = true, radius = 28, handle = true,
  className = '', style, zIndex,
}) {
  const [phase, setPhase] = useState('enter') // enter → open → exit
  const [drag, setDrag] = useState(0)
  const start = useRef(null)

  useEffect(() => { const id = requestAnimationFrame(() => setPhase('open')); return () => cancelAnimationFrame(id) }, [])
  const close = useCallback(() => {
    setPhase('exit')
    setTimeout(() => onClose && onClose(), 260)
  }, [onClose])

  const onDown = (e) => { start.current = e.clientY; e.currentTarget.setPointerCapture?.(e.pointerId) }
  const onMove = (e) => { if (start.current != null) setDrag(Math.max(0, e.clientY - start.current)) }
  const onUp = () => { if (start.current == null) return; start.current = null; if (drag > 90) close(); setDrag(0) }

  const sheetStyle = {
    top: top === 'auto' ? 'auto' : top,
    borderRadius: `${radius}px ${radius}px 0 0`,
    transform: phase === 'open' ? `translateY(${drag}px)` : 'translateY(100%)',
    transition: drag ? 'none' : undefined,
    ...style,
  }
  return (
    <SheetCtx.Provider value={close}>
      <div className="bsheet-root" style={{ zIndex }}>
        {scrim && <div className={`bsheet-scrim ${phase === 'open' ? 'is-open' : ''}`} onClick={close} />}
        <div className={`bsheet ${dark ? 'bsheet--dark' : ''} ${className}`} style={sheetStyle} role="dialog">
          {handle && (
            <div className="bsheet__handle-zone" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
              <div className="bsheet__handle" />
            </div>
          )}
          {children}
        </div>
      </div>
    </SheetCtx.Provider>
  )
}
