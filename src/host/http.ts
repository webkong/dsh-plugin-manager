// HTTP 辅助：JSON 响应、请求体读取、loopback 校验

interface ServerResponseLike {
  writeHead(status: number, headers: Record<string, string>): void
  end(payload: string): void
}

/** 是否回环地址（拒绝远程访问） */
export function isLoopback(address: string | undefined): boolean {
  return (
    address === '127.0.0.1' ||
    address === '::1' ||
    address === '::ffff:127.0.0.1' ||
    address === 'localhost'
  )
}

/** JSON 响应 */
export function sendJson(res: ServerResponseLike, status: number, body: unknown): void {
  const payload = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  res.end(payload)
}

/** 错误响应（{ ok:false, error, details? }） */
export function sendError(res: ServerResponseLike, status: number, message: string, details?: unknown): void {
  sendJson(res, status, { ok: false, error: message, ...(details === undefined ? {} : { details }) })
}

/** 读取请求 JSON 体（上限 maxBytes） */
export async function readBody(req: AsyncIterable<Buffer | Uint8Array>, maxBytes = 64 * 1024): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = []
  let total = 0
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    total += buf.length
    if (total > maxBytes) throw new Error('请求体过大')
    chunks.push(buf)
  }
  if (chunks.length === 0) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw new Error('请求体不是合法 JSON')
  }
}
