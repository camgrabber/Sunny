import { motion } from 'framer-motion';
import { PlayIcon, StarIcon, ClockIcon } from '@heroicons/react/24/solid';
import { VideoThumbnail } from './VideoThumbnail';
import { theme } from '@/styles/theme';
import type { FileItem } from '@/types/file';
import { formatTitle } from '@/utils/formatters';

interface NetflixCardProps {
  video: FileItem;
  onClick: () => void;
  priority?: boolean;
}

export const NetflixCard = ({ video, onClick, priority = false }: NetflixCardProps) => {
  return (
    <div
      className={`group cursor-pointer rounded-lg overflow-hidden bg-[#181818] shadow-lg transition-transform duration-200 hover:scale-105 hover:shadow-2xl border border-white/10 relative aspect-[4/5] flex flex-col`}
      onClick={onClick}
      style={{ minWidth: 0 }}
    >
      <div className="relative w-full aspect-[4/5] bg-black">
        <VideoThumbnail url={video.thumbnail || video.url} className="w-full h-full object-cover aspect-[4/5]" priority={priority} />
        
        {/* Gradient Overlay */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: theme.colors.overlay.gradient }}
        />

        {/* Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <div className="flex items-center justify-between text-white mb-2">
            <span className="flex items-center gap-1.5 text-sm">
              <ClockIcon className="w-4 h-4" />
              {video.duration || "1:30:00"}
            </span>
            <span className="flex items-center gap-1 text-sm">
              <StarIcon className="w-4 h-4" style={{ color: theme.colors.primary }} />
              {video.rating || 5}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span>{video.views?.toLocaleString() || '0'} views</span>
            <span>•</span>
            <span>{new Date((video.utime || Date.now()) * 1000).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="rounded-full p-4"
            style={{ backgroundColor: `${theme.colors.primary}E6` }}
          >
            <PlayIcon className="w-8 h-8 text-white" />
          </motion.div>
        </div>
      </div>

      {/* Title */}
      <div className="mt-3 px-2">
        <h3 className="text-sm font-medium line-clamp-2 text-white group-hover:text-[#E50914] transition-colors duration-200">
          {formatTitle(video.name)}
        </h3>
      </div>
    </div>
  );
}; 