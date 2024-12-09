import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { NoteTypes } from '@renderer/types'
import { nanoid } from 'nanoid'
import { api } from '@renderer/utils/api'

interface NotesState {
  notes: NoteTypes[]
  activeNoteId: string | null
  loading: boolean
  error: string | null
}

const initialState: NotesState = {
  notes: [],
  activeNoteId: null,
  loading: false,
  error: null
}

// Error handling utility
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message
  return String(error)
}

export const loadNotes = createAsyncThunk('notes/loadNotes', async () => {
  const response = await api.loadNotes()
  return response
})

export const createNote = createAsyncThunk('notes/createNote', async () => {
  const newNote: NoteTypes = {
    id: nanoid(),
    title: 'Untitled',
    content: '',
    created_at: new Date(),
    updated_at: new Date()
  }
  await api.saveNote(newNote)
  return newNote
})

export const updateNote = createAsyncThunk(
  'notes/updateNote',
  async ({ id, data }: { id: string; data: Partial<NoteTypes> }, { getState }) => {
    const state = getState() as { notes: NotesState }
    const existingNote = state.notes.notes.find((note) => note.id === id)
    if (!existingNote) {
      throw new Error('Note not found')
    }

    const updatedNote = {
      ...existingNote,
      ...data,
      updated_at: new Date()
    }

    await api.saveNote(updatedNote)
    return updatedNote
  }
)

export const deleteNote = createAsyncThunk('notes/deleteNote', async (noteId: string) => {
  await api.deleteNote(noteId)
  return noteId
})

const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    setActiveNote: (state, action: PayloadAction<string>) => {
      state.activeNoteId = action.payload
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    // Load Notes
    builder
      .addCase(loadNotes.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loadNotes.fulfilled, (state, action) => {
        state.notes = action.payload
        state.loading = false
        if (!state.activeNoteId && action.payload.length > 0) {
          state.activeNoteId = action.payload[0].id
        }
      })
      .addCase(loadNotes.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || 'Failed to load notes'
      })

    // Create Note
    builder
      .addCase(createNote.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.notes.unshift(action.payload)
        state.activeNoteId = action.payload.id
        state.loading = false
      })
      .addCase(createNote.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || 'Failed to create note'
      })

    // Update Note
    builder
      .addCase(updateNote.pending, (state) => {
        state.error = null
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        const index = state.notes.findIndex((note) => note.id === action.payload.id)
        if (index !== -1) {
          state.notes[index] = action.payload
        }
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.error = (action.payload as string) || 'Failed to update note'
      })

    // Delete Note
    builder
      .addCase(deleteNote.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.notes = state.notes.filter((note) => note.id !== action.payload)
        state.activeNoteId = state.notes[0]?.id ?? null
        state.loading = false
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || 'Failed to delete note'
      })
  }
})

// Selectors
export const selectNotes = (state: { notes: NotesState }) => state.notes.notes
export const selectActiveNote = (state: { notes: NotesState }) =>
  state.notes.notes.find((note) => note.id === state.notes.activeNoteId)
export const selectIsLoading = (state: { notes: NotesState }) => state.notes.loading
export const selectError = (state: { notes: NotesState }) => state.notes.error

export const { setActiveNote, clearError } = notesSlice.actions
export default notesSlice.reducer
