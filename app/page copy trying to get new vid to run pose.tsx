"use client";

import { useRef } from "react";
import { useDetectPose } from "@/app/_utils/detectPose";
import SidebarForm from "@/app/_components/Sidebar";
import { createTheme, MantineProvider } from "@mantine/core";
import BikeForm from "./_components/BIkeMeasurmentForm";
import VideoUploader from "./_components/VideoUploader";
import "@mantine/core/styles.css";

const theme = createTheme({
  primaryColor: "blue",
  black: "#000000",
  white: "#ffffff",
  colors: {
    dark: [
      "#C1C2C5",
      "#A6A7AB",
      "#909296",
      "#5c5f66",
      "#373A40",
      "#2C2E33",
      "#25262B",
      "#1A1B1E",
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
              width: "640px",
              height: "480px",
            }}
          >
            <VideoUploader
              videoRef={videoRef}
              canvasRef={canvasRef}
              onFrame={startPoseDetection}
              onStop={stopPoseDetection}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 1,
              }}
            />
          </div>
        </div>
      </div>
    </MantineProvider>
  );
}
