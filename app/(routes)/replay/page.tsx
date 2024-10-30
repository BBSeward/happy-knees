// /app/replay/page.tsx
"use client";

import { useRef, useState } from "react";
import { PoseLandmarker, FilesetResolver, DrawingUtils, PoseLandmarkerResult } from "@mediapipe/tasks-vision"; // Import necessary classes from MediaPipe
import { useDetectPose } from "@/app/_utils/detectPose";

export default function HistoryPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  //   const [poseLandmarker, setPoseLandmarker] = useState<any>(null);
  // const { detectPose, parsedLandmarks } = useDetectPose(videoRef, canvasRef, poseLandmarker);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
    }

    // play video and run pose detection
    if (videoFile && videoRef.current) {
      const url = URL.createObjectURL(videoFile);
      videoRef.current.src = url;
      videoRef.current.play();
      detectPose();
    }
  };

  // NOW REPLACE THIS DETECT POSE WITH THE CUSTOM HOOK
  const detectPose = () => {
    if (videoRef.current && canvasRef.current) {
      const canvasCtx = canvasRef.current.getContext("2d");
      const video = videoRef.current;
      console.log("we in replay detect pose");

      const drawFrame = () => {
        if (canvasCtx) {
          console.log("we have a canvas context");
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
      <video ref={videoRef} loop style={{ display: "none" }} />
      <canvas ref={canvasRef} width={640} height={480} style={{ border: "1px solid black" }} />
    </div>
  );
}
