import { useAppDispatch, useAppSelector } from '@renderer/hooks/store'
import { deleteNote, updateNote } from '@renderer/store/noteSlice'
import { cn } from '@renderer/utils'
import Code from '@tiptap/extension-code'
import Heading from '@tiptap/extension-heading'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { motion, AnimatePresence } from 'framer-motion'
import debounce from 'lodash.debounce'
import {
  Bold,
  Code as CodeIcon,
  Heading1,
  Heading2,
  Italic,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Quote,
  Redo,
  Strikethrough,
  Trash2,
  Undo
} from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  children: React.ReactNode
}

const ToolbarButton = ({ onClick, isActive, disabled, children }: ToolbarButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={(e) => {
        e.preventDefault()
        onClick()
      }}
      disabled={disabled}
      className={cn(
        'p-2 text-sm rounded-lg transition-colors select-none',
        isActive ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {children}
    </motion.button>
  )
}

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const Content = () => {
  const dispatch = useAppDispatch()
  const activeNoteId = useAppSelector((state) => state.notes.activeNoteId)
  const notes = useAppSelector((state) => state.notes.notes)
  const loading = useAppSelector((state) => state.notes.loading)
  const activeNote = notes.find((note) => note.id === activeNoteId)
  const titleInputRef = useRef<HTMLInputElement>(null)

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
          ).catch((error) => {
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
      }),
      TaskList,
      TaskItem.configure({
        nested: true
      }),
      Heading.configure({
        levels: [1, 2]
      }),
      Link.configure({
        openOnClick: false
      }),
      Code
    ],
    content: activeNote?.content,
    editable: true,
    autofocus: 'end',
    onUpdate: ({ editor: updatedEditor }) => {
      debouncedUpdate(updatedEditor.getHTML())
    }
  })

  useEffect(() => {
    if (editor && activeNote) {
      if (editor.getHTML() !== activeNote.content) {
        const currentPos = editor.state.selection.$head.pos
        editor.commands.setContent(activeNote.content || '')
        editor.commands.setTextSelection(currentPos)
      }
    }
  }, [activeNote?.id, editor])

  useEffect(() => {
    return () => {
      debouncedUpdate.cancel()
    }
  }, [debouncedUpdate])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (e.key === 'Enter') {
      e.preventDefault()
      editor?.commands.focus('end')
    }
  }

  const handleEditorClick = () => {
    if (!window.getSelection()?.toString()) {
      editor?.commands.focus('end')
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
      <motion.div
        initial="hidden"
        animate="visible"
        variants={contentVariants}
        className="flex-1 flex items-center justify-center bg-zinc-900"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="text-zinc-400"
        >
          Loading...
        </motion.div>
      </motion.div>
    )
  }

  if (!activeNote) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={contentVariants}
        className="flex-1 flex items-center justify-center bg-zinc-900"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-zinc-500"
        >
          Select a note or create a new one
        </motion.p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={contentVariants}
      className="flex-1 flex flex-col bg-zinc-900"
    >
      <motion.div
        layout
        className="h-16 border-b border-zinc-800 px-6 flex items-center justify-between select-none"
      >
        <motion.div layout className="flex items-center space-x-2">
          <AnimatePresence mode="popLayout">
            <motion.div layout className="flex items-center space-x-2">
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

              <motion.div className="h-6 w-px bg-zinc-800 mx-2" />

              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleTaskList().run()}
                isActive={editor?.isActive('taskList')}
              >
                <ListChecks size={18} />
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

              <motion.div className="h-6 w-px bg-zinc-800 mx-2" />

              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor?.isActive('heading', { level: 1 })}
              >
                <Heading1 size={18} />
              </ToolbarButton>

              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor?.isActive('heading', { level: 2 })}
              >
                <Heading2 size={18} />
              </ToolbarButton>

              <ToolbarButton
                onClick={() => {
                  const url = window.prompt('Enter URL')
                  if (url) {
                    editor?.chain().focus().setLink({ href: url }).run()
                  }
                }}
                isActive={editor?.isActive('link')}
              >
                <Link2 size={18} />
              </ToolbarButton>

              <ToolbarButton
                onClick={() => editor?.chain().focus().toggleCode().run()}
                isActive={editor?.isActive('code')}
              >
                <CodeIcon size={18} />
              </ToolbarButton>

              <motion.div className="h-6 w-px bg-zinc-800 mx-2" />

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
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDeleteNote}
          className="px-4 py-2 text-sm flex items-center gap-2 text-red-400
                   hover:bg-red-950 hover:text-red-300 rounded-lg transition-colors select-none"
        >
          <Trash2 size={18} />
          Delete
        </motion.button>
      </motion.div>

      <motion.div layout className="flex-1 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto p-8"
        >
          <motion.div layout className="mb-8">
            <motion.input
              ref={titleInputRef}
              type="text"
              value={activeNote.title || ''}
              onChange={handleTitleChange}
              onKeyDown={handleTitleKeyDown}
              placeholder="Note Title"
              className="w-full text-3xl font-bold bg-transparent border-none
                       text-zinc-100 placeholder-zinc-600 focus:outline-none"
              autoComplete="off"
              spellCheck="false"
            />
          </motion.div>
          <motion.div
            layout
            onClick={handleEditorClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <EditorContent
              editor={editor}
              className="prose prose-invert prose-zinc max-w-none focus:outline-none"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default Content
