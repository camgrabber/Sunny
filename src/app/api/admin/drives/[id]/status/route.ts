import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/db/schema'
import { authOptions } from '@/lib/auth'
import { checkDriveStatus } from '@/lib/drives'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const drive = await prisma.cloudDrive.findUnique({
      where: { id: params.id },
    })

    if (!drive) {
      return new NextResponse('Drive not found', { status: 404 })
    }

    const status = await checkDriveStatus(drive)
    return NextResponse.json({ status })
  } catch (error) {
    console.error('Error checking drive status:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 