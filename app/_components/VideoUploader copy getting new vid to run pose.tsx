import { useEffect, useRef, useState } from 'react';

interface VideoUploaderProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onFrame: () => void;
  onStop: () => void;
}

export default function VideoUploader({ videoRef, canvasRef, onFrame, onStop }: VideoUploaderProps) {
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      onStop();
    };
  }, [onStop]);

  const processFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    // Update canvas dimensions to match video
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    
    onFrame();
  };

  const handlePlaybackFrame = () => {
    if (videoRef.current && !videoRef.current.paused) {
      processFrame();
      animationFrameRef.current = requestAnimationFrame(handlePlaybackFrame);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    
    const newTime = parseFloat(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    processFrame();
  };

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
      animationFrameRef.current = requestAnimationFrame(handlePlaybackFrame);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <input 
        type="file" 
        accept="video/*" 
        onChange={handleFileChange}
        style={{ marginBottom: '10px' }}
      />
      <video
        ref={videoRef}
        src={videoSrc}
        muted
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
        onPlay={() => {
          setIsPlaying(true);
          animationFrameRef.current = requestAnimationFrame(handlePlaybackFrame);
        }}
        onPause={() => {
          setIsPlaying(false);
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
        }}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '6px',
          objectFit: 'contain',
        }}
      />
      <div style={{ 
        marginTop: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <button onClick={togglePlay}>
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        <input
          type="range"
          min="0"
          max={duration}
          step="0.001"
          value={currentTime}
          onChange={handleSeek}
          style={{ flex: 1 }}
        />
        <span style={{ color: 'white', minWidth: '100px', textAlign: 'right' }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
