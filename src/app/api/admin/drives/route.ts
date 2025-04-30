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

async function writeConfig(data: any) {
  await fs.writeFile(configPath, JSON.stringify(data, null, 2), 'utf-8')
}

export async function GET() {
  const config = await readConfig()
  // Return as an array of { name, email, password }
  const drives = Object.entries(config).map(([name, value]: [string, any]) => ({ name, ...value }))
  return NextResponse.json(drives)
}

export async function POST(request: Request) {
  const body = await request.json() // { name, email, password }
  const config = await readConfig()
  config[body.name] = { email: body.email, password: body.password }
  await writeConfig(config)
  return NextResponse.json({ success: true })
} 