import { UnpackedLandmarks } from "./detectPose";
function drawArcWithAngle(
  canvasCtx: CanvasRenderingContext2D,
  landmarks: { x: number; y: number }[],
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
  const point1 = { x: p1.x * canvasWidth, y: p1.y * canvasHeight };
  const point2 = { x: p2.x * canvasWidth, y: p2.y * canvasHeight };
  const point3 = { x: p3.x * canvasWidth, y: p3.y * canvasHeight };

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
  let angleBetween = Math.abs(angle2 - angle1);

  // Adjust angle based on clockwise flag
  if (!clockwise) {
    if (angleBetween > 0) angleBetween = 2 * Math.PI - angleBetween;
  }
  const angleDegrees = (angleBetween * 180) / Math.PI;

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

// Example usage in your render loop:
const drawLandmarksWithFancyArc = (
  canvasCtx: CanvasRenderingContext2D,
  landmarks: Array<{ x: number; y: number }>, // Normalized landmark data
  canvasWidth: number,
  canvasHeight: number,
  drawingUtils: any
) => {
  // Draw the landmarks
  drawingUtils.drawLandmarks(canvasCtx, landmarks);

  // Draw the fancy arc using the first three landmarks
  if (landmarks.length >= 3) {
    drawArcWithAngle(canvasCtx, landmarks.slice(0, 3), canvasWidth, canvasHeight);
  }
};

export function drawFitMeasurements(
  landmarks: UnpackedLandmarks,
  canvasRef: CanvasRenderingContext2D,
  canvasHeight: number,
  canvasWidth: number
) {
  // Draw inner Knee arc
  if (landmarks && landmarks.left_hip && landmarks.left_knee && landmarks.left_ankle) {
    drawArcWithAngle(
      canvasRef,
      [
        { x: landmarks.left_hip.xNormalized, y: landmarks.left_hip.yNormalized },
        { x: landmarks.left_knee.xNormalized, y: landmarks.left_knee.yNormalized },
        { x: landmarks.left_ankle.xNormalized, y: landmarks.left_ankle.yNormalized },
      ],
      canvasHeight,
      canvasWidth,
      true
    );
  }

  // Draw hip arc
  if (landmarks && landmarks.left_hip && landmarks.left_knee && landmarks.left_ankle) {
    drawArcWithAngle(
      canvasRef,
      [
        { x: landmarks.left_shoulder.xNormalized, y: landmarks.left_shoulder.yNormalized },
        { x: landmarks.left_hip.xNormalized, y: landmarks.left_hip.yNormalized },
        { x: landmarks.left_knee.xNormalized, y: landmarks.left_knee.yNormalized },
      ],
      canvasHeight,
      canvasWidth,
      false
    );
  }

  // Draw elbow arc
  if (landmarks && landmarks.left_hip && landmarks.left_knee && landmarks.left_ankle) {
    drawArcWithAngle(
      canvasRef,
      [
        { x: landmarks.left_shoulder.xNormalized, y: landmarks.left_shoulder.yNormalized },
        { x: landmarks.left_elbow.xNormalized, y: landmarks.left_elbow.yNormalized },
        { x: landmarks.left_wrist.xNormalized, y: landmarks.left_wrist.yNormalized },
      ],
      canvasHeight,
      canvasWidth,
      false
    );
  }
}
