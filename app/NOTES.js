/* 

todo:
1. Core and advanced fit functionality:
  log angles over some time
  auto detect cycling, ignore other data
    first, hips must be perpendicular to the camera
    detect ankle/foot in circular motion
  while cycling, gather all the data and inteligently ignore outling points
    so that we end up with high confidence for the angles we care about
  What exactly are the final metrics that we want/need.
    Knee min
    knee max
    hip min
    hip max
    ablow avg
    phase 2:
    knee over toes
    ankle angle (toes down vs flat?)

2. visualise all the data
  will nee some filtering, so we only plot when there is motion?
  - knee VS crank rotation in a polar
  - hip angle vs crank angle in polar plot
  - min, max knee and hip angles vs time on either an xy, or just a vertical scale
  - elbow angle vs time on either an xy, or just a vertical scale
3. Saving data, user accounts
  first just let people input to a form and save the data locally
    Name, fit title, bike, seat hieght and other bike measurements?
  eventually make an account, save to DB

4. Auto suggest bike adjustmenst based upon measurements



detect if cycling? 
  foot circle motion?
display approx camera angle from hip?
  also approx if camera is level or not?
live plots to right side of video

offline/local model execution
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