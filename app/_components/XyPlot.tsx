import React, { useRef, useEffect } from "react";
import * as Plotly from "plotly.js-dist-min";
import { FitDataElement } from "../_utils/detectPose";

interface StreamingChartProps {
  landmarkHistoryRef: React.RefObject<FitDataElement[]>;
  setTimeWindow?: (callback: (seconds: number) => void) => void;
}

const downloadJson = (data: any, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const StreamingChart: React.FC<StreamingChartProps> = ({ landmarkHistoryRef, setTimeWindow }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const lastPlottedIndexRef = useRef<number>(0);
  const timeWindowRef = useRef<number>(20); // Default 10 second window

  // Function to update time window
  const updateTimeWindow = (seconds: number) => {
    timeWindowRef.current = seconds;
    if (chartRef.current) {
      Plotly.relayout(chartRef.current, {
        "xaxis.range": [0, seconds],
        "xaxis2.range": [0, seconds],
        "xaxis3.range": [0, seconds],
        "xaxis4.range": [0, seconds],
      });
    }
  };

  // Expose the update function through the prop
  useEffect(() => {
    if (setTimeWindow) {
      setTimeWindow(updateTimeWindow);
    }
  }, [setTimeWindow]);

  useEffect(() => {
    if (chartRef.current) {
      const initialData: Partial<Plotly.PlotData>[] = [
        {
          x: [] as number[],
          y: [] as number[],
          mode: "lines",
          type: "scatter",
          name: "Hip Angle",
          marker: { color: "#f39c12" },
          line: { color: "#f39c12", width: 2 },
          xaxis: "x",
          yaxis: "y",
        },
        {
          x: [] as number[],
          y: [] as number[],
          mode: "lines",
          type: "scatter",
          name: "Knee Angle",
          marker: { color: "#2ecc71" },
          line: { color: "#2ecc71", width: 2 },
          xaxis: "x2",
          yaxis: "y2",
        },
        {
          x: [] as number[],
          y: [] as number[],
          mode: "lines",
          type: "scatter",
          name: "Ankle Angle",
          marker: { color: "#e74c3c" },
          line: { color: "#e74c3c", width: 2 },
          xaxis: "x3",
          yaxis: "y3",
        },
        {
          x: [] as number[],
          y: [] as number[],
          mode: "lines",
          type: "scatter",
          name: "Elbow Angle",
          marker: { color: "#3498db" },
          line: { color: "#3498db", width: 2 },
          xaxis: "x4",
          yaxis: "y4",
        },
      ];

      const layout: Partial<Plotly.Layout> = {
        grid: { rows: 4, columns: 1, pattern: "independent" },
        height: 800,
        showlegend: false,
        plot_bgcolor: "transparent",
        paper_bgcolor: "transparent",
        margin: { t: 30, r: 30, b: 30, l: 50 },
        xaxis: { 
          title: "", 
          color: "#ffffff", 
          gridcolor: "#444444", 
          showgrid: true,
          tickformat: "%M:%S",
          range: [0, timeWindowRef.current]
        },
        yaxis: { title: "Hip Angle (°)", color: "#ffffff", gridcolor: "#444444", showgrid: true },
        xaxis2: { 
          title: "", 
          color: "#ffffff", 
          gridcolor: "#444444", 
          showgrid: false,
          tickformat: "%M:%S",
          range: [0, timeWindowRef.current]
        },
        yaxis2: { title: "Knee Angle (°)", color: "#ffffff", gridcolor: "#444444", showgrid: true },
        xaxis3: { 
          title: "", 
          color: "#ffffff", 
          gridcolor: "#444444", 
          showgrid: false,
          tickformat: "%M:%S",
          range: [0, timeWindowRef.current]
        },
        yaxis3: { title: "Ankle Angle (°)", color: "#ffffff", gridcolor: "#444444", showgrid: true },
        xaxis4: { 
          title: "", 
          color: "#ffffff", 
          gridcolor: "#444444", 
          showgrid: false,
          tickformat: "%M:%S",
          range: [0, timeWindowRef.current]
        },
        yaxis4: { title: "Elbow Angle (°)", color: "#ffffff", gridcolor: "#444444", showgrid: true },
      };

      const config = {responsive: true}


      Plotly.newPlot(chartRef.current, initialData, layout, config);
    }

    return () => {
      if (chartRef.current) {
        Plotly.purge(chartRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const updateInterval = setInterval(() => {
      if (chartRef.current && landmarkHistoryRef.current) {
        const newData = landmarkHistoryRef.current.slice(lastPlottedIndexRef.current);

        if (newData.length > 0) {
          const xData = newData.map(data => data.timestamp);
          const hipData = newData.map(data => data.fitGeometry.hip_angle);
          const kneeData = newData.map(data => data.fitGeometry.knee_angle);
          const ankleData = newData.map(data => data.fitGeometry.ankle_angle);
          const elbowData = newData.map(data => data.fitGeometry.elbow_angle);

          Plotly.extendTraces(
            chartRef.current,
            {
              x: [xData, xData, xData, xData],
              y: [hipData, kneeData, ankleData, elbowData],
            },
            [0, 1, 2, 3]
          );

          lastPlottedIndexRef.current += newData.length;

          // // Check if we've exceeded 5000 points and download data
          // if (landmarkHistoryRef.current.length > 500) {
          //   // Create timestamp for unique filename
          //   const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          //   const filename = `landmark-history-${timestamp}.json`;
            
          //   // Save to file
          //   downloadJson(landmarkHistoryRef.current, filename);
            
          //   // Clear the history (optional - remove if you want to keep collecting)
          //   landmarkHistoryRef.current = landmarkHistoryRef.current.slice(-1000);
          //   lastPlottedIndexRef.current = 0;
          // }

          // Keep only last 1000 points visible on all subplots
          if (lastPlottedIndexRef.current > 1000) {
            const range = [lastPlottedIndexRef.current - 1000, lastPlottedIndexRef.current];
            Plotly.relayout(chartRef.current, {
              "xaxis.range": range,
              "xaxis2.range": range,
              "xaxis3.range": range,
              "xaxis4.range": range,
            });
          }
        }
      }
    }, 100);

    return () => clearInterval(updateInterval);
  }, [landmarkHistoryRef]);

  return (
    <div
      ref={chartRef}
      style={{
        justifyContent: "center",
        width: "100%",
        height: "800px",
        backgroundColor: "transparent",
      }}
    />
  );
};

export default StreamingChart;
