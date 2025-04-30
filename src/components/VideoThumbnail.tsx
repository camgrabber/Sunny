import { useEffect, useRef, useState } from 'react';

// Cache for storing generated thumbnails
const thumbnailCache = new Map<string, string>();

interface VideoThumbnailProps {
  url: string;
  className?: string;
  priority?: boolean;
}

export const VideoThumbnail = ({ url, className = '', priority = false }: VideoThumbnailProps) => {
  const [thumbnail, setThumbnail] = useState<string>('');
  const [error, setError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    if (!url) {
      setError(true);
      return;
    }

    // Check cache first
    const cachedThumbnail = thumbnailCache.get(url);
    if (cachedThumbnail) {
      setThumbnail(cachedThumbnail);
      return;
    }

    const generateThumbnail = async () => {
      const video = videoRef.current;
      if (!video) return;

      try {
        // Create a new promise that resolves when the video is loaded
        await new Promise((resolve, reject) => {
          video.addEventListener('loadeddata', resolve, { once: true });
          video.addEventListener('error', reject, { once: true });
          
          // Set source and load
          video.src = url;
          video.load();
        });

        // Wait a bit to ensure the video is properly loaded
        await new Promise(resolve => setTimeout(resolve, 100));

        // Set time to 1 second
        video.currentTime = 1;

        // Wait for seek to complete
        await new Promise((resolve) => {
          video.addEventListener('seeked', resolve, { once: true });
        });

        // Generate thumbnail
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        // Cache and set the thumbnail
        thumbnailCache.set(url, dataUrl);
        setThumbnail(dataUrl);
        setError(false);

      } catch (err) {
        console.error('Error generating thumbnail:', err);
        
        // Retry logic
        if (retryCount.current < maxRetries) {
          retryCount.current += 1;
          console.log(`Retrying thumbnail generation (${retryCount.current}/${maxRetries})...`);
          setTimeout(generateThumbnail, 1000); // Retry after 1 second
        } else {
          setError(true);
        }
      }
    };

    generateThumbnail();

    return () => {
      const video = videoRef.current;
      if (video) {
        video.removeAttribute('src');
        video.load();
      }
    };
  }, [url]);

  if (error) {
    return (
      <div className={`relative aspect-video bg-gray-900 ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/50 text-sm">Unable to load thumbnail</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative aspect-video ${className}`}>
      <video
        ref={videoRef}
        className="hidden"
        preload={priority ? "auto" : "metadata"}
        crossOrigin="anonymous"
      />
      {thumbnail ? (
        <img 
          src={thumbnail} 
          alt="" 
          className="w-full h-full object-cover"
          loading={priority ? "eager" : "lazy"}
        />
      ) : (
        <div className="w-full h-full bg-gray-800 animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      )}
    </div>
  );
}; 