import { NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/db/schema'

export async function GET() {
  const settings = await readJson('website_settings.json')
  return NextResponse.json(settings)
}

export async function POST(request: Request) {
  const body = await request.json()
  await writeJson('website_settings.json', body)
  return NextResponse.json(body)
} 