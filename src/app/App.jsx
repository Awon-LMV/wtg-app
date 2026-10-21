import PhoneFrame from '../components/PhoneFrame.jsx'
import StatusBar from '../components/StatusBar.jsx'
import TabBar from '../components/TabBar.jsx'
import { useApp } from './AppContext.jsx'

import MapScreen from '../screens/Map/MapScreen.jsx'
import LocationModal from '../screens/Map/LocationModal.jsx'
import LocationPicker from '../screens/Map/LocationPicker.jsx'
import PlaceSheet from '../screens/Place/PlaceSheet.jsx'
import AddToCollectionSheet from '../screens/Place/AddToCollectionSheet.jsx'
import AfishaScreen from '../screens/Afisha/AfishaScreen.jsx'
import CollectionsScreen from '../screens/Collections/CollectionsScreen.jsx'
import CollectionSheet from '../screens/Collections/CollectionSheet.jsx'
import ProfileScreen from '../screens/Profile/ProfileScreen.jsx'
import SettingsSheet from '../screens/Profile/SettingsSheet.jsx'
import WtgSearch from '../screens/Wtg/WtgSearch.jsx'
import WtgResults from '../screens/Wtg/WtgResults.jsx'

// Реестр оверлеев. push('place', 'amarcord') откроет PlaceSheet c param='amarcord'.
// statusBar — цвет статус-бара, когда оверлей сверху.
const OVERLAYS = {
  locationModal: { component: LocationModal, statusBar: 'light' },
  locationPicker: { component: LocationPicker, statusBar: 'light' },
  place: { component: PlaceSheet, statusBar: 'light' },
  addToCollection: { component: AddToCollectionSheet, statusBar: 'light' },
  collection: { component: CollectionSheet, statusBar: 'dark' },
  profile: { component: ProfileScreen, statusBar: 'light' },
  settings: { component: SettingsSheet, statusBar: 'light' },
  wtg: { component: WtgSearch, statusBar: 'light' },
  wtgResults: { component: WtgResults, statusBar: 'light' },
}

const TAB_SCREENS = { map: MapScreen, collections: CollectionsScreen, afisha: AfishaScreen }

export default function App() {
  const { tab, stack, pop, push } = useApp()
  const top = stack[stack.length - 1]
  const tone = top ? OVERLAYS[top.type]?.statusBar || 'light' : 'light'

  return (
    <PhoneFrame>
      {Object.keys(TAB_SCREENS).map((id) => {
        const Screen = TAB_SCREENS[id]
        return (
        <div key={id} className="tab-layer" style={{ position: 'absolute', inset: 0, visibility: tab === id ? 'visible' : 'hidden', zIndex: tab === id ? 1 : 0 }}>
          <Screen active={tab === id} />
        </div>
        )
      })}
      <TabBar variant={tab === 'map' ? 'map' : 'plain'} />
      {stack.map((o, i) => {
        const def = OVERLAYS[o.type]
        if (!def) return null
        const C = def.component
        return (
          <div key={o.key} style={{ position: 'absolute', inset: 0, zIndex: 100 + i * 10, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'auto' }}>
              <C param={o.param} onClose={pop} push={push} isTop={i === stack.length - 1} />
            </div>
          </div>
        )
      })}
      <StatusBar tone={tone} />
    </PhoneFrame>
  )
}
