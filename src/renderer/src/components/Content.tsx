import { useAppDispatch, useAppSelector } from '@renderer/hooks/store'
import { deleteNote, updateNote } from '@renderer/store/noteSlice'
import { cn } from '@renderer/utils'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import debounce from 'lodash.debounce'
import {
  Bold,
  Heading,
  Italic,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo,
  Strikethrough,
  Trash2,
  Undo
} from 'lucide-react'
import { useEffect, useMemo } from 'react'

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  children: React.ReactNode
}

const ToolbarButton = ({ onClick, isActive, disabled, children }: ToolbarButtonProps) => {
  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
      disabled={disabled}
      className={cn(
        'p-2 text-sm rounded-lg transition-colors',
        isActive ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  )
}

const Content = () => {
  const dispatch = useAppDispatch()
  const activeNoteId = useAppSelector((state) => state.notes.activeNoteId)
  const notes = useAppSelector((state) => state.notes.notes)
  const loading = useAppSelector((state) => state.notes.loading)
  const activeNote = notes.find((note) => note.id === activeNoteId)

  const debouncedUpdate = useMemo(
    () =>
      debounce((content: string) => {
        if (activeNoteId && activeNote) {
          void dispatch(
            updateNote({
              id: activeNoteId,
              data: {
                ...activeNote,
                content,
                updated_at: new Date()
              }
            })
          )
            .unwrap()
            .catch((error) => {
              console.error('Failed to update note content:', error)
            })
        }
      }, 500),
    [activeNoteId, activeNote, dispatch]
  )

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: {
          depth: 10,
          newGroupDelay: 300
        }
      }),
      Placeholder.configure({
        placeholder: 'Start writing...'
      })
    ],
    content: activeNote?.content,
    editable: true,
    autofocus: false,
    onCreate: ({ editor }) => {
      editor.setOptions({ editable: true })
    },
    onFocus: ({ event }) => {
      event.preventDefault()
      event.stopPropagation()
    }
  })

  useEffect(() => {
    if (editor && activeNote) {
      if (editor.getHTML() !== activeNote.content) {
        editor.commands.setContent(activeNote.content || '')
      }
    }
  }, [activeNote, editor])

  useEffect(() => {
    if (!editor) {
      return
    }

    const updateListener = editor.on('update', ({ editor }) => {
      debouncedUpdate(editor.getHTML())
      //editor.commands.focus('end')
    })

    return () => {
      updateListener.destroy()
      debouncedUpdate.cancel()
    }
  }, [editor, debouncedUpdate])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const newTitle = e.target.value
    if (activeNoteId && activeNote) {
      dispatch(
        updateNote({
          id: activeNoteId,
          data: {
            ...activeNote,
            title: newTitle,
            updated_at: new Date()
          }
        })
      ).catch((error) => {
        console.error('Failed to update note title:', error)
      })
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation()
    // Prevent enter key from creating a new line in the editor
    if (e.key === 'Enter') {
      e.preventDefault()
    }
  }

  const handleDeleteNote = async () => {
    if (activeNoteId) {
      if (window.confirm('Are you sure you want to delete this note?')) {
        try {
          await dispatch(deleteNote(activeNoteId)).unwrap()
        } catch (error) {
          console.error('Failed to delete note:', error)
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-900">
        <div className="text-zinc-400">Loading...</div>
      </div>
    )
  }

  if (!activeNote) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-900">
        <p className="text-zinc-500">Select a note or create a new one</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-zinc-900">
      {/* Toolbar */}
      <div className="h-16 border-b border-zinc-800 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBold().run()}
            isActive={editor?.isActive('bold')}
          >
            <Bold size={18} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            isActive={editor?.isActive('italic')}
          >
            <Italic size={18} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            isActive={editor?.isActive('strike')}
          >
            <Strikethrough size={18} />
          </ToolbarButton>

          <div className="h-6 w-px bg-zinc-800 mx-2" />

          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor?.isActive('heading', { level: 2 })}
          >
            <Heading size={18} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            isActive={editor?.isActive('bulletList')}
          >
            <List size={18} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            isActive={editor?.isActive('orderedList')}
          >
            <ListOrdered size={18} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            isActive={editor?.isActive('blockquote')}
          >
            <Quote size={18} />
          </ToolbarButton>

          <ToolbarButton onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
            <Minus size={18} />
          </ToolbarButton>

          <div className="h-6 w-px bg-zinc-800 mx-2" />

          <ToolbarButton
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo()}
          >
            <Undo size={18} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
          >
            <Redo size={18} />
          </ToolbarButton>
        </div>

        <button
          onClick={handleDeleteNote}
          className="px-4 py-2 text-sm flex items-center gap-2 text-red-400
                   hover:bg-red-950 hover:text-red-300 rounded-lg transition-colors"
        >
          <Trash2 size={18} />
          Delete
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto">
        <div className=" mx-auto p-8">
          <div className="mb-8">
            <input
              type="text"
              value={activeNote.title || ''}
              onChange={handleTitleChange}
              onKeyDown={handleTitleKeyDown}
              onClick={(e) => e.stopPropagation()}
              placeholder="Note Title"
              className="w-full text-3xl font-bold bg-transparent border-none
                       text-zinc-100 placeholder-zinc-600 focus:outline-none"
              autoComplete="off"
              spellCheck="false"
            />
          </div>
          <EditorContent
            editor={editor}
            className="prose prose-invert prose-zinc max-w-none"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    </div>
  )
}

export default Content