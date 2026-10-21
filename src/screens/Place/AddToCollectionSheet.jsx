import { useState } from 'react'
import { useApp } from '../../app/AppContext.jsx'
import BottomSheet, { useSheetClose } from '../../components/BottomSheet.jsx'
import Icon from '../../components/Icon.jsx'
import NewCollectionDialog from './NewCollectionDialog.jsx'
import './AddToCollectionSheet.css'

function SheetContent({ placeId }) {
  const { collections, addToCollection, createCollection, closeAll } = useApp()
  const closeSheet = useSheetClose()
  const [creating, setCreating] = useState(false)

  const addExisting = (collectionId) => {
    addToCollection(collectionId, placeId)
    closeSheet()
  }

  const create = (name) => {
    createCollection(name, placeId)
    setCreating(false)
    closeAll()
  }

  return (
    <>
      <h1 className="addcoll__title">Добавить в подборку</h1>
      <div className="addcoll__list no-scrollbar">
        <button type="button" className="addcoll-new" onClick={() => setCreating(true)}>
          <span className="addcoll-new__icon"><Icon name="add" size={30} color="#4F3FE8" /></span>
          <span>Создать новую подборку</span>
        </button>

        {collections.map((collection) => {
          const alreadyAdded = collection.placeIds.includes(placeId)
          return (
            <button
              key={collection.id}
              type="button"
              className="addcoll-row"
              onClick={() => addExisting(collection.id)}
            >
              <span className="addcoll-row__icon">
                <Icon name="folder" variant="round" size={25} color="#4F3FE8" />
              </span>
              <span className="addcoll-row__text">
                <b>{collection.name}</b>
                <small>{collection.placeIds.length} мест</small>
              </span>
              {alreadyAdded && <Icon name="check" variant="round" size={22} color="#4F3FE8" />}
            </button>
          )
        })}
      </div>

      {creating && (
        <NewCollectionDialog
          onCancel={() => setCreating(false)}
          onCreate={create}
        />
      )}
    </>
  )
}

export default function AddToCollectionSheet({ param, onClose }) {
  return (
    <BottomSheet onClose={onClose} top={336} radius={28} handle className="addcoll-sheet">
      <SheetContent placeId={param} />
    </BottomSheet>
  )
}
