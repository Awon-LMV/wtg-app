import { useEffect, useState } from 'react'
import Icon from '../../components/Icon.jsx'
import { useApp } from '../../app/AppContext.jsx'
import './LocationModal.css'

export default function LocationModal({ onClose }) {
  const { replaceTop } = useApp()
  const [phase, setPhase] = useState('enter') // enter → open → exit

  useEffect(() => { const id = requestAnimationFrame(() => setPhase('open')); return () => cancelAnimationFrame(id) }, [])

  const leave = (after) => { setPhase('exit'); setTimeout(after, 200) }

  return (
    <div className={`locm-root ${phase === 'open' ? 'is-open' : ''}`}>
      <div className="locm-scrim" onClick={() => leave(onClose)} />
      <div className="locm-card" role="dialog" aria-modal="true">
        <div className="locm-icon"><Icon name="location_on" size={34} color="#fff" /></div>
        <h2 className="locm-title">Указать<br />местоположение</h2>
        <p className="locm-sub">Нажмите на карту или введите<br />адрес</p>
        <div className="locm-btns">
          <button className="locm-btn locm-btn--cancel" onClick={() => leave(onClose)}>Отмена</button>
          <button className="locm-btn locm-btn--ok" onClick={() => leave(() => replaceTop('locationPicker'))}>Выбрать</button>
        </div>
      </div>
    </div>
  )
}
