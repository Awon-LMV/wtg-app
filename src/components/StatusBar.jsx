import './StatusBar.css'

// Статус-бар iOS. tone: 'light' — белый текст (как на большинстве экранов оригинала), 'dark' — чёрный.
export default function StatusBar({ tone = 'light', time = '06:25' }) {
  return (
    <div className={`statusbar statusbar--${tone}`} aria-hidden="true">
      <span className="statusbar__time">{time}</span>
      <span className="statusbar__right">
        <svg width="18" height="11" viewBox="0 0 18 11"><g fill="currentColor" opacity=".45">
          <circle cx="2" cy="8.5" r="1.6" /><circle cx="6.5" cy="8.5" r="1.6" /><circle cx="11" cy="8.5" r="1.6" /><circle cx="15.5" cy="8.5" r="1.6" /></g></svg>
        <svg width="17" height="12" viewBox="0 0 17 12"><path fill="currentColor" d="M8.5 2.3c2.4 0 4.6.9 6.3 2.5l1.2-1.2A10.5 10.5 0 0 0 8.5.6 10.5 10.5 0 0 0 1 3.6l1.2 1.2a8.8 8.8 0 0 1 6.3-2.5Zm0 3.4c1.4 0 2.8.5 3.8 1.5l1.2-1.2a7.1 7.1 0 0 0-10 0l1.2 1.2c1-1 2.4-1.5 3.8-1.5Zm0 3.4c-.5 0-1 .2-1.4.6l1.4 1.5 1.4-1.5c-.4-.4-.9-.6-1.4-.6Z"/></svg>
        <svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.8" fill="none" stroke="currentColor" opacity=".4"/><rect x="2" y="2" width="20" height="9" rx="2.5" fill="currentColor"/><path d="M25 4.3v4.4c.9-.3 1.5-1.2 1.5-2.2s-.6-1.9-1.5-2.2Z" fill="currentColor" opacity=".45"/></svg>
      </span>
    </div>
  )
}
