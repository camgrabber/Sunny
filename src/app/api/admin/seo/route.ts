import { NextResponse } from 'next/server'
import { readJson, writeJson } from '@/lib/db/schema'

export async function GET() {
  const settings = await readJson('website_settings.json')
  return NextResponse.json(settings)
}

export async function POST(request: Request) {
  const body = await request.json()
  // Merge with existing settings
  const current = await readJson('website_settings.json') || {}
  const updated = { ...current, ...body }
  await writeJson('website_settings.json', updated)
  return NextResponse.json(updated)
} 