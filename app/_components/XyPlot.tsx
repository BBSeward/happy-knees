import React, { useRef, useEffect } from "react";
import * as Plotly from "plotly.js-dist-min";

const StreamingChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const xValueRef = useRef<number>(0);

  useEffect(() => {
    if (chartRef.current) {
      // Initialize the chart with a black theme
      const initialData: Partial<Plotly.PlotData>[] = [
        {
          x: [] as number[], // Empty x data
          y: [] as number[], // Empty y data
          mode: "lines+markers",
          type: "scatter",
          name: "Streaming Data",
          marker: { color: "#f39c12" }, // Gold color for markers
          line: { color: "#f39c12", width: 2 }, // Gold color for lines
        },
      ];

      const layout: Partial<Plotly.Layout> = {
        title: {
          text: "Real-Time Streaming Chart",
          font: { color: "#ffffff", size: 18 }, // White title
        },
        xaxis: {
          title: { text: "X Axis", font: { color: "#ffffff" } },
          color: "#ffffff", // White ticks
          gridcolor: "#444444", // Subtle gridlines
        },
        yaxis: {
          title: { text: "Y Axis", font: { color: "#ffffff" } },
          color: "#ffffff", // White ticks
          gridcolor: "#444444", // Subtle gridlines
        },
        plot_bgcolor: "#000000", // Black plot background
        paper_bgcolor: "#000000", // Black overall background
        margin: { t: 40, r: 30, b: 50, l: 50 },
      };

      Plotly.newPlot(chartRef.current, initialData, layout);

      // Cleanup on unmount
      return () => {
        // Only purge if chartRef.current is still available
        if (chartRef.current) {
          Plotly.purge(chartRef.current);
        }
      };
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newPoint = {
        x: xValueRef.current++,
        y: Math.random() * 100, // Generate random y-value
      };

      // Stream new data
      if (chartRef.current) {
        Plotly.extendTraces(
          chartRef.current,
          {
            x: [[newPoint.x]],
            y: [[newPoint.y]],
          },
          [0]
        );

        // Limit the number of points displayed
        const maxPoints = 1000;
        Plotly.relayout(chartRef.current, {
          "xaxis.range": [Math.max(0, newPoint.x - maxPoints), newPoint.x],
        });
      }
    }, 10); // Stream data every second

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={chartRef}
      style={{
        width: "100%",
        height: "400px",
        backgroundColor: "#000000", // Ensure div background matches theme
      }}
    />
  );
};

export default StreamingChart;
