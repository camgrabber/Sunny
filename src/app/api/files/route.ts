import { NextResponse } from 'next/server';
import type { FileItem } from '@/types/file';
import { headers } from 'next/headers';
import storageConfig from '@/config/storage.json';

const BASE_API = "https://www.linkbox.to/api";

function getClientIP(): string {
  const headersList = headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIP = headersList.get('x-real-ip');
  
  if (forwardedFor) {
    const ips = forwardedFor.split(',');
    return ips[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return '127.0.0.1';
}

async function loginToAccount(email: string, password: string, clientIP: string) {
  const params = new URLSearchParams({
    email,
    pwd: password,
    platform: 'web',
    pf: 'web',
    lan: 'en'
  });

  const response = await fetch(`${BASE_API}/user/login_email?${params}`, {
    headers: {
      'X-Forwarded-For': clientIP,
      'X-Real-IP': clientIP
    }
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
  }

  const data = await response.json();
  return data.data;
}

async function getFileList(token: string, pid: string = "0", filterSearch: string = "", clientIP: string, sortField: string = 'utime', sortAsc: string = '0', pageSize: string = '20') {
  const params = new URLSearchParams({
    sortField,
    sortAsc,
    pageNo: '1',
    pageSize,
    isVip: 'true',
    verc: '15004001',
    pid,
    name: filterSearch,
    token,
    platform: 'android',
    pf: 'android',
    lan: 'en'
  });

  const response = await fetch(`${BASE_API}/file/my_file_list/android?${params}`, {
    cache: 'no-store',
    headers: {
      'X-Forwarded-For': clientIP,
      'X-Real-IP': clientIP
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch files');
  }

  const data = await response.json();
  return data.data;
}

async function fetchDriveData(driveName: string, account: { email: string; password: string }, pid: string, filterSearch: string, clientIP: string, sortField: string = 'utime', sortAsc: string = '0', pageSize: string = '20') {
  try {
    console.log(`Fetching data for ${driveName}...`);
    const loginData = await loginToAccount(account.email, account.password, clientIP);
    const fileData = await getFileList(loginData.token, pid, filterSearch, clientIP, sortField, sortAsc, pageSize);

    return {
      files: fileData.list.map((file: any) => ({
        ...file,
        driveName,
        driveToken: loginData.token,
        id: file.type === 'dir' ? `${file.id}` : file.item_id
      })),
      storage: {
        used: Number(loginData.userInfo.size_curr),
        total: Number(loginData.userInfo.size_cap),
        nickname: loginData.nickname
      },
      token: {
        token: loginData.token,
        nickname: loginData.nickname,
        uid: loginData.uid
      }
    };
  } catch (error) {
    console.error(`Error fetching ${driveName}:`, error);
    return {
      files: [],
      storage: { used: 0, total: 0, nickname: 'Error' },
      token: null
    };
  }
}

// Add CORS headers to the response
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function GET(request: Request) {
  try {
    const clientIP = getClientIP();
    const { searchParams } = new URL(request.url);
    const filterSearch = searchParams.get('search') || '';
    const pid = searchParams.get('pid') || '0';
    const sortField = searchParams.get('sort') || 'utime';
    const sortAsc = searchParams.get('order') === 'asc' ? '1' : '0';
    const limit = searchParams.get('limit') || '20';

    // Fetch all drives in parallel
    const drivePromises = Object.entries(storageConfig).map(([driveName, account]) => 
      fetchDriveData(driveName, account, pid, filterSearch, clientIP, sortField, sortAsc, limit)
    );

    const driveResults = await Promise.all(drivePromises);

    const allFiles: FileItem[] = [];
    let totalUsed = 0;
    let totalSize = 0;
    const driveStats: Record<string, { used: number; total: number; nickname: string }> = {};
    const tokens: Record<string, { token: string; nickname: string; uid: number }> = {};

    driveResults.forEach((result, index) => {
      const driveName = Object.keys(storageConfig)[index];
      allFiles.push(...result.files);
      totalUsed += result.storage.used;
      totalSize += result.storage.total;
      driveStats[driveName] = result.storage;
      if (result.token) {
        tokens[driveName] = result.token;
      }
    });

    // Sort files by modification time with proper type checking
    allFiles.sort((a, b) => (b.utime || 0) - (a.utime || 0));

    const response = NextResponse.json({
      success: true,
      data: {
        list: allFiles,
        storage: {
          total: totalSize,
          used: totalUsed,
          drives: driveStats
        },
        tokens
      }
    });

    return addCorsHeaders(response);
  } catch (error) {
    console.error('Files fetch error:', error);
    const response = NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

// Add OPTIONS handler for CORS preflight requests
export async function OPTIONS(request: Request) {
  const response = new NextResponse(null, { status: 204 });
  return addCorsHeaders(response);
}