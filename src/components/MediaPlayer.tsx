import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlayIcon, 
  PauseIcon, 
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  LanguageIcon,
  ClockIcon,
  Cog6ToothIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ForwardIcon,
  BackwardIcon,
  ShareIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { formatTitle } from '@/utils/formatters';
import { BannerAdPlaceholder } from './BannerAdPlaceholder';

interface MediaPlayerProps {
  url: string;
  type: 'video' | 'audio';
  fileName: string;
  thumbnail?: string;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const QUALITY_OPTIONS = ['Auto', '1080p', '720p', '480p', '360p'];

export function MediaPlayer({ url, type, fileName, thumbnail }: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMouseMoving, setIsMouseMoving] = useState(true);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedQuality, setSelectedQuality] = useState('Auto');
  const [subtitleTracks, setSubtitleTracks] = useState<TextTrack[]>([]);
  const [currentSubtitleTrack, setCurrentSubtitleTrack] = useState<number>(-1);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState<{text: string, date: string}[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const mouseTimeoutRef = useRef<NodeJS.Timeout>();
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 100));
  const [dislikeCount, setDislikeCount] = useState(Math.floor(Math.random() * 20));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const handleTimeUpdate = () => setCurrentTime(media.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(media.duration);
      // Check for embedded subtitle tracks
      if ('textTracks' in media) {
        const tracks = Array.from(media.textTracks);
        setSubtitleTracks(tracks);
        console.log('Available subtitle tracks:', tracks);
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    media.addEventListener('timeupdate', handleTimeUpdate);
    media.addEventListener('loadedmetadata', handleLoadedMetadata);
    media.addEventListener('play', handlePlay);
    media.addEventListener('pause', handlePause);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      media.removeEventListener('timeupdate', handleTimeUpdate);
      media.removeEventListener('loadedmetadata', handleLoadedMetadata);
      media.removeEventListener('play', handlePlay);
      media.removeEventListener('pause', handlePause);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = () => {
      setIsMouseMoving(true);
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current);
      }
      mouseTimeoutRef.current = setTimeout(() => {
        setIsMouseMoving(false);
      }, 3000); // Hide after 3 seconds of no movement
    };

    const playerElement = playerRef.current;
    if (playerElement) {
      playerElement.addEventListener('mousemove', handleMouseMove);
      playerElement.addEventListener('mouseenter', handleMouseMove);
    }

    return () => {
      if (playerElement) {
        playerElement.removeEventListener('mousemove', handleMouseMove);
        playerElement.removeEventListener('mouseenter', handleMouseMove);
      }
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (mediaRef.current) {
      mediaRef.current.addEventListener('loadeddata', () => setIsLoading(false));
      mediaRef.current.addEventListener('error', () => {
        setError('Failed to load media');
        setIsLoading(false);
      });
    }
  }, []);

  const togglePlay = () => {
    if (!mediaRef.current) return;
    if (isPlaying) {
      mediaRef.current.pause();
    } else {
      mediaRef.current.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!mediaRef.current) return;
    const time = parseFloat(e.target.value);
    mediaRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!mediaRef.current) return;
    const value = parseFloat(e.target.value);
    mediaRef.current.volume = value;
    setVolume(value);
    setIsMuted(value === 0);
  };

  const toggleMute = () => {
    if (!mediaRef.current) return;
    if (isMuted) {
      mediaRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      mediaRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = async () => {
    if (!playerRef.current) return;
    
    try {
      if (!document.fullscreenElement) {
        await playerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  };

  const handleSubtitleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !mediaRef.current) return;

    const url = URL.createObjectURL(file);
    const track = document.createElement('track');
    track.kind = 'subtitles';
    track.label = file.name;
    track.src = url;
    
    if ('textTracks' in mediaRef.current) {
      // Remove previous uploaded subtitle track if exists
      Array.from(mediaRef.current.textTracks).forEach(track => {
        if (track.label === 'uploaded') {
          track.mode = 'disabled';
        }
      });
      
      mediaRef.current.appendChild(track);
      const newTrack = mediaRef.current.textTracks[mediaRef.current.textTracks.length - 1];
      newTrack.mode = 'showing';
      setSubtitleTracks(Array.from(mediaRef.current.textTracks));
      setCurrentSubtitleTrack(mediaRef.current.textTracks.length - 1);
    }
  };

  const toggleSubtitleTrack = (index: number) => {
    if (!mediaRef.current || !('textTracks' in mediaRef.current)) return;
    
    Array.from(mediaRef.current.textTracks).forEach((track, i) => {
      track.mode = i === index ? 'showing' : 'hidden';
    });
    setCurrentSubtitleTrack(index);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (!mediaRef.current) return;

    switch (e.key.toLowerCase()) {
      case ' ':
      case 'k':
        e.preventDefault();
        togglePlay();
        break;
      case 'm':
        toggleMute();
        break;
      case 'f':
        toggleFullscreen();
        break;
      case 'arrowleft':
        if (mediaRef.current) {
          mediaRef.current.currentTime = Math.max(0, mediaRef.current.currentTime - 10);
        }
        break;
      case 'arrowright':
        if (mediaRef.current) {
          mediaRef.current.currentTime = Math.min(mediaRef.current.duration, mediaRef.current.currentTime + 10);
        }
        break;
      case 'arrowup':
        if (mediaRef.current) {
          mediaRef.current.volume = Math.min(1, mediaRef.current.volume + 0.1);
          setVolume(mediaRef.current.volume);
        }
        break;
      case 'arrowdown':
        if (mediaRef.current) {
          mediaRef.current.volume = Math.max(0, mediaRef.current.volume - 0.1);
          setVolume(mediaRef.current.volume);
        }
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const changePlaybackSpeed = (speed: number) => {
    if (!mediaRef.current) return;
    mediaRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSettings(false);
  };

  const changeQuality = (quality: string) => {
    setSelectedQuality(quality);
    setShowSettings(false);
    // Implement quality change logic here
  };

  const handleLike = () => {
    setLiked((prev) => {
      const newState = !prev;
      // Update counts
      if (newState) {
        setLikeCount(c => c + 1);
        if (disliked) setDislikeCount(c => c - 1);
      } else {
        setLikeCount(c => c - 1);
      }
      return newState;
    });
    if (!liked && disliked) setDisliked(false);
  };

  const handleDislike = () => {
    setDisliked((prev) => {
      const newState = !prev;
      // Update counts
      if (newState) {
        setDislikeCount(c => c + 1);
        if (liked) setLikeCount(c => c - 1);
      } else {
        setDislikeCount(c => c - 1);
      }
      return newState;
    });
    if (!disliked && liked) setLiked(false);
  };

  const handleShare = async () => {
    setShowShare(true);
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setComments([{ text: commentInput, date: new Date().toLocaleString() }, ...comments]);
    setCommentInput('');
  };

  if (type === 'video') {
    return (
      <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
            <p className="text-white">{error}</p>
          </div>
        )}
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          className="w-full h-full"
          controls
          preload="metadata"
          poster={thumbnail}
          playsInline
        >
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
          <p className="text-red-500">{error}</p>
        </div>
      )}
      <audio
        ref={mediaRef as React.RefObject<HTMLAudioElement>}
        className="w-full"
        controls
        preload="metadata"
      >
        <source src={url} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}