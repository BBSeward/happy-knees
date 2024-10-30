// utils/detectPose.ts
import { PoseLandmarker, FilesetResolver, DrawingUtils, PoseLandmarkerResult } from "@mediapipe/tasks-vision"; // Import necessary classes from MediaPipe

import { useState, useRef, useEffect } from "react";

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

function calculateKneeAngle(LandmarkResults: UnpackedLandmarks): number {
  return 0;
}

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

export const useDetectPose = (
  videoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  isPlaying: boolean

) => {
  const [parsedLandmarks, setParsedLandmarks] = useState<UnpackedLandmarks | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  let poseLandmarker = null;

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
      console.log("pose landmer is good! it is:");
      console.log(poseLandmarker);

      console.log("Pose model loaded successfully.");
    } catch (error) {
      console.error("Error loading pose model:", error);
      // Optionally, set some state to inform the user about the error
      alert("Failed to load pose model. Please check the console for more details.");
    }
  };

  const detectPose = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!poseLandmarker || !video || !canvas) {
      // If any required component is not ready, continue polling
      console.log("Shit, pose landmarker is not ready??");
      animationFrameRef.current = requestAnimationFrame(detectPose);
      return;
    }

    console.log("Cool, we are detecting in detect Pose");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const canvasCtx = canvas.getContext("2d");

    if (canvasCtx) {
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvasCtx.save();

      const drawingUtils = new DrawingUtils(canvasCtx!);
      let lastVideoTime = -1;

      let startTimeMs = performance.now();
      if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
          for (const landmark of result.landmarks) {
            drawingUtils.drawLandmarks(landmark, {
              radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 1, 1),
            });
            drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS, {
              lineWidth: 1,
            });
          }
          setParsedLandmarks(processLandmarkElements(result));
        });
      }
      canvasCtx.restore();
    }

    // Continue the loop
    animationFrameRef.current = requestAnimationFrame(detectPose);
  };


  // Start detecting when poseLandmarker becomes available
  useEffect(() => {
    loadPoseModel();

    // if (poseLandmarker) {
    //   detectPose(); // Start pose detection when the landmarker is ready
    // }
    // Cleanup function to cancel the animation frame
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return { detectPose, parsedLandmarks };
};
