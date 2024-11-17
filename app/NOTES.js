/* 

todo:
overlay angles onto the canvas
  knee, hip, shoulder, elbow?
detect if cycling? 
  foot circle motion?
  specific trigger hand motion?
display approx camera angle from hip?
  also approx if camera is level or not?
live plots to right side of video

*/




// 1) handle failure to load model better? if cant load from latest, then run local?
// 2)
// in replay page, we will change logic such that the isPlaying flag will be changed to a stopDetection flag, with the logic reversed obviosly, 
// and then on line 33, we will call detectPose() directly

// so then, in the stream page, we will update it so that we also call the detectPose() but only after the loadmodel is done in the main useeffect, see this from CGPT:


// "

// ok, so stepping back, if loading this model is critical to the functionality of this component, how should we structure this? 
// ChatGPT said:
// ChatGPT
// If loading the model is critical to your component’s functionality, a good approach is to:

// Load the model once when the component mounts.
// Show a loading state until the model is ready.
// Handle errors gracefully if the model fails to load.
// This way, the component doesn’t attempt any functionality until the model is loaded, and users are aware of the loading process or any issues.

// Example Structure for Critical Model Loading
// Here’s a structured approach for handling this in your component:

// Add a loading and error state to track the model’s load status.
// Update the component’s UI to reflect these states.
// typescript
// Copy code

import { useEffect, useState } from "react";

export default function MyComponent() {
  const [isModelLoaded, setIsModelLoaded] = useState(false); // Track if the model is loaded
  const [error, setError] = useState<string | null>(null);    // Track loading errors

  // Critical function to load the model
  const loadPoseModel = async () => {
    try {
      // Simulate model loading, e.g., an async call to load the model
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Replace with actual model loading
      setIsModelLoaded(true);  // Set model as loaded
    } catch (err) {
      setError("Failed to load model.");
      console.error("Error loading model:", err);
    }
  };

  // Load model on component mount
  useEffect(() => {
    loadPoseModel();
  }, []);

  // Render based on loading and error states
  if (error) return <div>Error: {error}</div>;
  if (!isModelLoaded) return <div>Loading model...</div>;

  return (
    <div>
      <h2>Model Loaded Successfully</h2>
      {/* Main functionality dependent on the loaded model */}
    </div>
  );
}
// Explanation of Each Step
// isModelLoaded and error State: These states track the model’s status, which determines what the user sees and when the main functionality becomes accessible.
// Asynchronous Model Loading in loadPoseModel: Here, an asynchronous function attempts to load the model. If successful, isModelLoaded is set to true, and the component’s main functionality is displayed. If there’s an error, error is updated to display an error message.
// Conditional Rendering Based on State: The component displays loading or error messages until the model is ready. Once isModelLoaded is true, the main content is rendered.
// This setup helps ensure that the component only tries to run its main functionality when the model is ready, making the loading process clear to the user and handling errors in a user-friendly way.

// "