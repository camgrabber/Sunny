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
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const QUALITY_OPTIONS = ['Auto', '1080p', '720p', '480p', '360p'];

export function MediaPlayer({ url, type, fileName }: MediaPlayerProps) {
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

  return (
    <div className="relative w-full">
      <BannerAdPlaceholder />
      <motion.div
        ref={playerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`rounded-xl overflow-hidden bg-black relative group ${!isMouseMoving && isPlaying ? 'cursor-none' : ''}`}
      >
        {/* Title at the top */}
        <AnimatePresence>
          {isMouseMoving && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-auto"
            >
              <div className="text-white text-lg font-semibold truncate max-w-[60vw] drop-shadow-lg">
                {formatTitle(fileName)}
              </div>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-white/80 hover:text-[#E50914] transition-colors flex items-center"
                title="Settings"
              >
                <Cog6ToothIcon className="w-6 h-6" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        {type === 'video' ? (
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={url}
            className="w-full aspect-video"
            onClick={togglePlay}
            playsInline
            controlsList="nodownload nofullscreen noremoteplayback"
            disablePictureInPicture
            disableRemotePlayback
          />
        ) : (
          <div>
            <audio
              ref={mediaRef as React.RefObject<HTMLAudioElement>}
              src={url}
              className="hidden"
            />
            <div className="aspect-[3/1] bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <div className="text-white text-center p-4">
                <h3 className="text-lg font-medium truncate max-w-xs">
                  {fileName}
                </h3>
                <p className="text-sm opacity-75">Audio Player</p>
              </div>
            </div>
          </div>
        )}

        {/* Controls overlay */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${isMouseMoving || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white text-xs">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 relative group/progress">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-600 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#E50914] hover:[&::-webkit-slider-thumb]:scale-110 transition-transform"
              />
              <div 
                className="absolute bottom-0 left-0 h-1 bg-[#E50914] rounded-full"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
              <div 
                className="absolute bottom-0 left-0 h-1 bg-[#E50914]/50 rounded-full group-hover/progress:scale-y-150 transition-transform origin-bottom"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            <span className="text-white text-xs">
              {formatTime(duration)}
            </span>
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={togglePlay}
                className="text-white hover:text-[#E50914] transition-colors"
              >
                {isPlaying ? (
                  <PauseIcon className="w-6 h-6" />
                ) : (
                  <PlayIcon className="w-6 h-6" />
                )}
              </motion.button>

              <div className="relative group/volume">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleMute}
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  className="text-white hover:text-[#E50914] transition-colors"
                >
                  {isMuted ? (
                    <SpeakerXMarkIcon className="w-6 h-6" />
                  ) : (
                    <SpeakerWaveIcon className="w-6 h-6" />
                  )}
                </motion.button>
                <AnimatePresence>
                  {showVolumeSlider && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      onMouseLeave={() => setShowVolumeSlider(false)}
                      className="absolute left-0 bottom-full mb-2 p-2 bg-black/80 rounded-lg"
                    >
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-24 h-1 bg-gray-600 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#E50914]"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative group/settings">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-white hover:text-[#E50914] transition-colors"
                >
                  <Cog6ToothIcon className="w-6 h-6" />
                </motion.button>
                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 bottom-full mb-2 p-2 bg-black/80 rounded-lg min-w-[200px]"
                    >
                      <div className="space-y-2">
                        <div className="text-white text-sm font-medium mb-2">Playback Speed</div>
                        <div className="flex flex-wrap gap-2">
                          {PLAYBACK_SPEEDS.map((speed) => (
                            <button
                              key={speed}
                              onClick={() => changePlaybackSpeed(speed)}
                              className={`px-2 py-1 rounded text-sm ${
                                playbackSpeed === speed
                                  ? 'bg-[#E50914] text-white'
                                  : 'bg-white/10 text-white/70 hover:bg-white/20'
                              }`}
                            >
                              {speed}x
                            </button>
                          ))}
                        </div>
                        <div className="text-white text-sm font-medium mb-2 mt-4">Quality</div>
                        <div className="flex flex-wrap gap-2">
                          {QUALITY_OPTIONS.map((quality) => (
                            <button
                              key={quality}
                              onClick={() => changeQuality(quality)}
                              className={`px-2 py-1 rounded text-sm ${
                                selectedQuality === quality
                                  ? 'bg-[#E50914] text-white'
                                  : 'bg-white/10 text-white/70 hover:bg-white/20'
                              }`}
                            >
                              {quality}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {subtitleTracks.length > 0 && (
                <div className="relative group/subtitles">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-white hover:text-[#E50914] transition-colors"
                  >
                    <LanguageIcon className="w-6 h-6" />
                  </motion.button>
                  <div className="absolute right-0 bottom-full mb-2 p-2 bg-black/80 rounded-lg min-w-[150px] opacity-0 group-hover/subtitles:opacity-100 transition-opacity">
                    {subtitleTracks.map((track, index) => (
                      <button
                        key={index}
                        onClick={() => toggleSubtitleTrack(index)}
                        className={`block w-full text-left px-2 py-1 rounded text-sm ${
                          currentSubtitleTrack === index
                            ? 'bg-[#E50914] text-white'
                            : 'text-white/70 hover:bg-white/10'
                        }`}
                      >
                        {track.label || `Subtitle ${index + 1}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleFullscreen}
                className="text-white hover:text-[#E50914] transition-colors"
              >
                {isFullscreen ? (
                  <ArrowsPointingInIcon className="w-6 h-6" />
                ) : (
                  <ArrowsPointingOutIcon className="w-6 h-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Keyboard shortcuts hint */}
        <AnimatePresence>
          {isMouseMoving && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-4 right-4 bg-black/80 text-white/70 text-xs p-2 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <span>Space</span>
                <span>Play/Pause</span>
              </div>
              <div className="flex items-center gap-2">
                <span>M</span>
                <span>Mute</span>
              </div>
              <div className="flex items-center gap-2">
                <span>F</span>
                <span>Fullscreen</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Social Interaction Bar */}
      <div className="max-w-3xl mx-auto mt-6 bg-[#181818] rounded-lg shadow-lg">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  className={`group flex items-center gap-2 hover:bg-white/5 rounded-full px-4 py-2 transition-colors ${liked ? 'text-[#E50914]' : 'text-white/80'}`}
                >
                  <HandThumbUpIcon className={`w-6 h-6 transition-transform group-hover:scale-110 ${liked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">{likeCount.toLocaleString()}</span>
                </button>
                <button
                  onClick={handleDislike}
                  className={`group flex items-center gap-2 hover:bg-white/5 rounded-full px-4 py-2 transition-colors ${disliked ? 'text-[#E50914]' : 'text-white/80'}`}
                >
                  <HandThumbDownIcon className={`w-6 h-6 transition-transform group-hover:scale-110 ${disliked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">{dislikeCount.toLocaleString()}</span>
                </button>
              </div>
              <div className="h-8 w-px bg-white/10"></div>
              <div className="relative">
                <button
                  onClick={handleShare}
                  className="group flex items-center gap-2 hover:bg-white/5 rounded-full px-4 py-2 text-white/80 transition-colors"
                >
                  <ShareIcon className="w-6 h-6 transition-transform group-hover:scale-110" />
                  <span className="text-sm font-medium">Share</span>
                </button>
                {showShare && (
                  <div className="absolute top-full left-0 mt-2 bg-[#282828] text-white text-sm px-6 py-4 rounded-lg shadow-xl z-30 min-w-[300px]">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-medium">Share this video</span>
                      <button onClick={() => setShowShare(false)} className="text-white/60 hover:text-white">×</button>
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 rounded px-3 py-2 mb-4">
                      <input
                        type="text"
                        readOnly
                        value={window.location.href}
                        className="flex-1 bg-transparent text-white/80 text-sm outline-none"
                      />
                      <button
                        onClick={handleShare}
                        className="text-[#E50914] text-sm font-medium hover:text-[#b0060f]"
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="text-white/60 text-sm">
              {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="p-6">
          <form onSubmit={handleAddComment} className="flex gap-2 mb-6">
            <input
              type="text"
              value={commentInput}
              onChange={e => setCommentInput(e.target.value)}
              className="flex-1 rounded px-4 py-3 bg-black/60 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#E50914]/50"
              placeholder="Add a comment..."
            />
            <button
              type="submit"
              className="bg-[#E50914] text-white px-6 py-2 rounded font-medium hover:bg-[#b0060f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!commentInput.trim()}
            >
              Comment
            </button>
          </form>
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-white/50 text-center py-8">No comments yet. Be the first to comment!</div>
            ) : (
              comments.map((c, i) => (
                <div key={i} className="group bg-black/20 hover:bg-black/40 rounded-lg p-4 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#E50914]/20 flex items-center justify-center">
                      <span className="text-[#E50914] text-sm font-medium">
                        {c.text[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-white/90 text-sm mb-1">{c.text}</div>
                      <div className="text-white/40 text-xs">{c.date}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <BannerAdPlaceholder />
    </div>
  );
}