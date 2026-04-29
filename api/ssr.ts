import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Readable } from 'node:stream'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const mod = await import('../dist/server/server.js')
    const app = mod.default ?? mod

    const protocol = (req.headers['x-forwarded-proto'] as string) ?? 'https'
    const host = (req.headers['x-forwarded-host'] as string) ?? req.headers.host ?? 'localhost'
    const url = `${protocol}://${host}${req.url}`

    const webRequest = new Request(url, {
      method: req.method,
      headers: req.headers as HeadersInit,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? (req as unknown as BodyInit) : undefined,
    })

    const webResponse = await app.fetch(webRequest)

    res.status(webResponse.status)
    webResponse.headers.forEach((value: string, key: string) => {
      res.setHeader(key, value)
    })

    if (webResponse.body) {
      Readable.fromWeb(webResponse.body as unknown as import('stream/web').ReadableStream).pipe(res)
    } else {
      res.end()
    }
  } catch (err) {
    console.error('SSR ERROR:', err)
    res.status(500).json({ error: String(err) })
  }
}
