import { NoteTypes } from '@renderer/types'

export const api = {
  saveNote: async (note: NoteTypes): Promise<void> => {
    const result = await window.api.invoke('save-note', note)
    if (!result.success) {
      throw new Error(result.error)
    }
  },

  loadNotes: async (): Promise<NoteTypes[]> => {
    const result = await window.api.invoke('load-notes')
    if (!result.success) {
      throw new Error(result.error)
    }
    return result.notes
  },

  deleteNote: async (noteId: string): Promise<void> => {
    const result = await window.api.invoke('delete-note', noteId)
    if (!result.success) {
      throw new Error(result.error)
    }
  }
}
