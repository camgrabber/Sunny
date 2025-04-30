"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { StarIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";
import { NetflixCard } from "@/components/NetflixCard";
import { MediaPlayer } from "@/components/MediaPlayer";
import { getCategoryFoldersAndVideos } from "@/utils/folderSelectors";
import type { FileItem } from "@/types/file";
import Link from "next/link";
import { BannerAdPlaceholder } from '@/components/BannerAdPlaceholder';
import { AdPlaceholder } from '@/components/AdPlaceholder';

const VIDEOS_PER_PAGE = 20;

export default function PopularPage() {
  const [videos, setVideos] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<FileItem | null>(null);

  useEffect(() => {
    async function fetchPopular() {
      setLoading(true);
      setError("");
      try {
        const { popular } = await getCategoryFoldersAndVideos(100);
        setVideos(popular);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to fetch videos");
      }
      setLoading(false);
    }
    fetchPopular();
  }, []);

  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent">
        <div className="px-4 md:px-16 py-6">
          <div className="flex items-center gap-6">
            <Link 
              href="/"
              className="text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div className="flex items-center gap-3">
              <StarIcon className="w-8 h-8 text-[#E50914]" />
              <h1 className="text-3xl font-bold text-white">Popular Videos</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-32 pb-20 px-4 md:px-16">
        <BannerAdPlaceholder />
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-white/10 rounded-md mb-3" />
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-[#E50914]/10 rounded-lg p-6 inline-block">
              <p className="text-[#E50914] mb-2">Failed to load videos</p>
              <p className="text-white/60 text-sm">{error}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {videos.map((video, idx) => (
                <>
                  <NetflixCard
                    key={video.id}
                    video={video}
                    onClick={() => setSelectedVideo(video)}
                  />
                  {(idx + 1) % 4 === 0 && idx !== videos.length - 1 && <AdPlaceholder key={`ad-${idx}`} />}
                </>
              ))}
            </div>
            {videos.length > VIDEOS_PER_PAGE && (
              <div className="mt-12 flex justify-center items-center gap-2">
                {/* ...pagination buttons... */}
              </div>
            )}
            <BannerAdPlaceholder />
          </>
        )}
      </main>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="relative w-full max-w-5xl mx-4">
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
          </div>
        </div>
      )}
    </div>
  );
} 