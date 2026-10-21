// Material Icons (как во Flutter: Icons.x / Icons.x_outlined / Icons.x_rounded).
// <Icon name="favorite" variant="outlined" size={24} color="#fff" />
const CLASS = { filled: 'material-icons', outlined: 'material-icons-outlined', round: 'material-icons-round' }

export default function Icon({ name, variant = 'filled', size = 24, color, style, className = '', ...rest }) {
  return (
    <span
      aria-hidden="true"
      className={`${CLASS[variant] || CLASS.filled} ${className}`}
      style={{ fontSize: size, width: size, height: size, lineHeight: 1, color, letterSpacing: 0, userSelect: 'none', flexShrink: 0, ...style }}
      {...rest}
    >
      {name}
    </span>
  )
}
