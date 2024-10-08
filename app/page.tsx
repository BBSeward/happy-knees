"use client";

import PoseDetectionPage from "./_components/OpenPoseStreamer";

export default function HomePage() {
  return (
    <div>
      <h1>Welcome to the Pose Detection App</h1>
      {/* Render the Pose Detection component */}
      <PoseDetectionPage />
    </div>
  );
}
