import { FaceDetector } from "@mediapipe/tasks-vision";
import { UnpackedLandmarks, LandmarkElement } from "./detectPose";

/**
 * Calculates the angle between two lines intersecting at a point in 3D space.
 * @param p1 - The first point on the first line.
 * @param p2 - The intersection point of the two lines.
 * @param p3 - The first point on the second line.
 * @returns The angle in radians between the two lines.
 */
function calculateAngleBetweenLines(p1: LandmarkElement, p2: LandmarkElement, p3: LandmarkElement): number {
  // Calculate vectors for the two lines
  const vector1 = { x: p1.x - p2.x, y: p1.y - p2.y, z: p1.z - p2.z };
  const vector2 = { x: p3.x - p2.x, y: p3.y - p2.y, z: p3.z - p2.z };

  // Dot product of the two vectors
  const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y + vector1.z * vector2.z;

  // Magnitudes of the vectors
  const magnitude1 = Math.sqrt(vector1.x ** 2 + vector1.y ** 2 + vector1.z ** 2);
  const magnitude2 = Math.sqrt(vector2.x ** 2 + vector2.y ** 2 + vector2.z ** 2);

  // Calculate the angle
  const angle = Math.acos(dotProduct / (magnitude1 * magnitude2)); //radians
  const angleDeg = (angle * 180) / Math.PI; //degrees

  return angleDeg;
}

// // Example usage:
// const p1: Point3D = { x: 1, y: 0, z: 0 };
// const p2: Point3D = { x: 0, y: 0, z: 0 };
// const p3: Point3D = { x: 0, y: 1, z: 0 };

// const angleInRadians = calculateAngleBetweenLines(p1, p2, p3);
// console.log(`Angle in radians: ${angleInRadians}`);
// console.log(`Angle in degrees: ${(angleInRadians * 180) / Math.PI}`);

function drawArcWithAngle(
  canvasCtx: CanvasRenderingContext2D,
  landmarks: LandmarkElement[],
  canvasWidth: number,
  canvasHeight: number,
  clockwise: boolean = true // Add a flag for clockwise or counterclockwise
) {
  if (landmarks.length < 3) {
    console.error("At least three landmarks are required to draw the arc.");
    return;
  }

  // Extract the points
  const p1 = landmarks[0];
  const p2 = landmarks[1];
  const p3 = landmarks[2];

  // Convert normalized coordinates to canvas pixel coordinates
  const point1 = { x: p1.xNormalized * canvasWidth, y: p1.yNormalized * canvasHeight };
  const point2 = { x: p2.xNormalized * canvasWidth, y: p2.yNormalized * canvasHeight };
  const point3 = { x: p3.xNormalized * canvasWidth, y: p3.yNormalized * canvasHeight };

  // Draw the connecting lines
  canvasCtx.beginPath();
  canvasCtx.moveTo(point1.x, point1.y);
  canvasCtx.lineTo(point2.x, point2.y);
  canvasCtx.lineTo(point3.x, point3.y);
  canvasCtx.strokeStyle = "white";
  canvasCtx.lineWidth = 1;
  canvasCtx.stroke();

  // Calculate the radius of the arc (distance between p1 and p2)
  const radius = Math.hypot(point1.x - point2.x, point1.y - point2.y);

  // Calculate angles
  const angle1 = Math.atan2(point1.y - point2.y, point1.x - point2.x);
  const angle2 = Math.atan2(point3.y - point2.y, point3.x - point2.x);

  let angleDegrees;

  // 3d calculation
  angleDegrees = calculateAngleBetweenLines(landmarks[0], landmarks[1], landmarks[2]);

  // or 2d calculation
  let angleBetween = Math.abs(angle2 - angle1);
  // Adjust angle based on clockwise flag
  if (!clockwise) {
    if (angleBetween > 0) angleBetween = 2 * Math.PI - angleBetween;
  }
  angleDegrees = (angleBetween * 180) / Math.PI;

  // Create a radial gradient for the arc fill
  const gradient = canvasCtx.createRadialGradient(point2.x, point2.y, 0, point2.x, point2.y, radius);
  gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)"); // Center of the arc
  gradient.addColorStop(0.5, "rgba(255, 255, 255, 0)"); // Outer edge of the arc

  // Apply gradient fill
  canvasCtx.fillStyle = gradient;
  canvasCtx.beginPath();
  canvasCtx.arc(point2.x, point2.y, radius, angle1, angle2, !clockwise);
  canvasCtx.lineTo(point2.x, point2.y);
  canvasCtx.closePath();
  canvasCtx.fill();

  // Draw angle text inside the arc
  // clockwise x
  let textX = point2.x + (radius / 2) * Math.cos((angle1 + angle2) / 2);

  if (!clockwise) {
    textX = point2.x - (radius / 2) * Math.cos((angle1 + angle2) / 2); // 1.1 fudge factor to account for text width
  }

  let textY = point2.y + (radius / 2) * Math.sin((angle1 + angle2) / 2);
  if (!clockwise) {
    textY = point2.y - (radius / 2) * Math.sin((angle1 + angle2) / 2);
  }

  canvasCtx.font = "14px Arial";
  canvasCtx.fillStyle = "white";
  canvasCtx.textAlign = "center";
  canvasCtx.textBaseline = "middle";
  canvasCtx.shadowColor = "black";
  canvasCtx.shadowBlur = 5;
  canvasCtx.shadowOffsetX = 3;
  canvasCtx.shadowOffsetY = 3;
  canvasCtx.fillText(`${angleDegrees.toFixed(0)}°`, textX, textY);

  //   // Set text style
  //   canvasCtx.font = "20px Arial";
  //   canvasCtx.textAlign = "center";
  //   canvasCtx.textBaseline = "middle";

  //   // Add a shadow to the text
  //   canvasCtx.shadowColor = "black";
  //   canvasCtx.shadowBlur = 5;
  //   canvasCtx.shadowOffsetX = 2;
  //   canvasCtx.shadowOffsetY = 2;

  //   // Draw a background box behind the text
  //   const text = `${Math.round(angleDegrees * (180 / Math.PI))}°`;
  //   const textWidth = canvasCtx.measureText(text).width;
  //   const textHeight = 20; // Height of the text

  //   // Draw the background rectangle
  //   canvasCtx.fillStyle = "rgba(255, 255, 255, 0.7)"; // Semi-transparent white
  //   canvasCtx.fillRect(point2.x - textWidth / 2 - 5, point2.y - textHeight / 2 - 5, textWidth + 10, textHeight + 10);

  //   // Draw text border (stroke)
  //   canvasCtx.lineWidth = 2;
  //   canvasCtx.strokeStyle = "black";
  //   canvasCtx.strokeText(text, point2.x, point2.y);

  //   // Fill the text with color
  //   canvasCtx.fillStyle = "black";
  //   canvasCtx.fillText(text, point2.x, point2.y);
}

export function drawFitMeasurements(
  landmarks: UnpackedLandmarks,
  canvasRef: CanvasRenderingContext2D,
  canvasHeight: number,
  canvasWidth: number
) {
  if (!landmarks || !landmarks.right_hip || !landmarks.left_hip.z) {
    return;
  }

  // check which side is closer and draw that one
  let facing_right;
  if (landmarks.right_hip.z < landmarks.left_hip.z) {
    facing_right = true;
  } else {
    facing_right = false;
  }

  // Draw inner Knee arc
  let wrist_landmark;
  let elbow_landmark;
  let shoulder_landmark;
  let hip_landmark;
  let knee_landmark;
  let ankle_landmark;

  if (facing_right) {
    wrist_landmark = landmarks.right_wrist;
    elbow_landmark = landmarks.right_elbow;
    shoulder_landmark = landmarks.right_shoulder;
    hip_landmark = landmarks.right_hip;
    knee_landmark = landmarks.right_knee;
    ankle_landmark = landmarks.right_ankle;
  } else {
    wrist_landmark = landmarks.left_wrist;
    elbow_landmark = landmarks.left_elbow;
    shoulder_landmark = landmarks.left_shoulder;
    hip_landmark = landmarks.left_hip;
    knee_landmark = landmarks.left_knee;
    ankle_landmark = landmarks.left_ankle;
  }
  if (landmarks && hip_landmark && knee_landmark && ankle_landmark) {
    drawArcWithAngle(
      canvasRef,
      [hip_landmark, knee_landmark, ankle_landmark],
      canvasHeight,
      canvasWidth,
      !facing_right
    );
  }

  // Draw hip arc
  if (landmarks && shoulder_landmark && hip_landmark && knee_landmark) {
    drawArcWithAngle(
      canvasRef,
      [shoulder_landmark, hip_landmark, knee_landmark],
      canvasHeight,
      canvasWidth,
      facing_right
    );
  }

  // Draw elbow arc
  if (landmarks && shoulder_landmark && elbow_landmark && wrist_landmark) {
    drawArcWithAngle(
      canvasRef,
      [shoulder_landmark, elbow_landmark, wrist_landmark],
      canvasHeight,
      canvasWidth,
      facing_right
    );
  }
}
