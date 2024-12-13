import { useAppDispatch, useAppSelector } from '@renderer/hooks/store'
import { createNote, loadNotes, setActiveNote } from '@renderer/store/noteSlice'
import { cn } from '@renderer/utils'
import { format } from 'date-fns'
import { ChevronLeft, FileText, Plus, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => {
  return (
    <div className="group relative">
      {children}
      <div
        className="pointer-events-none absolute left-16 top-1/2 -translate-y-1/2 opacity-0
                    group-hover:opacity-100 transition-opacity duration-200 z-50"
      >
        <div
          className="bg-zinc-800 text-zinc-200 px-3 py-1.5 rounded-lg whitespace-nowrap
                      text-sm shadow-lg border border-zinc-700"
        >
          {content}
        </div>
      </div>
    </div>
  )
}

const Sidebar = () => {
  const dispatch = useAppDispatch()
  const notes = useAppSelector((state) => state.notes.notes)
  const activeNoteId = useAppSelector((state) => state.notes.activeNoteId)
  const loading = useAppSelector((state) => state.notes.loading)
  const [search, setSearch] = useState('')
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    void dispatch(loadNotes())
  }, [dispatch])

  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => note.title.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
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
      <div
        className={cn(
          'bg-zinc-900/95 border-r border-zinc-800 flex items-center justify-center',
          isCollapsed ? 'w-[80px]' : 'w-[300px]'
        )}
      >
        <div className="text-zinc-400 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
          {!isCollapsed && <span>Loading...</span>}
        </div>
      </div>
    )
  }

  return (
    <aside
      className={cn(
        'bg-zinc-900/95 border-r border-zinc-800 flex flex-col h-full transition-all duration-300',
        isCollapsed ? 'w-[80px]' : 'w-[300px]'
      )}
    >
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <FileText className="text-indigo-400" size={24} />
              <h1 className="text-xl font-semibold text-zinc-100">Notes</h1>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ChevronLeft
              className={cn('text-zinc-400 transition-transform', isCollapsed && 'rotate-180')}
              size={20}
            />
          </button>
        </div>
        {!isCollapsed ? (
          <button
            onClick={handleCreateNote}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg
                     flex items-center justify-center gap-2 transition-all duration-200
                     shadow-lg shadow-indigo-900/20 hover:shadow-indigo-900/40 font-medium"
          >
            <Plus size={18} />
            New Note
          </button>
        ) : (
          <Tooltip content="New Note">
            <button
              onClick={handleCreateNote}
              className="w-full aspect-square bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg
                       flex items-center justify-center transition-all duration-200
                       shadow-lg shadow-indigo-900/20 hover:shadow-indigo-900/40"
            >
              <Plus size={24} />
            </button>
          </Tooltip>
        )}
      </div>

      {!isCollapsed && (
        <div className="p-4 border-b border-zinc-800">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-zinc-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-800/50 text-zinc-100 rounded-lg
                       border border-zinc-700 focus:border-indigo-500 focus:ring-1
                       focus:ring-indigo-500 placeholder-zinc-400 transition-all duration-200"
            />
          </div>
        </div>
      )}

      <div
        className={cn(
          'flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700',
          'scrollbar-track-zinc-800 hover:scrollbar-thumb-zinc-600'
        )}
      >
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2">
            <FileText size={24} />
            {!isCollapsed && (
              <span className="text-sm">{search ? 'No matching notes found' : 'No notes yet'}</span>
            )}
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => dispatch(setActiveNote(note.id))}
                className={cn(
                  'cursor-pointer transition-all duration-200',
                  'hover:bg-zinc-800/50',
                  activeNoteId === note.id && 'bg-zinc-800/75 shadow-md',
                  isCollapsed ? 'p-4' : 'p-4'
                )}
              >
                {isCollapsed ? (
                  <Tooltip content={note.title || 'Untitled Note'}>
                    <div className="flex flex-col items-center gap-2">
                      <FileText
                        size={20}
                        className={cn(
                          'transition-colors',
                          activeNoteId === note.id ? 'text-white' : note.color || 'text-zinc-400'
                        )}
                      />
                      <div
                        className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          activeNoteId === note.id
                            ? 'bg-white'
                            : note.color?.replace('text-', 'bg-') ||
                                'bg-zinc-600 group-hover:bg-zinc-500'
                        )}
                      />
                    </div>
                  </Tooltip>
                ) : (
                  <>
                    <h3 className={cn('font-medium truncate', note.color || 'text-zinc-200')}>
                      {note.title || 'Untitled Note'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-zinc-400">
                        {format(new Date(note.updated_at), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
