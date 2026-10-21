// Мини-хранилище: выбрано ли местоположение (после «Готово» в LocationPicker таблетка «Уточнить» скрывается).
import { useSyncExternalStore } from 'react'

let located = false
const subs = new Set()
export const setLocated = (v) => { located = v; subs.forEach((f) => f()) }
const subscribe = (f) => { subs.add(f); return () => subs.delete(f) }
export const useLocated = () => useSyncExternalStore(subscribe, () => located)
