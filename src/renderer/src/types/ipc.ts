export interface IpcResponse<T = any> {
  success: boolean
  error?: string
  data?: T
}
