"use client";

import { useRef } from "react";
import { useDetectPose } from "@/app/_utils/detectPose";
import SidebarForm from "@/app/_components/Sidebar";
import { createTheme, MantineProvider } from "@mantine/core";
import BikeForm from "./_components/BIkeMeasurmentForm";
import VideoUploader from "./_components/VideoUploader";
import "@mantine/core/styles.css";
import StreamingChart from "./_components/XyPlot";
import TestPlot from "./_components/test_plot";

const theme = createTheme({
  // colorScheme: 'dark', // Dark mode base
  primaryColor: "blue", // You can change this to your preferred primary color
  black: "#000000", // Explicit black for dark mode
  white: "#ffffff", // Explicit white for contrast
  colors: {
    dark: [
      "#C1C2C5", // Lighter shade for text
      "#A6A7AB",
      "#909296",
      "#5c5f66",
      "#373A40",
      "#2C2E33", // Default background
      "#25262B",
      "#1A1B1E", // Darker background
      "#141517",
      "#101113",
    ],
  },
});

export default function HomePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { startPoseDetection, stopPoseDetection, parsedLandmarksRef } = useDetectPose(videoRef, canvasRef);

  return (
    <MantineProvider>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "flex-start",
          width: "100%",
          height: "auto",
        }}
      >
        <BikeForm></BikeForm>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            width: "100%",
            maxWidth: "800px",
            margin: "20px",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "640px",
              backgroundColor: "rgb(44, 46, 51)",
              borderRadius: "8px",
            }}
          >
            <VideoUploader
              videoRef={videoRef}
              canvasRef={canvasRef}
              onFrame={startPoseDetection}
              onStop={stopPoseDetection}
              showControlsInside={false}
            />

            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "calc(100% - 56px)", // Subtract controls height
                pointerEvents: "none",
                zIndex: 1,
              }}
            />
          </div>
        </div>
        <StreamingChart />
        <TestPlot parsedLandmarksRef={parsedLandmarksRef} />{" "}
      </div>
    </MantineProvider>
  );
}
