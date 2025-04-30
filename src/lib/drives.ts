import { CloudDrive } from '@prisma/client'
import { google } from 'googleapis'
import { createClient } from '@supabase/supabase-js'

export async function checkDriveStatus(drive: CloudDrive) {
  try {
    switch (drive.type) {
      case 'GOOGLE_DRIVE':
        const auth = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          process.env.GOOGLE_REDIRECT_URI
        )
        auth.setCredentials({ access_token: drive.accessToken })
        const driveClient = google.drive({ version: 'v3', auth })
        await driveClient.files.list({ pageSize: 1 })
        return { status: 'active', lastChecked: new Date() }

      case 'SUPABASE':
        const supabase = createClient(drive.url, drive.accessToken)
        const { data, error } = await supabase.storage.listBuckets()
        if (error) throw error
        return { status: 'active', lastChecked: new Date() }

      default:
        return { status: 'unknown', lastChecked: new Date() }
    }
  } catch (error) {
    console.error(`Error checking drive status for ${drive.type}:`, error)
    return { status: 'error', lastChecked: new Date() }
  }
} 