import React, { useRef, useEffect, useState } from "react";

// Define types for the props
interface VideoFrameProcessorProps {
  onFrameProcessed: (timestamp: number) => void;
}

const VideoFrameProcessor: React.FC<VideoFrameProcessorProps> = ({ onFrameProcessed }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null); // State to store video source
  const [currentTime, setCurrentTime] = useState<number>(0); // Track current time

  useEffect(() => {
    console.log("Creating Web Worker...");
    // Create and set up the Web Worker
    const workerInstance = new Worker("frameProcessor.js");
    setWorker(workerInstance);

    // Cleanup on unmount
    return () => {
      console.log("Terminating Web Worker...");
      workerInstance.terminate();
    };
  }, []);

  useEffect(() => {
    if (!worker) return;

    worker.onmessage = ({ data }: MessageEvent) => {
      console.log("Worker received message:", data);
      if (data.type === "frameProcessed") {
        console.log(`Frame processed at timestamp: ${data.timestamp}`);
        onFrameProcessed(data.timestamp);
        setIsProcessing(false); // Allow the next frame to process
      }
    };
  }, [worker, onFrameProcessed]);

  const processVideoFrames = () => {
    console.log("Starting video frame processing...");
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!video || !ctx || !worker) {
      console.log("Missing video, canvas, or worker. Exiting frame processing.");
      return;
    }

    const duration = video.duration;
    let frameRate = 24; // Default fallback frame rate
    console.log(`Video duration: ${duration} seconds`);

    // Dynamically estimate the frame rate (if possible)
    if (video.getVideoPlaybackQuality) {
      const quality = video.getVideoPlaybackQuality();
      if (quality.totalVideoFrames > 0) {
        frameRate = quality.totalVideoFrames / duration;
        console.log(`Detected frame rate: ${frameRate.toFixed(2)} FPS`);
      }
    }

    // Use an interval to process frames periodically
    const interval = setInterval(() => {
      if (currentTime >= duration || isProcessing) {
        console.log("Stopping frame processing.");
        clearInterval(interval);
        return;
      }

      console.log(`Seeking video to time: ${currentTime}s`);
      video.currentTime = currentTime; // Seek to the current frame's time
    }, 100); // Check every 100ms

    return interval;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File input change detected.");
    const file = event.target.files?.[0];
    if (file) {
      console.log("File selected:", file.name);
      const fileURL = URL.createObjectURL(file); // Create a URL for the selected file
      setVideoSrc(fileURL); // Set the local file URL as the video source
    } else {
      console.log("No file selected.");
    }
  };

  const handleSeeked = () => {
    console.log("Video seek completed, capturing frame...");
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!video || !ctx || !worker) {
      console.log("Missing video, canvas, or worker during seek.");
      return;
    }

    // Capture the current frame
    if (canvas) {
      console.log("Capturing frame...");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const frameData = canvas.toDataURL("image/jpeg"); // Convert frame to image data
      const timestamp = video.currentTime * 1000; // Get timestamp in milliseconds
      console.log(`Sending frame data to worker with timestamp: ${timestamp}`);

      // Send the frame to the worker for processing
      setIsProcessing(true);
      worker.postMessage({ frame: frameData, timestamp });
    }

    // Move to the next frame after processing
    setCurrentTime((prevTime) => {
      const nextTime = prevTime + 1 / 24; // Move by 1/24 seconds per frame
      console.log(`Incrementing time: ${nextTime}`);
      return nextTime;
    });
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      console.log("Registering onseeked event...");
      video.onseeked = () => {
        console.log("Seek event triggered.");
        handleSeeked(); // Explicitly call the handler here
      };
    }
  }, [videoRef]);

  return (
    <div>
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
      />
      {videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          style={{ display: "none" }}
          onLoadedData={processVideoFrames}
        />
      )}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

export default VideoFrameProcessor;
