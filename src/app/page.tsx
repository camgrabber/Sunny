"use client";

import { useState, useEffect } from "react";
import { VideoThumbnail } from "@/components/VideoThumbnail";
import { 
  PlayIcon, 
  StarIcon, 
  ClockIcon, 
  FireIcon,
  FilmIcon,
  InformationCircleIcon
} from "@heroicons/react/24/solid";
import { useTokenStore, TokenInfo } from '@/store/useTokenStore';
import { MediaPlayer } from "@/components/MediaPlayer";
import { motion, AnimatePresence } from "framer-motion";
import { NetflixCard } from "@/components/NetflixCard";
import { theme } from "@/styles/theme";
import type { FileItem } from "@/types/file";
import { formatTitle } from '@/utils/formatters';
import { AdPlaceholder } from '@/components/AdPlaceholder';
import Link from 'next/link';

const VIDEOS_PER_SECTION = 6;

const VideoSection = ({ 
  title, 
  videos = [],
  icon: Icon,
  onVideoSelect,
  isLoading,
  error,
  viewMoreHref
}: { 
  title: string, 
  videos: FileItem[],
  icon: typeof PlayIcon,
  onVideoSelect: (video: FileItem) => void,
  isLoading?: boolean,
  error?: string,
  viewMoreHref?: string
}) => (
  <div className="mb-16 px-4 md:px-16">
    <div className="flex items-center gap-3 mb-6">
      <Icon className="w-6 h-6 text-[#E50914]" />
      <h2 className="text-2xl font-medium text-white">
        {title}
      </h2>
    </div>
    {isLoading ? (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[4/5] bg-white/10 rounded-md mb-3" />
            <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
            <div className="h-3 bg-white/10 rounded w-1/2" />
          </div>
        ))}
      </div>
    ) : error ? (
      <div className="bg-[#E50914]/10 rounded-lg p-6 text-center">
        <InformationCircleIcon className="w-12 h-12 text-[#E50914] mx-auto mb-4" />
        <p className="text-white/90 mb-2">Unable to load videos</p>
        <p className="text-white/60 text-sm">{error}</p>
      </div>
    ) : videos.length === 0 ? (
      <div className="bg-white/5 rounded-lg p-6 text-center">
        <FilmIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <p className="text-white/60">No videos available</p>
      </div>
    ) : (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {videos.map((video, index) => (
          <NetflixCard 
            key={video.id} 
            video={video} 
            onClick={() => onVideoSelect(video)}
            priority={index < 2}
          />
        ))}
      </div>
    )}
    {videos.length > 0 && viewMoreHref && (
      <div className="flex justify-center mt-6">
        <Link href={viewMoreHref} legacyBehavior>
          <a className="inline-block bg-[#E50914] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#b0060f] transition-colors">View More</a>
        </Link>
      </div>
    )}
  </div>
);

export default function HomePage() {
  const [recentVideos, setRecentVideos] = useState<FileItem[]>([]);
  const [popularVideos, setPopularVideos] = useState<FileItem[]>([]);
  const [trendingVideos, setTrendingVideos] = useState<FileItem[]>([]);
  const [featuredVideo, setFeaturedVideo] = useState<FileItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<FileItem | null>(null);
  const { tokens, setToken } = useTokenStore();

  useEffect(() => {
    async function fetchFiles() {
      setLoading(true);
      setError("");
      try {
        // 1. Fetch all folders from root
        const rootRes = await fetch(`/api/files?pid=0`);
        const rootData = await rootRes.json();
        if (!rootData.success) throw new Error(rootData.error || 'Failed to fetch root folders');
        const folders = (rootData.data?.list || []).filter((file: FileItem) => file.url === undefined);
        if (folders.length < 3) throw new Error('Not enough folders to assign categories');
        // Find the first folder that has videos
        let videoFolder = null;
        let largestFolder = null;
        let largestSize = 0;
        let mostFilesFolder = null;
        let mostFilesCount = 0;
        for (const folder of folders) {
          const res = await fetch(`/api/files?pid=${folder.id}&limit=50`);
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
          fetch(`/api/files?pid=${videoFolder.id}&limit=50`),
          fetch(`/api/files?pid=${mostFilesFolder.id}&limit=50`),
          fetch(`/api/files?pid=${largestFolder.id}&limit=50`),
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

        // Set videos for each category
        setTrendingVideos(sortedByRating.slice(0, VIDEOS_PER_SECTION));
        setRecentVideos(sortedByTime.slice(0, VIDEOS_PER_SECTION));
        setPopularVideos(sortedPopular.slice(0, VIDEOS_PER_SECTION));

        // Set featured video
        if (sortedByRating.length > 0) {
          setFeaturedVideo(sortedByRating[0]);
        }
      } catch (e) {
        console.error('Error fetching files:', e);
        setError(e instanceof Error ? e.message : 'Failed to fetch files');
      }
      setLoading(false);
    }
    fetchFiles();
  }, []);

  return (
    <div className="bg-[#141414] min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#141414]/95 backdrop-blur-md shadow-lg">
        <div className="px-4 md:px-16 py-4">
          <h1 className="text-2xl font-bold text-[#E50914]">JemphStream</h1>
        </div>
      </header>

      {/* Hero Section */}
      {featuredVideo ? (
        <div className="relative h-[85vh]">
          <div className="absolute inset-0">
            <div className="w-full h-full">
              <VideoThumbnail 
                url={featuredVideo.url} 
                className="w-full h-full object-cover"
                priority={true}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/50 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 px-4 md:px-16 pb-16 md:pb-24">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl"
            >
              <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
                {formatTitle(featuredVideo.name)}
              </h2>
              <div className="flex items-center gap-4 text-white/90 mb-8">
                <span className="flex items-center gap-1.5 bg-[#E50914]/20 px-3 py-1 rounded-full">
                  <StarIcon className="w-5 h-5 text-[#E50914]" />
                  {featuredVideo.rating || 5}
                </span>
                <span className="bg-[#E50914]/20 px-3 py-1 rounded-full">{featuredVideo.duration || "1:30:00"}</span>
                <span className="bg-[#E50914]/20 px-3 py-1 rounded-full">{featuredVideo.views?.toLocaleString() || '0'} views</span>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedVideo(featuredVideo)}
                  className="bg-[#E50914] text-white px-8 py-3 rounded-lg flex items-center gap-2 hover:bg-[#E50914]/90 transition-colors"
                >
                  <PlayIcon className="w-6 h-6" />
                  <span className="font-medium">Play Now</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      ) : loading ? (
        <div className="h-[85vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#E50914]"></div>
        </div>
      ) : null}

      {/* Main Content */}
      <main className="relative z-10 pb-20">
        <div className="mt-8">
          <VideoSection 
            title="Trending Now" 
            videos={trendingVideos} 
            icon={FireIcon}
            onVideoSelect={setSelectedVideo}
            isLoading={loading}
            error={error}
            viewMoreHref="/trending"
          />
          <AdPlaceholder />
          <VideoSection 
            title="Recently Added" 
            videos={recentVideos} 
            icon={ClockIcon}
            onVideoSelect={setSelectedVideo}
            isLoading={loading}
            error={error}
            viewMoreHref="/recent"
          />
          <AdPlaceholder />
          <VideoSection 
            title="Popular Videos" 
            videos={popularVideos} 
            icon={StarIcon}
            onVideoSelect={setSelectedVideo}
            isLoading={loading}
            error={error}
            viewMoreHref="/popular"
          />
        </div>
      </main>

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-5xl mx-4"
            >
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute -top-12 right-0 text-white hover:text-[#E50914] transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <MediaPlayer
                url={selectedVideo.url}
                type="video"
                fileName={selectedVideo.name}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}