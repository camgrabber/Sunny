"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  StarIcon
} from "@heroicons/react/24/outline";
import type { FileItem } from "@/types/file";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MediaPlayer } from "@/components/MediaPlayer";

export default function VideoPlayerPage() {
  const [video, setVideo] = useState<FileItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [relatedVideos, setRelatedVideos] = useState<FileItem[]>([]);
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    async function fetchVideo() {
      try {
        const res = await fetch(`/api/files`);
        const data = await res.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch video');
        }

        const videoFiles = (data.data?.list || [])
          .filter((file: FileItem) => file.type === 'video');

        const currentVideo = videoFiles.find((v: FileItem) => v.id === params.id);
        if (!currentVideo) {
          throw new Error('Video not found');
        }

        setVideo(currentVideo);
        
        // Get related videos (excluding current video)
        const related = videoFiles
          .filter((v: FileItem) => v.id !== params.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 6);
        setRelatedVideos(related);
      } catch (e) {
        console.error('Error fetching video:', e);
        setError(e instanceof Error ? e.message : 'Failed to fetch video');
      }
      setLoading(false);
    }

    fetchVideo();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E50914]"></div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-center">
          <div className="bg-[#E50914]/10 rounded-lg p-6 inline-block">
            <p className="text-[#E50914] mb-2">Failed to load video</p>
            <p className="text-white/60 text-sm">{error}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 text-white hover:text-[#E50914] transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent"
      >
        <div className="px-4 md:px-16 py-6">
          <div className="flex items-center justify-between">
            <Link 
              href="/"
              className="text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </Link>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <InformationCircleIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-20 pb-16">
        {/* Video Player */}
        <div className="relative aspect-video bg-black">
          <MediaPlayer
            url={video.url}
            type="video"
            fileName={video.name}
          />
        </div>

        {/* Video Info */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="px-4 md:px-16 py-8 bg-gradient-to-b from-black/80 to-transparent"
            >
              <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-4">{video.name}</h1>
                <div className="flex items-center gap-4 text-white/70 mb-6">
                  <span className="flex items-center gap-1.5">
                    <StarIcon className="w-5 h-5 text-[#E50914]" />
                    {video.rating || 5}
                  </span>
                  <span>{video.duration || "1:30:00"}</span>
                  <span>{video.views?.toLocaleString() || '0'} views</span>
                </div>
                <p className="text-white/90 text-lg mb-6">
                  {video.description || "No description available."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Related Videos */}
        <div className="px-4 md:px-16 py-8">
          <h2 className="text-2xl font-bold text-white mb-6">More Like This</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {relatedVideos.map((relatedVideo) => (
              <motion.div
                key={relatedVideo.id}
                whileHover={{ scale: 1.05 }}
                className="relative group cursor-pointer"
                onClick={() => router.push(`/player/${relatedVideo.id}`)}
              >
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src={relatedVideo.thumbnail || '/placeholder.jpg'}
                    alt={relatedVideo.name}
                    className="w-full h-full object-cover group-hover:brightness-75 transition-all"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <h3 className="text-white text-sm font-medium truncate">
                      {relatedVideo.name}
                    </h3>
                    <div className="flex items-center gap-2 text-white/70 text-xs mt-1">
                      <span>{relatedVideo.duration || "1:30:00"}</span>
                      <span>•</span>
                      <span>{relatedVideo.views?.toLocaleString() || '0'} views</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
} 