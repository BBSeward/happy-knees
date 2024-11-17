// utils/startPoseDetection.ts
import { PoseLandmarker, FilesetResolver, DrawingUtils, PoseLandmarkerResult } from "@mediapipe/tasks-vision"; // Import necessary classes from MediaPipe

import { useState, useRef, useEffect, RefObject } from "react";

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
  isPlayingRef: RefObject<boolean>
) => {
  const parsedLandmarksRef = useRef<UnpackedLandmarks | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const stopPoseDetectionRef = useRef<boolean>(false);

  let poseLandmarker: PoseLandmarker | null = null;
  console.log("useDetectPose initialized again!");

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
    console.log("wtf.");

    try {
      const vision = await FilesetResolver.forVisionTasks(
        // path/to/wasm/root
        "/models/wasm"
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
      alert("Failed to load pose model. Please check the console for more details.");
    }
  };

  const stopPoseDetection = () => {
    // tells the startPoseDetection async func to stop after its current interation
    stopPoseDetectionRef.current = true;
    console.log("stopping pose detection in useDetectPose");
  };

  const startPoseDetection = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    stopPoseDetectionRef.current = false;

    // console.log(`poseLadmarker was ${poseLandmarker}, isPlaying was ${isPlayingRef.current}`);
    if (!poseLandmarker || !canvas || !video) {
      // If any required component is not ready, continue polling
      console.log(
        `Something isnt ready for detection! poseLadmarker was ${poseLandmarker}, video ref was ${!video}, canvas ref was ${!canvas}, isPlaying was ${
          isPlayingRef.current
        }`
      );

      //continue processsing regardless. HMM NEEDT THIS??
      animationFrameRef.current = requestAnimationFrame(startPoseDetection);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const canvasCtx = canvas.getContext("2d");

    if (canvasCtx) {

      console.log("Detecting pose in useDetectPose.startPoseDetection");

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
          parsedLandmarksRef.current = processLandmarkElements(result);
        });
      }
      canvasCtx.restore();
    } else {
      console.log("2d canvas context wasnt ready for some reason")
    }

    if (stopPoseDetectionRef.current) {
      // end detection, let function end, reset stop pose flag
      stopPoseDetectionRef.current = true;
      console.log("startDetectionPose() has stopped");
    } else {
      // Continue the loop
      animationFrameRef.current = requestAnimationFrame(startPoseDetection);
    }
  };

  // Start detecting when poseLandmarker becomes available
  useEffect(() => {
    console.log("we in hook");
    loadPoseModel();

    // Cleanup function to cancel the animation frame
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  });

  return { startPoseDetection, stopPoseDetection };
};
