interface VideoUrls {
  [key: string]: string;
}

// In-memory storage for development and testing
const memoryStorage = {
  websiteSettings: {
    settings: {
      siteName: 'JemPH Cloud Storage',
      description: 'Secure cloud storage solution',
      logo: '/logo.png',
      theme: 'light',
      maxUploadSize: 104857600,
      allowedFileTypes: ['*'],
      maintenance: false,
    },
  },
  cloudDrives: {
    drives: [],
    files: [
      {
        id: 'sample-video',
        name: 'Sample Video.mp4',
        type: 'video',
        size: 1024 * 512, // 512KB
        thumbnail: 'https://i.imgur.com/JyZuFsF.jpg', // Small, optimized thumbnail
        ctime: new Date().toISOString(),
        utime: new Date().toISOString(),
      },
      {
        id: 'sample-audio',
        name: 'Sample Audio.mp3',
        type: 'audio',
        size: 1024 * 256, // 256KB
        thumbnail: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"%3E%3Cpath fill="%234F46E5" d="M12 3v9.28a4.39 4.39 0 0 0-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/%3E%3C/svg%3E',
        ctime: new Date().toISOString(),
        utime: new Date().toISOString(),
      }
    ],
  },
  videoUrls: {
    'sample-video': 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.mp4', // Optimized video URL
    'sample-audio': 'https://cdn.plyr.io/static/demo/Kishi_Bashi_-_It_All_Began_With_a_Burst.mp3' // Optimized audio URL
  } as VideoUrls
};

let isInitialized = false;

export async function readStorage(key: 'websiteSettings' | 'cloudDrives') {
  if (!isInitialized) {
    // Initialize with sample data only once
    isInitialized = true;
  }
  return memoryStorage[key];
}

export async function getVideoUrl(fileId: string): Promise<string | null> {
  return memoryStorage.videoUrls[fileId] || null;
}

export async function writeStorage(
  key: 'websiteSettings' | 'cloudDrives',
  data: any
) {
  memoryStorage[key] = data;
  return true;
} 