"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  PlusIcon,
  ShareIcon,
  EllipsisHorizontalIcon
} from "@heroicons/react/24/outline";
import type { FileItem } from "@/types/file";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { MediaPlayer } from "@/components/MediaPlayer";

export default function WatchPage() {
  const [video, setVideo] = useState<FileItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#E50914]"></div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#E50914] text-xl mb-4">{error || 'Video not found'}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-[#E50914] text-white rounded-md hover:bg-[#E50914]/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      {/* Video Player Container */}
      <div className="relative w-full h-full">
        <MediaPlayer
          url={video.url}
          type="video"
          fileName={video.name}
        />
      </div>
    </div>
  );
} 