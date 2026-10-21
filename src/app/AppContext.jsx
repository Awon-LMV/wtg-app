/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

// Навигация: вкладка + стек оверлеев (шторки, модалки, полноэкранные экраны).
// Хеш для прямых ссылок и скриншотов: #/map/place:amarcord/addToCollection:amarcord
const TABS = ['map', 'collections', 'afisha']

function parseHash() {
  const parts = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  const tab = TABS.includes(parts[0]) ? parts[0] : 'map'
  const stack = parts.slice(TABS.includes(parts[0]) ? 1 : 0).map((seg) => {
    const [type, param] = seg.split(':')
    return { type, param: param ? decodeURIComponent(param) : undefined, key: Math.random().toString(36).slice(2) }
  })
  return { tab, stack }
}

function toHash(tab, stack) {
  return '#/' + [tab, ...stack.map((o) => (o.param ? `${o.type}:${encodeURIComponent(o.param)}` : o.type))].join('/')
}

const Ctx = createContext(null)

export function AppProvider({ children }) {
  const initial = useMemo(parseHash, [])
  const [tab, setTabState] = useState(initial.tab)
  const [stack, setStack] = useState(initial.stack)

  // Пользовательские данные (как в оригинале на скриншоте «Коллекции»)
  const [favorites, setFavorites] = useState(['amarcord'])
  const [wantToGo, setWantToGo] = useState(['shlagbaum', 'medved', 'vinokur', 'standup', 'chgk'])
  const [collections, setCollections] = useState([{ id: 'c1', name: 'Любимые кафе', placeIds: ['amarcord'] }])
  const [ratings, setRatings] = useState({})

  useEffect(() => {
    const h = toHash(tab, stack)
    if (window.location.hash !== h) window.history.replaceState(null, '', h)
  }, [tab, stack])

  useEffect(() => {
    const onHash = () => { const p = parseHash(); setTabState(p.tab); setStack(p.stack) }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const push = useCallback((type, param) => setStack((s) => [...s, { type, param, key: Math.random().toString(36).slice(2) }]), [])
  const pop = useCallback(() => setStack((s) => s.slice(0, -1)), [])
  const replaceTop = useCallback((type, param) => setStack((s) => [...s.slice(0, -1), { type, param, key: Math.random().toString(36).slice(2) }]), [])
  const closeAll = useCallback(() => setStack([]), [])
  const setTab = useCallback((t) => { setTabState(t); setStack([]) }, [])

  const toggleFavorite = useCallback((placeId) =>
    setFavorites((f) => (f.includes(placeId) ? f.filter((x) => x !== placeId) : [...f, placeId])), [])
  const toggleWantToGo = useCallback((id) =>
    setWantToGo((w) => (w.includes(id) ? w.filter((x) => x !== id) : [id, ...w])), [])
  const createCollection = useCallback((name, placeId) =>
    setCollections((c) => [...c, { id: 'c' + (c.length + 1) + Date.now(), name, placeIds: placeId ? [placeId] : [] }]), [])
  const addToCollection = useCallback((collectionId, placeId) =>
    setCollections((cs) => cs.map((c) => (c.id === collectionId && !c.placeIds.includes(placeId) ? { ...c, placeIds: [...c.placeIds, placeId] } : c))), [])
  const ratePlace = useCallback((placeId, value) => setRatings((r) => ({ ...r, [placeId]: value })), [])

  const value = {
    tab, setTab, stack, push, pop, replaceTop, closeAll,
    favorites, toggleFavorite, wantToGo, toggleWantToGo,
    collections, createCollection, addToCollection, ratings, ratePlace,
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useApp = () => useContext(Ctx)
