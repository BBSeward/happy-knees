"use client";

import { useState, useEffect, useRef } from "react";
import { PoseLandmarker, FilesetResolver, DrawingUtils, PoseLandmarkerResult } from "@mediapipe/tasks-vision"; // Import necessary classes from MediaPipe
import { useDetectPose, parsedLandmarks } from "../_utils/detectPose";

export default function PoseDetectionPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [poseLandmarker, setPoseLandmarker] = useState<any>(null);
  const { detectPose, parsedLandmarks } = useDetectPose(videoRef, canvasRef);

  const [postProcessedData, setPostProcessedData] = useState<any>(null); // Replace 'any' with the actual type
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [cameraInitialized, setCameraInitialized] = useState(false);

  // adjusts canvas size dynamically
  useEffect(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      const updateCanvasAndContainerSize = () => {
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        // Set the canvas size to match the video size
        canvas.width = videoWidth;
        canvas.height = videoHeight;
      };

      // Listen for when the video metadata is loaded to update sizes
      video.addEventListener("loadedmetadata", updateCanvasAndContainerSize);

      return () => {
        video.removeEventListener("loadedmetadata", updateCanvasAndContainerSize);
      };
    }
  }, [videoRef, canvasRef]);

  // Initialize video stream and media recorder for capturing the stream
  useEffect(() => {
    const initializeVideoStream = async () => {
      if (videoRef.current && canvasRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          videoRef.current.srcObject = stream;

          // Start pose detection once the video is ready
          videoRef.current.onloadeddata = () => {
            detectPose();
          };

          // Get the video track and its settings
          const videoTracks = stream.getVideoTracks();
          const { frameRate } = videoTracks[0].getSettings(); // Get the frame rate

          // Create MediaRecorder instance from the canvas stream
          const canvas = canvasRef.current;
          const combinedStream = canvas.captureStream(frameRate); // Capture at webcam's frame rate

          const recorder = new MediaRecorder(stream, { mimeType: "video/mp4" }); // CHANGE THIS TO COMBINED STREAM TO SAVE CANVAS

          recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              console.log("Data available:", event.data.size); // Log chunk size
              recordedChunksRef.current.push(event.data); // Use useRef to accumulate chunks
            }
          };

          recorder.onstop = () => {
            if (recordedChunksRef.current.length > 0) {
              const blob = new Blob(recordedChunksRef.current, { type: "video/mp4" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "recorded-video.mp4"; // Set the filename
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              recordedChunksRef.current = []; // Clear chunks after saving
            } else {
              console.error("No recorded data available");
            }
          };

          mediaRecorderRef.current = recorder;

          setCameraInitialized(true);
          console.log("Camera stream has been initialized");
        } catch (error) {
          console.error("Error accessing the camera:", error);
          setCameraInitialized(false);
          return null;
        }
      } else {
        console.log("videoRef or canvasRef not found for some reason");
      }
    };

    initializeVideoStream();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  // Start recording
  const startRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "inactive") {
      recordedChunksRef.current = []; // Clear previous recordings
      mediaRecorderRef.current.start(1000); // Start recording with a 1-second timeslice
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const LandmarkTable: React.FC<{ landmarks: typeof parsedLandmarks }> = ({ landmarks }) => {
    if (!landmarks) {
      return (
        <table>
          <tbody>
            <tr>
              <td>No landmarks detected</td>
            </tr>
          </tbody>
        </table>
      );
    }

    return (
      <div>
        <h2>Landmark Positions:</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>X Position</th>
              <th>Y Position</th>
              <th>Z Position</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(landmarks).map(([name, element]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{element?.x.toFixed(2)}</td>
                <td>{element?.y.toFixed(2)}</td>
                <td>{element?.z.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      {!cameraInitialized && <p>No camera found :(. Enable camera access and reload page</p>}
      <div
        style={{
          display: "flex", // Use flexbox to arrange video and table side by side
          justifyContent: "space-between",
          alignItems: "flex-start", // Align items to the top of the container
          width: "100%",
          height: "auto",
        }}
      >
        {/* Left Section: Video and Canvas */}
        <div
          style={{
            position: "relative", // Ensure canvas overlays the video
            width: "70%", // Adjust this to control the width of the video section
            height: "auto", // Let height adjust based on aspect ratio
          }}
        >
          {/* Video Element */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{
              display: "block",
              width: "100%",
              height: "auto",
            }}
          ></video>
          {/* Canvas Element - Overlay */}
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          ></canvas>
        </div>

        {/* Right Section: Table */}
        <div
          style={{
            width: "30%", // Adjust this to control the width of the table section
            marginLeft: "20px", // Adds some space between video and table
          }}
        >
          <div>
            <button onClick={startRecording} disabled={isRecording}>
              Start Recording
            </button>
            <button onClick={stopRecording} disabled={!isRecording}>
              Stop Recording
            </button>
          </div>
          {/* Table Component or Div */}
          <LandmarkTable landmarks={parsedLandmarks} />
        </div>
      </div>
    </>
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
