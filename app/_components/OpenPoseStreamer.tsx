"use client";

import { useState, useEffect, useRef } from "react";
import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "@mediapipe/tasks-vision"; // Import necessary classes from MediaPipe

export default function PoseDetectionPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [videoSize, setVideoSize] = useState({ width: 640, height: 480 }); // Default size

  let poseLandmarker: PoseLandmarker | null = null;

  // WebGL Detection Function
  const isWebGLSupported = (): boolean => {
    try {
      const canvas = document.createElement("canvas");
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
    } catch (e) {
      return false;
    }
  };

  // Load the Pose Landmarker model with CPU or GPU delegate
  const loadPoseModel = async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        // path/to/wasm/root
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      const delegateType = isWebGLSupported() ? "GPU" : "CPU"; // Use GPU if available

      poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "/models/pose_landmarker_full.task", // Correct path to your model
          delegate: delegateType,
        },
        runningMode: "VIDEO",
        numPoses: 1,
      });

      console.log("Pose model loaded successfully.");
    } catch (error) {
      console.error("Error loading pose model:", error);
      // Optionally, set some state to inform the user about the error
      alert(
        "Failed to load pose model. Please check the console for more details."
      );
    }
  };

  // adjusts canvas size dynamically
  useEffect(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      const updateCanvasAndContainerSize = () => {
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        // Set the state to dynamically adjust the container size
        setVideoSize({ width: videoWidth, height: videoHeight });

        // Set the canvas size to match the video size
        canvas.width = videoWidth;
        canvas.height = videoHeight;
      };

      // Listen for when the video metadata is loaded to update sizes
      video.addEventListener("loadedmetadata", updateCanvasAndContainerSize);

      return () => {
        video.removeEventListener(
          "loadedmetadata",
          updateCanvasAndContainerSize
        );
      };
    }
  }, [videoRef, canvasRef]);

  // Initialize video stream
  useEffect(() => {
    const initializeVideoStream = async () => {
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoRef.current.srcObject = stream;
      }
    };

    initializeVideoStream();

    // Clean up video stream on component unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  // Function to run inference on each video frame
  const detectPose = async () => {
    if (!poseLandmarker || !videoRef.current || !canvasRef.current) return;

    // // Call pose detection
    // const results = poseLandmarker.detectForVideo(
    //   videoRef.current, // Video element
    //   Date.now() // Timestamp required for video mode
    // );

    // // Clear the canvas
    // const canvasCtx = canvasRef.current.getContext("2d");
    // canvasCtx?.clearRect(
    //     0,
    //     0,
    //     canvasRef.current.width,
    //     canvasRef.current.height
    // );

    // // Draw the pose landmarks on the canvas (if detected)
    // if (results.landmarks.length > 0) {
    //     console.log("yep we got something");
    //     //   results.landmarks.forEach((landmark) => {
    //     //     canvasCtx?.beginPath();
    //     //     canvasCtx?.arc(landmark[0], landmark[1], 5, 0, 2 * Math.PI);
    //     //     canvasCtx.fillStyle = "red";
    //     //     canvasCtx?.fill();
    //     //   });
    //   }
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;

    const canvasCtx = canvasRef.current.getContext("2d");
    if (canvasCtx) {
      const drawingUtils = new DrawingUtils(canvasCtx!);
      let lastVideoTime = -1;

      let startTimeMs = performance.now();
      if (lastVideoTime !== videoRef.current.currentTime) {
        lastVideoTime = videoRef.current.currentTime;
        poseLandmarker.detectForVideo(
          videoRef.current,
          startTimeMs,
          (result) => {
            canvasCtx.save();
            canvasCtx.clearRect(
              0,
              0,
              canvasRef.current!.width,
              canvasRef.current!.height
            );
            for (const landmark of result.landmarks) {
              drawingUtils.drawLandmarks(landmark, {
                radius: (data) =>
                  DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 2, 1),
              });
              drawingUtils.drawConnectors(
                landmark,
                PoseLandmarker.POSE_CONNECTIONS,
                {
                  lineWidth: 1, // Set the thickness of the lines
                  //   color: "#00FF00", // Optionally, you can also set the color of the lines
                }
              );
            }
            canvasCtx.restore();
          }
        );
      }

      // Process the next frame
      requestAnimationFrame(detectPose);
    }
  };

  // Initialize video stream and start inference
  useEffect(() => {
    const initializeVideoStream = async () => {
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoRef.current.srcObject = stream;

        // Wait for the video to start playing
        videoRef.current.onloadeddata = () => {
          detectPose(); // Start pose detection once the video is ready
        };
      }
    };

    loadPoseModel();
    initializeVideoStream();

    return () => {
      // Clean up video stream on component unmount
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        width: `${videoSize.width}px`,
        height: `${videoSize.height}px`,
        margin: "auto",
        border: "2px solid #000", // Optional
      }}
    >
      {/* Video Element (e.g., webcam stream) */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          display: "block",
          width: "100%",
          height: "100%",
        }}
      ></video>

      {/* Canvas Overlaying the Video */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none", // Ensure canvas doesn't interfere with video interactions
        }}
      ></canvas>
    </div>
  );
}
// control overall size and layout
const containerStyle: React.CSSProperties = {
  position: "relative",
  display: "inline-block",
  width: "640px", // Set to the desired size, or match the video dimensions dynamically
  height: "480px",
  margin: "auto", // This will center the video + canvas inside the parent container
  border: "2px solid #000", // Example border, can be adjusted or removed
};

// Style for the video
const videoStyle: React.CSSProperties = {
  display: "block", // Ensures it takes up the size of the container
  width: "100%",
  height: "100%",
};

// Style for the canvas to overlay exactly on the video
const canvasStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none", // Prevents the canvas from interfering with video interactions
};
