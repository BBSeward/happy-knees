import React, { useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Brush,
  ReferenceArea,
} from "recharts";

interface HighlightAndZoomLineChartProps {
  data: { x: number; y: number }[];
}

const HighlightAndZoomLineChart: React.FC<HighlightAndZoomLineChartProps> = ({ data }) => {
  const [zoomArea, setZoomArea] = useState<{ startX: number | null; endX: number | null }>({
    startX: null,
    endX: null,
  });

  const [filteredData, setFilteredData] = useState(data);

  const handleMouseDown = (e: any) => {
    if (e) {
      setZoomArea((prev) => ({ ...prev, startX: e.activeLabel }));
    }
  };

  const handleMouseMove = (e: any) => {
    if (e && zoomArea.startX !== null) {
      setZoomArea((prev) => ({ ...prev, endX: e.activeLabel }));
    }
  };

  const handleMouseUp = () => {
    const { startX, endX } = zoomArea;

    if (startX !== null && endX !== null && startX !== endX) {
      const [minX, maxX] = [startX, endX].sort((a, b) => a - b);

      const zoomedData = data.filter((point) => point.x >= minX && point.x <= maxX);
      setFilteredData(zoomedData);
    }

    setZoomArea({ startX: null, endX: null });
  };

  const resetZoom = () => {
    setFilteredData(data);
  };

  return (
    <div style={{ backgroundColor: "#000", width: "100%", padding: "20px", borderRadius: "8px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "10px",
        }}
      >
        <button
          onClick={resetZoom}
          style={{
            marginBottom: "10px",
            backgroundColor: "#444",
            color: "#fff",
            padding: "10px",
            border: "none",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          Reset Zoom
        </button>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={filteredData}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <CartesianGrid stroke="#444" />
          <XAxis dataKey="x" stroke="#888" />
          <YAxis stroke="#888" />
          <Tooltip contentStyle={{ backgroundColor: "#333", color: "#fff" }} />
          <Line type="monotone" dataKey="y" stroke="#00bfff" strokeWidth={2} dot={false} />
          <Brush dataKey="x" height={30} stroke="#00bfff" fill="#444" tickFormatter={(tick) => tick.toString()} />
          {zoomArea.startX && zoomArea.endX ? (
            <ReferenceArea x1={zoomArea.startX} x2={zoomArea.endX} strokeOpacity={0.3} fill="#00bfff" />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HighlightAndZoomLineChart;
