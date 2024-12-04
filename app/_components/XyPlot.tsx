import React, { useRef, useEffect } from "react";
import * as Plotly from "plotly.js-dist-min";
import { FitDataElement } from "../_utils/detectPose";

interface StreamingChartProps {
  landmarkHistoryRef: React.RefObject<FitDataElement[]>;
}

const StreamingChart: React.FC<StreamingChartProps> = ({ landmarkHistoryRef }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const lastPlottedIndexRef = useRef<number>(0);

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
        xaxis: { title: "", color: "#ffffff", gridcolor: "#444444", showgrid: true },
        yaxis: { title: "Hip Angle (°)", color: "#ffffff", gridcolor: "#444444", showgrid: true },
        xaxis2: { title: "", color: "#ffffff", gridcolor: "#444444", showgrid: false },
        yaxis2: { title: "Knee Angle (°)", color: "#ffffff", gridcolor: "#444444", showgrid: true },
        xaxis3: { title: "", color: "#ffffff", gridcolor: "#444444", showgrid: false },
        yaxis3: { title: "Ankle Angle (°)", color: "#ffffff", gridcolor: "#444444", showgrid: true },
        xaxis4: { title: "", color: "#ffffff", gridcolor: "#444444", showgrid: false },
        yaxis4: { title: "Elbow Angle (°)", color: "#ffffff", gridcolor: "#444444", showgrid: true },
      };

      Plotly.newPlot(chartRef.current, initialData, layout);
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
          const xData = newData.map((_, index) => lastPlottedIndexRef.current + index);
          const hipData = newData.map((data) => data.fitGeometry.hip_angle);
          const kneeData = newData.map((data) => data.fitGeometry.knee_angle);
          const ankleData = newData.map((data) => data.fitGeometry.ankle_angle);
          const elbowData = newData.map((data) => data.fitGeometry.elbow_angle);

          Plotly.extendTraces(
            chartRef.current,
            {
              x: [xData, xData, xData, xData],
              y: [hipData, kneeData, ankleData, elbowData],
            },
            [0, 1, 2, 3]
          );

          lastPlottedIndexRef.current += newData.length;

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
        width: "100%",
        height: "800px",
        backgroundColor: "transparent",
      }}
    />
  );
};

export default StreamingChart;
