// /app/history/page.tsx
"use client";

import { useRef, useState } from "react";

export default function HistoryPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
    }
  };

  const handleVideoPlayback = () => {
    if (videoFile && videoRef.current) {
      const url = URL.createObjectURL(videoFile);
      videoRef.current.src = url;
      videoRef.current.play();
      detectPose();
    }
  };

  const detectPose = () => {
    if (videoRef.current && canvasRef.current) {
      const canvasCtx = canvasRef.current.getContext("2d");
      const video = videoRef.current;

      const drawFrame = () => {
        if (canvasCtx) {
          // Clear the canvas
          canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

          // Draw the current video frame onto the canvas
          canvasCtx.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);

          // Run OpenPose detection here (replace with your OpenPose detection logic)
          // Example: const result = poseLandmarker.detect(video);
          // for (const landmark of result.landmarks) {
          //   drawLandmark(landmark); // Implement this function to draw landmarks
          // }

          requestAnimationFrame(drawFrame); // Call drawFrame for the next frame
        }
      };

      video.addEventListener("play", drawFrame); // Start drawing when video plays
    }
  };

  return (
    <div>
      <h2>Replay!!</h2>
      <input type="file" accept="video/mp4" onChange={handleFileChange} />
      <button onClick={handleVideoPlayback} disabled={!videoFile}>
        Load and Replay Video
      </button>
      <video ref={videoRef} loop style={{ display: "none" }} />
      <canvas ref={canvasRef} width={640} height={480} style={{ border: "1px solid black" }} />
    </div>
  );
}
