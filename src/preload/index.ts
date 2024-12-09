import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  invoke: (channel: string, data?: any) => ipcRenderer.invoke(channel, data)
})

export type API = {
  invoke: (channel: string, data?: any) => Promise<any>
}

declare global {
  interface Window {
    api: API
  }
}
