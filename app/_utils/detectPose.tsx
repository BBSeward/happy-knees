// utils/startPoseDetection.ts
import { PoseLandmarker, FilesetResolver, DrawingUtils, PoseLandmarkerResult } from "@mediapipe/tasks-vision"; // Import necessary classes from MediaPipe
import { drawFitMeasurements } from "./drawingUtils";
import { useState, useRef, useEffect, RefObject } from "react";

export interface LandmarkElement {
  /**
   * Landmark represents a point in 3D space with x, y, z coordinates. The
   * landmark coordinates are in meters. z represents the landmark depth,
   * and the smaller the value the closer the world landmark is to the camera.
   */
  /**
   * Normalized Landmark represents a point in 3D space with x, y, z coordinates.
   * x and y are normalized to [0.0, 1.0] by the image width and height
   * respectively. z represents the landmark depth, and the smaller the value the
   * closer the landmark is to the camera. The magnitude of z uses roughly the
   * same scale as x.
   */
  name: string;
  x: number;
  y: number;
  z: number;
  xNormalized: number;
  yNormalized: number;
  zNormalized: number;
  visibility?: number;
}

// Here we will store all values related to the current body geometry given the current and historical model outputs
export interface UnpackedLandmarks {
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

interface FitMeasurements {
  current_landmarks: UnpackedLandmarks;
  hip_angle: number;
  knee_angle: number;
  ankle_angle: number;
  elbow_angle: number;

  crank_angle: number;
}

export interface FitDataElement {
  unpackedLandmarks: UnpackedLandmarks;
  fitGeometry: FitMeasurements;
  timestamp: number;
}

function angleBetweenThreePoints(point1: LandmarkElement, point2: LandmarkElement, point3: LandmarkElement): number {
  return Math.abs(
    Math.atan2(point3.y - point2.y, point3.x - point2.x) - Math.atan2(point1.y - point2.y, point1.x - point2.x)
  );
  // const angle1 = Math.atan2(point1.y - point2.y, point1.x - point2.x);
  // const angle2 = Math.atan2(point3.y - point2.y, point3.x - point2.x);
  // let angleBetween = Math.abs(angle2 - angle1);;
}

function processLandmarkElements(landmarkResults: PoseLandmarkerResult): UnpackedLandmarks {
  // Convert the landmarkResults array into a UnpackedLandmarks object
  const result = {} as UnpackedLandmarks;

  if (Array.isArray(landmarkResults?.worldLandmarks) && landmarkResults.worldLandmarks.length > 0) {
    // extract all world landmarks from results array in order
    landmarkKeys.forEach((key, index) => {
      result[key] = {
        name: landmarkKeys[index],
        x: landmarkResults.worldLandmarks[0][index].x,
        y: landmarkResults.worldLandmarks[0][index].y,
        z: landmarkResults.worldLandmarks[0][index].z,
        xNormalized: landmarkResults.landmarks[0][index].x,
        yNormalized: landmarkResults.landmarks[0][index].y,
        zNormalized: landmarkResults.landmarks[0][index].z,
        visibility: landmarkResults.worldLandmarks[0][index].visibility,
      };
    });
  }

  return result as UnpackedLandmarks;
}

export const useDetectPose = (
  videoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  fitDataHistoryRef: React.RefObject<FitDataElement[]>
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

  const drawPoseFromHistory = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!poseLandmarker || !canvas || !video) {
      // animationFrameRef.current = requestAnimationFrame(startPoseDetection);
      return;
    }

    const canvasCtx = canvas.getContext("2d");

    if (canvasCtx) {
      console.log("drawing pose from history");
      // Clear canvas, draw frame and save state
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvasCtx.save();

      // const drawingUtils = new DrawingUtils(canvasCtx!);
      // let lastVideoTime = -1;

      // // Then detect pose and draw measurements in the same frame
      // const currentLandmark = getLandmarkFromHistory(fitDataHistoryRef.current, video.currentTime);
      // parsedLandmarksRef.current = currentLandmark; // needed here??

      // if (!currentLandmark) {
      //   console.log("no landmark found for current time!! WTF");
      //   return;
      // }

      // const measurements = drawFitMeasurements(currentLandmark, canvasCtx, canvas.width, canvas.height);

      canvasCtx.save();

      // //optionally draw landmarks using built in drawing utils
      // for (const landmark of currentLandmark.landmarks) {
      //   drawingUtils.drawLandmarks(landmark, {
      //     radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 1, 1),
      //   });
      //   drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS, {
      //     lineWidth: 1,
      //   });
      // }

      canvasCtx.restore();
    } else {
      console.log("2d canvas context wasnt ready for some reason");
    }
  };

  const runPoseDetection = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    stopPoseDetectionRef.current = false;

    if (!poseLandmarker || !canvas || !video) {
      // animationFrameRef.current = requestAnimationFrame(startPoseDetection);
      return;
    }

    const canvasCtx = canvas.getContext("2d");

    if (canvasCtx) {
      // Clear canvas, draw frame and save state
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvasCtx.save();

      const drawingUtils = new DrawingUtils(canvasCtx!);
      let lastVideoTime = -1;

      if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        console.log("lastVideoTime", lastVideoTime);

        // Then detect pose and draw measurements in the same frame
        poseLandmarker.detectForVideo(video, video.currentTime * 1000, (result) => {
          parsedLandmarksRef.current = processLandmarkElements(result);

          // if we have good results
          if (Object.keys(parsedLandmarksRef.current).length !== 0) {
            // Draw measurements
            const measurements = drawFitMeasurements(
              parsedLandmarksRef.current,
              canvasCtx,
              canvas.width,
              canvas.height
            );
            if (measurements) {
              const { elbow_angle, knee_angle, ankle_angle, hip_angle } = measurements;
              // Save landmark history
              if (fitDataHistoryRef.current) {
                fitDataHistoryRef.current.push({
                  unpackedLandmarks: parsedLandmarksRef.current,
                  fitGeometry: {
                    current_landmarks: parsedLandmarksRef.current,
                    hip_angle,
                    knee_angle,
                    ankle_angle,
                    elbow_angle,
                    hip_to_crank_distance: 0,
                    hip_to_wrist_distance: 0,
                  },
                  timestamp: video.currentTime,
                });
                // Keep array size under 50000 elements
                if (fitDataHistoryRef.current.length > 50000) {
                  fitDataHistoryRef.current.splice(0, fitDataHistoryRef.current.length - 50000);
                }
              }
            }
          }
          canvasCtx.save();

          for (const landmark of result.landmarks) {
            drawingUtils.drawLandmarks(landmark, {
              radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 1, 1),
            });
            drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS, {
              lineWidth: 1,
            });
          }
        });
      }
      canvasCtx.restore();
    } else {
      console.log("2d canvas context wasnt ready for some reason");
    }

    if (stopPoseDetectionRef.current) {
      // end detection, let function end, reset stop pose flag
      stopPoseDetectionRef.current = true;
      console.log("startDetectionPose() has stopped");
    } else {
      // Continue the loop
      // animationFrameRef.current = requestAnimationFrame(startPoseDetection);
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

  return { runPoseDetection, stopPoseDetection, drawPoseFromHistory };
};
