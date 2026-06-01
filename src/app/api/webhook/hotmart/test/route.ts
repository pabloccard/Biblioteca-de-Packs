import { NextResponse } from 'next/server'

// Test endpoint — injects the real HOTTOK so you can test from the admin UI
// This just proxies to the real webhook route with the correct token
export async function POST(request: Request) {
  const body = await request.json()

  // Inject the real HOTTOK
  body.hottok = process.env.HOTMART_HOTTOK

  // Forward to the real webhook
  const baseUrl = request.url.replace('/api/webhook/hotmart/test', '')
  const res = await fetch(`${baseUrl}/api/webhook/hotmart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
