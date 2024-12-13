import { ipcMain } from 'electron'
import fs from 'fs/promises'
import path from 'path'
import { app } from 'electron'

const USER_DATA_PATH = path.join(app.getPath('userData'), 'notes')

interface ErrorWithMessage {
  message: string
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  )
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError

  try {
    return new Error(JSON.stringify(maybeError))
  } catch {
    return new Error(String(maybeError))
  }
}

function getErrorMessage(error: unknown) {
  return toErrorWithMessage(error).message
}

async function ensureDataDirectory() {
  try {
    await fs.mkdir(USER_DATA_PATH, { recursive: true })
  } catch (error) {
    console.error('Failed to create data directory:', getErrorMessage(error))
  }
}

export function setupIpcHandlers() {
  ensureDataDirectory()

  // Save note
  ipcMain.handle('save-note', async (_, note) => {
    try {
      const filePath = path.join(USER_DATA_PATH, `${note.id}.json`)
      await fs.writeFile(filePath, JSON.stringify(note, null, 2), 'utf-8')
      return { success: true }
    } catch (error) {
      console.error('Failed to save note:', getErrorMessage(error))
      return { success: false, error: getErrorMessage(error) }
    }
  })

  // Load all notes
  ipcMain.handle('load-notes', async () => {
    try {
      const files = await fs.readdir(USER_DATA_PATH)
      const notes = await Promise.all(
        files
          .filter((file) => file.endsWith('.json'))
          .map(async (file) => {
            const content = await fs.readFile(path.join(USER_DATA_PATH, file), 'utf-8')
            return JSON.parse(content)
          })
      )
      return {
        success: true,
        notes: notes.sort(
          (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )
      }
    } catch (error) {
      console.error('Failed to load notes:', getErrorMessage(error))
      return { success: false, error: getErrorMessage(error) }
    }
  })

  // Delete note
  ipcMain.handle('delete-note', async (_, noteId) => {
    try {
      const filePath = path.join(USER_DATA_PATH, `${noteId}.json`)
      await fs.unlink(filePath)
      return { success: true }
    } catch (error) {
      console.error('Failed to delete note:', getErrorMessage(error))
      return { success: false, error: getErrorMessage(error) }
    }
  })
}
