import { useEffect, useState } from 'react'
import './PhoneFrame.css'

// На десктопе — телефон 390×844 по центру, ужатый под высоту окна.
// На телефоне (ширина < 500) — во весь экран без рамки.
export default function PhoneFrame({ children, notch = true, className = '' }) {
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const fit = () => setScale(Math.min(1, (window.innerHeight - 32) / 868, (window.innerWidth - 32) / 414))
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])
  return (
    <div className={`stage ${className}`}>
      <div className="device" style={{ '--device-scale': scale }}>
        <div className="device__screen" id="screen">
          {children}
          {notch && <div className="device__notch" aria-hidden="true" />}
        </div>
      </div>
    </div>
  )
}
