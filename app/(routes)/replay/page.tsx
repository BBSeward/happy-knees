// /app/replay/page.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { PoseLandmarker, FilesetResolver, DrawingUtils, PoseLandmarkerResult } from "@mediapipe/tasks-vision"; // Import necessary classes from MediaPipe
import { useDetectPose } from "@/app/_utils/detectPose";

export default function HistoryPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  //   const [poseLandmarker, setPoseLandmarker] = useState<any>(null);
  const isPlayingRef = useRef(false);
  useDetectPose(videoRef, canvasRef, isPlayingRef);

  console.log("History page was rerendered :/");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    isPlayingRef.current = false;

    console.log("Video playing is false");
    const file = event.target.files?.[0];
    if (file && videoRef.current) {
      setVideoFile(file);

      const url = URL.createObjectURL(file);
      console.log(`Loaded file ${file.name} and applying url: ${url}`);
      videoRef.current.src = url;
      // Add an event listener to wait for the video to be ready
      videoRef.current.addEventListener("loadeddata", () => {
        videoRef.current?.play();
        isPlayingRef.current = true;

        console.log("Video playing is true now");

        // Start detection after the video has started
        // TODO conside removing this if the hook is watching isPlaying as well
        // detectPose();
      });
    }
  };

  return (
    <div>
      <h2>Replay!!</h2>
      <input type="file" accept="video/mp4" onChange={handleFileChange} />
      <video ref={videoRef} loop width={640} height={480} style={{ border: "1px solid black" }} />
      <canvas ref={canvasRef} width={640} height={480} style={{ border: "1px solid black" }} />
    </div>
  );
}
