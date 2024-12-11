import { useEffect, useRef, useState } from 'react';

interface VideoUploaderProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onFrame: () => void;
  onStop: () => void;
  showControlsInside?: boolean;
}

export default function VideoUploader({ 
  videoRef, 
  canvasRef, 
  onFrame, 
  onStop,
  showControlsInside = false 
}: VideoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const animationFrameRef = useRef<number>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      onStop();
    };
  }, [onStop]);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("video/")) {
      alert("Please upload a video file");
      return;
    }

    // Cleanup previous video URL if it exists
    if (videoSrc) {
      URL.revokeObjectURL(videoSrc);
    }

    const url = URL.createObjectURL(file);
    setVideoSrc(url);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    setDuration(video.duration);

    // Get the actual video dimensions
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;
    
    // Set canvas dimensions to match video dimensions exactly
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    // Update canvas style dimensions to match the scaled video
    const videoRect = video.getBoundingClientRect();
    canvasRef.current.style.width = `${videoRect.width}px`;
    canvasRef.current.style.height = `${videoRect.height}px`;

    // Auto-play the video
    video.play().catch(error => {
      console.error("Auto-play failed:", error);
    });
  };

  const processFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    onFrame();
  };

  const handlePlaybackFrame = () => {
    if (videoRef.current && !videoRef.current.paused) {
      setCurrentTime(videoRef.current.currentTime);
      processFrame();
      animationFrameRef.current = requestAnimationFrame(handlePlaybackFrame);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    
    const newTime = parseFloat(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    
    // Process frame immediately when scrubbing
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

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      requestAnimationFrame(() => {
        setCurrentTime(videoRef.current?.currentTime || 0);
      });
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const renderControls = () => (
    <div style={{ 
      paddingRight: '5px',
      paddingLeft: '5px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderRadius: showControlsInside ? '0' : '0 0 8px 8px',
    }}>
      <button 
        onClick={togglePlay}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          padding: '5px',
        }}
      >
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
  );

  return (
    <>
      <div style={{ width: '100%' }}>
        <input 
          ref={fileInputRef}
          type="file" 
          accept="video/*" 
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
        <div 
          style={{ 
            position: 'relative', 
            width: '100%',
            aspectRatio: '16/9',
            backgroundColor: 'rgb(44, 46, 51)',
            borderRadius: videoSrc && showControlsInside ? '6px' : '6px 6px 0 0',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
          }}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={!videoSrc ? handleClick : undefined}
        >
          {!videoSrc ? (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              backgroundColor: isDragging ? 'rgba(255, 255, 255, 0.1)' : undefined,
              transition: 'background-color 0.2s',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>📁</div>
              <p style={{ margin: 0 }}>{isDragging ? 'Drop video here' : 'Click or drag video here'}</p>
            </div>
          ) : (
            <>
              {/* Hidden video element - still active but not visible */}
              <video
                ref={videoRef}
                src={videoSrc}
                muted
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
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
                  position: 'absolute',
                  opacity: 0,
                  pointerEvents: 'none',
                  width: '100%',
                  height: '100%',
                }}
              />
              {/* Canvas will be the primary display */}
              <canvas
                ref={canvasRef}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </>
          )}
          {videoSrc && showControlsInside && renderControls()}
        </div>
      </div>
      {videoSrc && !showControlsInside && renderControls()}
    </>
  );
}
