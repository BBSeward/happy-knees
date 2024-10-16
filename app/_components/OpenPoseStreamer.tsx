"use client";

import { useState, useEffect, useRef } from "react";
import { PoseLandmarker, FilesetResolver, DrawingUtils, PoseLandmarkerResult } from "@mediapipe/tasks-vision"; // Import necessary classes from MediaPipe

interface LandmarkElement {
  name: string;
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

interface LandmarkResults {
  nose: LandmarkElement;
  left_eye_inner: LandmarkElement;
  left_eye: LandmarkElement;
  left_eye_outer: LandmarkElement;
  right_eye_inner: LandmarkElement;
  right_eye: LandmarkElement;
  right_eye_outer: LandmarkElement;
  left_ear: LandmarkElement;
  right_ear: LandmarkElement;
  mouth_left: LandmarkElement;
  mouth_right: LandmarkElement;
  left_shoulder: LandmarkElement;
  right_shoulder: LandmarkElement;
  left_elbow: LandmarkElement;
  right_elbow: LandmarkElement;
  left_wrist: LandmarkElement;
  right_wrist: LandmarkElement;
  left_pinky: LandmarkElement;
  right_pinky: LandmarkElement;
  left_index: LandmarkElement;
  right_index: LandmarkElement;
  left_thumb: LandmarkElement;
  right_thumb: LandmarkElement;
  left_hip: LandmarkElement;
  right_hip: LandmarkElement;
  left_knee: LandmarkElement;
  right_knee: LandmarkElement;
  left_ankle: LandmarkElement;
  right_ankle: LandmarkElement;
  left_heel: LandmarkElement;
  right_heel: LandmarkElement;
  left_foot_index: LandmarkElement;
  right_foot_index: LandmarkElement;
}
const landmarkKeys: (keyof LandmarkResults)[] = [
  "nose",
  "left_eye_inner",
  "left_eye",
  "left_eye_outer",
  "right_eye_inner",
  "right_eye",
  "right_eye_outer",
  "left_ear",
  "right_ear",
  "mouth_left",
  "mouth_right",
  "left_shoulder",
  "right_shoulder",
  "left_elbow",
  "right_elbow",
  "left_wrist",
  "right_wrist",
  "left_pinky",
  "right_pinky",
  "left_index",
  "right_index",
  "left_thumb",
  "right_thumb",
  "left_hip",
  "right_hip",
  "left_knee",
  "right_knee",
  "left_ankle",
  "right_ankle",
  "left_heel",
  "right_heel",
  "left_foot_index",
  "right_foot_index",
];

function processLandmarkElements(landmarkResults: PoseLandmarkerResult): LandmarkResults {
  const result: Partial<LandmarkResults> = {};
  
  landmarkKeys.forEach((key, index) => {
    result[key] = {
      name: landmarkKeys[index],
      x: landmarkResults.worldLandmarks[0][index].x,
      y: landmarkResults.worldLandmarks[0][index].y,
      z: landmarkResults.worldLandmarks[0][index].z,
      visibility: landmarkResults.worldLandmarks[0][index].visibility,
    };
    // LandmarkElement landmarkResults.landmarks[index];
  });
  return result as LandmarkResults;
}

function calculateKneeAngle(LandmarkResults: LandmarkResults): number {
  return 0;
}

export default function PoseDetectionPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [parsedLandmarks, setParsedLandmarks] = useState<LandmarkResults | null>(null);
  const [postProcessedData, setPostProcessedData] = useState<any>(null); // Replace 'any' with the actual type

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
      alert("Failed to load pose model. Please check the console for more details.");
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
        poseLandmarker.detectForVideo(videoRef.current, startTimeMs, (result) => {
          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
          for (const landmark of result.landmarks) {
            drawingUtils.drawLandmarks(landmark, {
              radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 2, 1),
            });
            drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS, {
              lineWidth: 1, // Set the thickness of the lines
              //   color: "#00FF00", // Optionally, you can also set the color of the lines
            });
          }
          setParsedLandmarks(processLandmarkElements(result));
          console.log(result.worldLandmarks);
          canvasCtx.restore();
        });
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
          video: {
            width: { ideal: 1920 }, // Request 1920px width (1080p)
            height: { ideal: 1080 }, // Request 1080px height (1080p)
            facingMode: "user", // Use the front-facing camera
          },
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

  const LandmarkTable: React.FC<{ landmarks: typeof parsedLandmarks }> = ({ landmarks }) => {
    console.log("loging landmarks");
    console.log(landmarks);
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
            <tr>
              <td>{landmarks?.left_ankle.name}</td>
              <td>{landmarks?.left_ankle.x.toFixed(2)}</td>
              <td>{landmarks?.left_ankle.y.toFixed(2)}</td>
              <td>{landmarks?.left_ankle.z.toFixed(2)}</td>
            </tr>
            <tr>
              <td>{landmarks?.right_ankle.name}</td>
              <td>{landmarks?.right_ankle.x.toFixed(2)}</td>
              <td>{landmarks?.right_ankle.y.toFixed(2)}</td>
              <td>{landmarks?.right_ankle.z.toFixed(2)}</td>
            </tr>
            <tr>
              <td>{landmarks?.left_knee.name}</td>
              <td>{landmarks?.left_knee.x.toFixed(2)}</td>
              <td>{landmarks?.left_knee.y.toFixed(2)}</td>
              <td>{landmarks?.left_knee.z.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
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
            width: "100%", // Video takes up the full width of its container
            height: "auto", // Maintain aspect ratio
          }}
        ></video>

        {/* Canvas Element - Overlay */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%", // Canvas overlays on video
            height: "100%", // Canvas matches video height
            pointerEvents: "none", // Ensure canvas doesn't interfere with user interactions
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
        {/* Table Component or Div */}
        <LandmarkTable landmarks={parsedLandmarks} />
      </div>
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
