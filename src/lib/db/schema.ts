import fs from 'fs/promises'
import path from 'path'

const storageDir = path.resolve(process.cwd(), 'storage')

export async function readJson(file: string) {
  const filePath = path.join(storageDir, file)
  try {
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data)
  } catch {
    return null
  }
}

export async function writeJson(file: string, data: any) {
  const filePath = path.join(storageDir, file)
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
} 