import { decrypt } from './auth'

export async function verifyAuth(request: Request): Promise<boolean> {
  try {
    const cookieHeader = request.headers.get('cookie') || ''
    const match = cookieHeader.match(/session=([^;]+)/)
    if (!match) return false
    await decrypt(match[1])
    return true
  } catch {
    return false
  }
}
