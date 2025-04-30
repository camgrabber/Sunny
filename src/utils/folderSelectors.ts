import type { FileItem } from '@/types/file';

export interface CategoryFolders {
  trendingFolder: any;
  recentFolder: any;
  popularFolder: any;
}

export interface CategoryVideos {
  trending: FileItem[];
  recent: FileItem[];
  popular: FileItem[];
}

export async function getCategoryFoldersAndVideos(limit = 50): Promise<CategoryVideos> {
  // 1. Fetch all folders from root
  const rootRes = await fetch(`/api/files?pid=0`);
  const rootData = await rootRes.json();
  if (!rootData.success) throw new Error(rootData.error || 'Failed to fetch root folders');
  const folders = (rootData.data?.list || []).filter((file: FileItem) => file.url === undefined);
  if (folders.length < 3) throw new Error('Not enough folders to assign categories');

  // Find the first folder that has videos, the largest, and the one with most files
  let videoFolder = null;
  let largestFolder = null;
  let largestSize = 0;
  let mostFilesFolder = null;
  let mostFilesCount = 0;
  for (const folder of folders) {
    const res = await fetch(`/api/files?pid=${folder.id}&limit=${limit}`);
    const data = await res.json();
    const videos = (data.data?.list || []).filter((file: FileItem) => file.type === 'video');
    const totalSize = videos.reduce((sum: number, file: FileItem) => sum + (file.size || 0), 0);
    if (videos.length > 0 && !videoFolder) {
      videoFolder = folder;
    }
    if (videos.length > 0 && totalSize > largestSize) {
      largestSize = totalSize;
      largestFolder = folder;
    }
    if (videos.length > mostFilesCount) {
      mostFilesCount = videos.length;
      mostFilesFolder = folder;
    }
  }
  if (!videoFolder) throw new Error('No folder with videos found');
  if (!largestFolder) largestFolder = videoFolder;
  if (!mostFilesFolder) mostFilesFolder = videoFolder;

  // Fetch videos from the selected folders
  const [trendingRes, recentRes, popularRes] = await Promise.all([
    fetch(`/api/files?pid=${videoFolder.id}&limit=${limit}`),
    fetch(`/api/files?pid=${mostFilesFolder.id}&limit=${limit}`),
    fetch(`/api/files?pid=${largestFolder.id}&limit=${limit}`),
  ]);
  const trendingData = await trendingRes.json();
  const recentData = await recentRes.json();
  const popularData = await popularRes.json();
  const trendingVideosList = (trendingData.data?.list || []).filter((file: FileItem) => file.type === 'video');
  const recentVideosList = (recentData.data?.list || []).filter((file: FileItem) => file.type === 'video');
  const popularVideosList = (popularData.data?.list || []).filter((file: FileItem) => file.type === 'video');

  // Sort videos for each category
  const sortedByRating = [...trendingVideosList].sort((a, b) => ((b.rating || 0) - (a.rating || 0)) || ((b.views || 0) - (a.views || 0)));
  const sortedByTime = [...recentVideosList].sort((a, b) => (b.utime || 0) - (a.utime || 0));
  const sortedPopular = [...popularVideosList].sort((a, b) => ((b.views || 0) - (a.views || 0)) || ((b.utime || 0) - (a.utime || 0)));

  return {
    trending: sortedByRating,
    recent: sortedByTime,
    popular: sortedPopular,
  };
} 