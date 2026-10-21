import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './NewCollectionDialog.css'

export default function NewCollectionDialog({ onCancel, onCreate }) {
  const [name, setName] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    const id = requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }))
    return () => cancelAnimationFrame(id)
  }, [])

  const submit = (event) => {
    event.preventDefault()
    const trimmed = name.trim()
    if (trimmed) onCreate(trimmed)
  }

  const dialog = (
    <div className="newcoll" role="presentation" onPointerDown={(event) => {
      if (event.target === event.currentTarget) onCancel()
    }}>
      <form className="newcoll__panel" role="dialog" aria-modal="true" aria-labelledby="newcoll-title" onSubmit={submit}>
        <h2 id="newcoll-title" className="newcoll__title">Новая подборка</h2>
        <label className="newcoll__field">
          <span>Название</span>
          <input
            ref={inputRef}
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-label="Название подборки"
          />
        </label>
        <div className="newcoll__actions">
          <button type="button" className="newcoll__cancel" onClick={onCancel}>Отмена</button>
          <button type="submit" className="newcoll__create">Создать</button>
        </div>
      </form>
    </div>
  )

  return createPortal(dialog, document.querySelector('.device__screen') || document.body)
}
