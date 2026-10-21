/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'

export function Symbol({ name, size = 22 }) {
  return <Icon name={name} variant="outlined" size={size} />
}

export function IconButton({ label, icon, onClick, children, ...props }) {
  return <button type="button" className="near-icon" aria-label={label} onClick={onClick} {...props}>{children || <Symbol name={icon} />}</button>
}

export function Page({ title, onClose, action, children, footer, className = '' }) {
  return <section className={`near-page ${className}`}>
    <header className="near-header">
      {onClose && <IconButton label="Назад" icon="chevron_left" onClick={onClose} />}
      <h1>{title}</h1>
      {action || <span className="near-header__spacer" />}
    </header>
    <div className="near-scroll no-scrollbar">{children}</div>
    {footer && <footer className="near-footer">{footer}</footer>}
  </section>
}

export function Empty({ title, text, children }) {
  return <div className="near-empty"><h2>{title}</h2>{text && <p>{text}</p>}{children}</div>
}

export function SearchField({ value, onChange, onFocus, onKeyDown, inputRef, placeholder = 'Название или категория', label = 'Поиск мест' }) {
  return <label className="near-search"><Symbol name="search" size={21} /><input ref={inputRef} aria-label={label} placeholder={placeholder} value={value} onFocus={onFocus} onKeyDown={onKeyDown} onChange={event => onChange(event.target.value)} />{value && <button type="button" onClick={() => onChange('')} aria-label="Очистить поиск"><Symbol name="close" size={18} /></button>}</label>
}

export function Chips({ values, selected, onChange, label }) {
  return <div className="near-chips no-scrollbar" aria-label={label}>{values.map(value => <button key={value} type="button" aria-pressed={value === selected} onClick={() => onChange(value)}>{value}</button>)}</div>
}

export function NameDialog({ title, initialValue = '', onCancel, onCreate }) {
  const [name, setName] = useState(initialValue)
  const ref = useRef(null)
  useEffect(() => {
    const previous = document.activeElement
    ref.current?.focus({ preventScroll: true })
    return () => previous?.focus?.({ preventScroll: true })
  }, [])
  return <div className="near-dialog-backdrop" onClick={event => { if (event.target === event.currentTarget) onCancel() }}>
    <form className="near-dialog" role="dialog" aria-modal="true" aria-label={title} onKeyDown={event => {
      if (event.key === 'Escape') onCancel()
      if (event.key === 'Tab') {
        const controls = [...event.currentTarget.querySelectorAll('input, button:not(:disabled)')]
        const next = event.shiftKey ? controls[controls.length - 1] : controls[0]
        if ((event.shiftKey && document.activeElement === controls[0]) || (!event.shiftKey && document.activeElement === controls[controls.length - 1])) { event.preventDefault(); next.focus() }
      }
    }} onSubmit={event => { event.preventDefault(); if (name.trim()) onCreate(name.trim()) }}>
      <h2>{title}</h2>
      <label className="near-field">Название<input ref={ref} value={name} maxLength={80} onChange={event => setName(event.target.value)} /></label>
      <div className="near-dialog__actions"><button type="button" className="near-button near-button--quiet" onClick={onCancel}>Отмена</button><button className="near-button" disabled={!name.trim()}>Сохранить</button></div>
    </form>
  </div>
}

export function countLabel(count, words = ['место', 'места', 'мест']) {
  const n = Math.abs(count) % 100
  return `${count} ${words[n >= 11 && n <= 14 ? 2 : n % 10 === 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 ? 1 : 2]}`
}

export const LocationContext = createContext(null)

export function useDistance(place, fallback = null) {
  const selected = useContext(LocationContext)
  const location = selected || fallback
  if (!location || !place) return null
  const radians = degrees => degrees * Math.PI / 180
  const a = Math.sin(radians(place.lat - location[0]) / 2) ** 2 + Math.cos(radians(place.lat)) * Math.cos(radians(location[0])) * Math.sin(radians(place.lng - location[1]) / 2) ** 2
  const distance = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)))
  if (distance < 1) return `${Math.max(10, Math.round(distance * 100) * 10)} м`
  return `${new Intl.NumberFormat('ru-RU', { maximumFractionDigits: distance < 10 ? 1 : 0 }).format(distance)} км`
}

// Маленькие фото из пинов показываем миниатюрами, не растягиваем до hero.
export function hasLargePhoto(place) {
  return place.photoVerified || ['amarcord', 'staroe-mesto'].includes(place.id)
}
