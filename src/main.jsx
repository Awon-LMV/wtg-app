import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import 'material-icons/iconfont/filled.css'
import 'material-icons/iconfont/outlined.css'
import 'material-icons/iconfont/round.css'
import 'leaflet/dist/leaflet.css'
import './styles/tokens.css'
import './styles/base.css'
import { AppProvider } from './app/AppContext.jsx'
import App from './app/App.jsx'
import RedesignApp from './redesign/RedesignApp.jsx'

// Исходные экраны доступны отдельно для сравнения портфолио-кейса.
const OriginalMode = new URLSearchParams(window.location.search).get('design') === 'original'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      {OriginalMode ? <App /> : <RedesignApp />}
    </AppProvider>
  </StrictMode>,
)
