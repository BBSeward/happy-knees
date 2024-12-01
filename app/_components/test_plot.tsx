import React, { useEffect, useState } from "react";
import { UnpackedLandmarks } from "../_utils/detectPose";
import PolarChart from "./PolarPlot";

interface PlotComponentProps {
  parsedLandmarksRef: React.RefObject<UnpackedLandmarks | null>;
}

const TestPlot: React.FC<PlotComponentProps> = ({ parsedLandmarksRef }) => {
  const [landmarks, setLandmarks] = useState<UnpackedLandmarks[]>([]);

  //   useEffect(() => {
  //     const interval = setInterval(() => {
  //       if (parsedLandmarksRef?.current && Object.keys(parsedLandmarksRef?.current).length !== 0) {
  //         // console.log("we in interval")
  //         console.log(landmarks[0]);
  //         console.log(parsedLandmarksRef.current.left_ankle?.x);
  //         setLandmarks((prevLandmarks) => {
  //           const newLandmarks = [
  //             ...prevLandmarks.slice(-99), // Keep the last 100 data points
  //             parsedLandmarksRef.current,
  //           ];
  //           return [...newLandmarks]; // Ensure a new reference
  //         });
  //       }
  //     }, 100);

  //     return () => clearInterval(interval); // Clean up on unmount
  //   }, [parsedLandmarksRef]);

  const data = [
    { angle: 0, value: 10 },
    { angle: 62, value: 20 },
    { angle: 93, value: 15 },
    { angle: 138, value: 25 },
    { angle: 184, value: 30 },
    { angle: 225, value: 20 },
    { angle: 270, value: 10 },
    { angle: 315, value: 15 },
  ];
  return (
    <div style={{ width: "100%", border: "1px solid black" }}>
      <PolarChart data={data} />
    </div>
  );
};

export default TestPlot;
