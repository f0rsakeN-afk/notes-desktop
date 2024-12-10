import { useAppDispatch, useAppSelector } from '@renderer/hooks/store'
import { createNote, loadNotes, setActiveNote } from '@renderer/store/noteSlice'
import { cn } from '@renderer/utils'
import { format } from 'date-fns'
import { Plus, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

const Sidebar = () => {
  const dispatch = useAppDispatch()
  const notes = useAppSelector((state) => state.notes.notes)
  const activeNoteId = useAppSelector((state) => state.notes.activeNoteId)
  const loading = useAppSelector((state) => state.notes.loading)
  const [search, setSearch] = useState('')

  useEffect(() => {
    void dispatch(loadNotes())
  }, [dispatch])

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => note.title.toLowerCase().includes(search.toLowerCase()))
  }, [notes, search])

  const handleCreateNote = async () => {
    try {
      const action = await dispatch(createNote()).unwrap()
      dispatch(setActiveNote(action.id))
    } catch (error) {
      console.error('Failed to create note:', error)
    }
  }

  if (loading) {
    return (
      <div className="w-72 bg-zinc-900 border-r border-zinc-800 flex items-center justify-center">
        <div className="text-zinc-400">Loading notes...</div>
      </div>
    )
  }

  return (
    <div className="w-72 bg-zinc-900 border-r border-zinc-800 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <h1 className="text-xl font-semibold text-zinc-100">Notes</h1>
        <button
          onClick={handleCreateNote}
          className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg
                   flex items-center justify-center gap-2 transition-colors duration-200"
        >
          <Plus size={16} />
          <span className="font-medium">New Note</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-zinc-800">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full px-4 py-2 bg-zinc-800/50 text-zinc-100 rounded-lg
                     border border-zinc-700 focus:border-indigo-500 focus:ring-1
                     focus:ring-indigo-500 placeholder-zinc-400"
          />
          <Search className="absolute right-3 top-2.5 text-zinc-400" size={18} />
        </div>
      </div>

      {/* Notes List with custom scrollbar */}
      <div
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 
                   scrollbar-track-zinc-800 hover:scrollbar-thumb-zinc-600"
      >
        {filteredNotes.length === 0 ? (
          <div className="p-4 text-center text-zinc-500">
            {search ? 'No notes found' : 'No notes yet'}
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => dispatch(setActiveNote(note.id))}
              className={cn(
                'p-4 border-b border-zinc-800 cursor-pointer transition-colors',
                'hover:bg-zinc-800/50',
                activeNoteId === note.id && 'bg-zinc-800/75'
              )}
            >
              <h3 className="font-medium text-zinc-200 truncate">{note.title || 'New Note'}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-zinc-400">
                  {format(new Date(note.updated_at), 'MMM dd, yyyy HH:mm')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Sidebar