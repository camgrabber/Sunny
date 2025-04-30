import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const configPath = path.resolve(process.cwd(), 'src/config/storage.json')

async function readConfig() {
  try {
    const data = await fs.readFile(configPath, 'utf-8')
    return JSON.parse(data)
  } catch {
    return {}
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const config = await readConfig()
  const drive = config[params.id]
  if (!drive) return new NextResponse('Drive not found', { status: 404 })
  // Here you could implement a real status check (e.g., try to connect)
  return NextResponse.json({ status: 'active', lastChecked: new Date().toISOString() })
} 