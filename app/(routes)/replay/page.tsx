// /app/replay/page.tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { PoseLandmarker, FilesetResolver, DrawingUtils, PoseLandmarkerResult } from "@mediapipe/tasks-vision"; // Import necessary classes from MediaPipe
import { useDetectPose } from "@/app/_utils/detectPose";
import { stopCoverage } from "v8";
import FitForm from "@/app/_components/Sidebar";
import { createTheme, MantineProvider } from "@mantine/core";
import TestPlot from "@/app/_components/test_plot";
import StreamingChart from "@/app/_components/XyPlot";
import HighlightAndZoomLineChart from "@/app/_components/LineChartRecharts";

export default function HistoryPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  //   const [poseLandmarker, setPoseLandmarker] = useState<any>(null);
  const { startPoseDetection, stopPoseDetection, parsedLandmarksRef } = useDetectPose(videoRef, canvasRef);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && videoRef.current) {
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

  const chartRef = useRef<any>(null);

  const sampleData = Array.from({ length: 1000 }, (_, i) => ({ x: i, y: Math.sin(i / 10) * 10 }));

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    // backgroundColor: "#000",
    // color: "#fff",
    minHeight: "100vh",
  };

  const plotStyle: React.CSSProperties = {
    width: "100%",
    // maxWidth: "800px",
    flexGrow: 1, // Allow the chart to grow dynamically
    // minHeight: "300px", // Ensure a minimum height
    // backgroundColor: "#222",
    border: "1px solid #444",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    // color: "#888",
    overflow: "hidden", // Prevent content overflow
  };

  return (
    <MantineProvider>
      <div
        style={{
          display: "flex", // Use flexbox to arrange video and table side by side
          // justifyContent: "space-between",
          alignItems: "flex-start", // Align items to the top of the container
          width: "100%",
          height: "auto",
        }}
      >
        {/* <h2 style={{ marginBottom: "10px" }}>Replay!!</h2> */}
        <div>
          <label
            style={{
              display: "inline-block",
              cursor: "pointer",
              padding: "5px",
              backgroundColor: "#007bff",
              color: "#fff",
              borderRadius: "4px",
              marginBottom: "10px", // Add bottom margin
            }}
          >
            Select Video to Replay
            <input
              type="file"
              accept="video/mp4"
              onChange={handleFileChange}
              style={{ display: "none" }} // Hide the native file input
            />
          </label>{" "}
          <canvas ref={canvasRef} width={640} height={480} style={{ border: "1px solid black" }} />
          <video ref={videoRef} loop width={640} height={480} style={{ border: "1px solid black" }} />
        </div>

        <div style={containerStyle}>
          <div style={plotStyle} id="plot1">
            <HighlightAndZoomLineChart data={sampleData} />
          </div>
          <div style={plotStyle} id="plot2">
            <TestPlot parsedLandmarksRef={parsedLandmarksRef} />{" "}
          </div>
          <div style={plotStyle} id="plot2">
            <StreamingChart />
          </div>
        </div>
      </div>
    </MantineProvider>
  );
}
