// /app/replay/page.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { PoseLandmarker, FilesetResolver, DrawingUtils, PoseLandmarkerResult } from "@mediapipe/tasks-vision"; // Import necessary classes from MediaPipe
import { useDetectPose } from "@/app/_utils/detectPose";
import { stopCoverage } from "v8";

export default function HistoryPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  //   const [poseLandmarker, setPoseLandmarker] = useState<any>(null);
  const isPlayingRef = useRef(false);
  const { startPoseDetection, stopPoseDetection } = useDetectPose(videoRef, canvasRef, isPlayingRef);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && videoRef.current) {
      setVideoFile(file);

      const url = URL.createObjectURL(file);
      console.log(`Loaded file ${file.name} and applying url: ${url}`);
      //Stopping pose detection we update the video ref to the new source
      stopPoseDetection();
      console.log("Loading video in history page, stopping any existing pose detection");

      videoRef.current.src = url;
      // Add an event listener to wait for the video to be ready
      videoRef.current.addEventListener("loadeddata", () => {
        videoRef.current?.play();
        startPoseDetection();
        console.log("History page video loadeddata has executed, started pose detection");
      });
    }
  };

  return (
    <div>
      <h2>Replay!!</h2>
      <input type="file" accept="video/mp4" onChange={handleFileChange} />
      <canvas ref={canvasRef} width={640} height={480} style={{ border: "1px solid black" }} />
      <video ref={videoRef} loop width={640} height={480} style={{ border: "1px solid black" }} />
    </div>
  );
}
