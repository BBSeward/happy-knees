// app/_utils/FitDataPostprocessing.ts
import { FitDataElement } from "./detectPose";

export const processFitData = (fitDataHistory: FitDataElement[]): FitDataElement[] => {
    // Skip processing if not enough data
    if (fitDataHistory.length < 3) return fitDataHistory;

    // Create a copy to avoid mutating the original
    let processedData = [...fitDataHistory];

    // Apply a simple moving average to smooth the angles
    const windowSize = 3;
    for (let i = windowSize - 1; i < processedData.length; i++) {
        const window = processedData.slice(i - (windowSize - 1), i + 1);
        
        // Calculate averages for each angle
        processedData[i].fitGeometry = {
            ...processedData[i].fitGeometry,
            hip_angle: average(window.map(d => d.fitGeometry.hip_angle)),
            knee_angle: average(window.map(d => d.fitGeometry.knee_angle)),
            ankle_angle: average(window.map(d => d.fitGeometry.ankle_angle)),
            elbow_angle: average(window.map(d => d.fitGeometry.elbow_angle))
        };
    }

    return processedData;
};

const average = (arr: number[]): number => {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
};