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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const config = await readConfig()
  const drive = config[params.id]
  if (!drive) return new NextResponse('Drive not found', { status: 404 })
  return NextResponse.json({ name: params.id, ...drive })
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const config = await readConfig()
  if (!config[params.id]) return new NextResponse('Drive not found', { status: 404 })
  const body = await request.json() // { name, email, password }
  // If name is changed, delete old and add new
  if (body.name && body.name !== params.id) {
    delete config[params.id]
    config[body.name] = { email: body.email, password: body.password }
  } else {
    config[params.id] = { email: body.email, password: body.password }
  }
  await writeConfig(config)
  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const config = await readConfig()
  if (!config[params.id]) return new NextResponse('Drive not found', { status: 404 })
  delete config[params.id]
  await writeConfig(config)
  return new NextResponse(null, { status: 204 })
} 