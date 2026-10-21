import BottomSheet, { useSheetClose } from '../../components/BottomSheet'
import Icon from '../../components/Icon'
import './Settings.css'

function Row({ bg, icon, color, title, sub, onClick }) {
  return (
    <button className="set-row" onClick={onClick}>
      <span className="set-row__tile" style={{ background: bg }}>
        <Icon name={icon} variant="outlined" size={22} color={color} />
      </span>
      <span className="set-row__text">
        <span className="set-row__title">{title}</span>
        <span className="set-row__sub">{sub}</span>
      </span>
      <Icon name="chevron_right" size={24} color="#94A3B8" />
    </button>
  )
}

function Content() {
  const close = useSheetClose()
  return (
    <div className="set-content no-scrollbar">
      <div className="set-head">
        <span className="set-head__icon"><Icon name="settings" size={22} color="#fff" /></span>
        <span className="set-head__title">Настройки</span>
      </div>
      <div className="set-label">ОСНОВНЫЕ</div>
      <div className="set-group">
        <Row bg="#E3F2F7" icon="notifications" color="#06B6D4" title="Уведомления" sub="Push-уведомления приложения" />
        <Row bg="#E3F2EF" icon="help_outline" color="#10B981" title="Помощь" sub="Поддержка и FAQ" />
        <Row bg="#E8E9FD" icon="cloud_download" color="#6366F1" title="Офлайн данные" sub="Управление кэшем" onClick={close} />
      </div>
      <div className="set-label set-label--2">АККАУНТ</div>
      <div className="set-group">
        <Row bg="#FEF3E2" icon="logout" color="#F59E0B" title="Выйти" sub="Выход из аккаунта" />
        <Row bg="#FDE8EA" icon="delete_forever" color="#EF4444" title="Удалить аккаунт" sub="Безвозвратное удаление" />
      </div>
    </div>
  )
}

export default function SettingsSheet({ onClose }) {
  return (
    <BottomSheet onClose={onClose} top={295} radius={28} handle>
      <Content />
    </BottomSheet>
  )
}
