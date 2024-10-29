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

// Here we will store all values related to the current body geometry given the current and historical model outputs
interface bodyGeometry {
  landmark_history: UnpackedLandmarks[]; //todo use this for detecting things over time
  current_landmarks: UnpackedLandmarks;
  hip_angle: number;
  knee_angle: number;
  ankle_angle: number;

  hip_to_crank_distance: number;
  hip_to_wrist_distance: number;
}

interface UnpackedLandmarks {
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

// This list represents the order in which the Landmarks and WorldLandmarks results are returned from each model output.
// https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker/index#models
const landmarkKeys: (keyof UnpackedLandmarks)[] = [
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

function processLandmarkElements(landmarkResults: PoseLandmarkerResult): UnpackedLandmarks {
  const result = {} as UnpackedLandmarks;

  if (Array.isArray(landmarkResults?.worldLandmarks) && landmarkResults.worldLandmarks.length > 0) {
    // extract all world landmarks from results array in order
    landmarkKeys.forEach((key, index) => {
      result[key] = {
        name: landmarkKeys[index],
        x: landmarkResults.worldLandmarks[0][index].x,
        y: landmarkResults.worldLandmarks[0][index].y,
        z: landmarkResults.worldLandmarks[0][index].z,
        visibility: landmarkResults.worldLandmarks[0][index].visibility,
      };
    });
  }
  return result as UnpackedLandmarks;
}

function calculateKneeAngle(LandmarkResults: UnpackedLandmarks): number {
  return 0;
}

export default function PoseDetectionPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [parsedLandmarks, setParsedLandmarks] = useState<UnpackedLandmarks | null>(null);
  const [postProcessedData, setPostProcessedData] = useState<any>(null); // Replace 'any' with the actual type
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);

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
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;

        const recorder = new MediaRecorder(stream, { mimeType: "video/mp4" });

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

  // Function to run inference on each video frame
  const detectPose = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!poseLandmarker || !video || !canvas) return;

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
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const canvasCtx = canvas.getContext("2d");
    if (canvasCtx) {
      const drawingUtils = new DrawingUtils(canvasCtx!);
      let lastVideoTime = -1;

      let startTimeMs = performance.now();
      if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvas!.width, canvas!.height);
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
          canvasCtx.restore();
        });
      }

      // Draw the video frame onto the canvas so we can save it all in one place
      canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);

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
