import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface PolarChartProps {
  data: { angle: number; value: number }[]; // Array of data points with angle and value
  width?: number;
  height?: number;
  margin?: number;
}

const PolarChart: React.FC<PolarChartProps> = ({ data, width = 600, height = 600, margin = 50 }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Set up dimensions and radius
    const radius = Math.min(width, height) / 2 - margin;
    const rScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) || 1])
      .range([0, radius]);
    const angleScale = d3
      .scaleLinear()
      .domain([0, 360])
      .range([0, 2 * Math.PI]);

    // Append container group
    const chartGroup = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Draw radial grid lines
    const numCircles = 5;
    for (let i = 1; i <= numCircles; i++) {
      chartGroup
        .append("circle")
        .attr("r", (radius / numCircles) * i)
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("stroke-dasharray", "2,2");
    }

    // Draw axis lines
    const angles = d3.range(0, 360, 45);
    angles.forEach((angle) => {
      const radian = angleScale(angle);
      chartGroup
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", radius * Math.cos(radian))
        .attr("y2", -radius * Math.sin(radian))
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1);
    });

    // Add axis labels
    angles.forEach((angle) => {
      const radian = angleScale(angle);
      const labelRadius = radius + 20;
      chartGroup
        .append("text")
        .attr("x", labelRadius * Math.cos(radian))
        .attr("y", -labelRadius * Math.sin(radian))
        .attr("text-anchor", angle === 0 || angle === 180 ? "middle" : angle > 180 ? "end" : "start")
        .attr("alignment-baseline", "middle")
        .text(`${angle}°`);
    });

    // Line generator for the data
    const line = d3
      .lineRadial<{ angle: number; value: number }>()
      .angle((d) => angleScale(d.angle))
      .radius((d) => rScale(d.value))
      .curve(d3.curveCardinal);

    // Plot the data line
    chartGroup
      .append("path")
      .datum(data)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2);

    chartGroup
      .append("g")
      .attr("class", "hover-group")
      .append("circle")
      .attr("class", "hover-circle")
      .attr("r", 5)
      .attr("fill", "orange")
      .style("display", "none");

    chartGroup
      .append("g")
      .attr("class", "hover-group")
      .append("text")
      .attr("class", "hover-label")
      .attr("text-anchor", "middle")
      .attr("dy", "-1.2em")
      .style("font-size", "12px")
      .style("display", "none")
      .attr("fill", "orange")
      ;

    // Add mouse events
    svg
      .on("mousemove", (event) => {
        const [x, y] = d3.pointer(event, chartGroup.node());
        const angle = Math.atan2(y, x) + Math.PI / 2; // Convert back to polar coordinates
        const radius = Math.sqrt(x ** 2 + y ** 2);

        // Find the closest data point
        let closest = null;
        let minDistance = Infinity;
        data.forEach((d) => {
          const dx = rScale(d.value) * Math.cos(angleScale(d.angle) - Math.PI / 2) - x;
          const dy = rScale(d.value) * Math.sin(angleScale(d.angle) - Math.PI / 2) - y;
          const distance = Math.sqrt(dx ** 2 + dy ** 2);
          if (distance < minDistance) {
            minDistance = distance;
            closest = d;
          }
        });

        if (closest) {
          // Animate hover circle
          chartGroup
            .select(".hover-circle")
            .transition()
            .duration(50)
            .attr("cx", rScale(closest.value) * Math.cos(angleScale(closest.angle) - Math.PI / 2))
            .attr("cy", rScale(closest.value) * Math.sin(angleScale(closest.angle) - Math.PI / 2))
            .style("display", "block");

          // Animate hover label
          chartGroup
            .select(".hover-label")
            .transition()
            .duration(50)
            .attr("x", rScale(closest.value) * Math.cos(angleScale(closest.angle) - Math.PI / 2))
            .attr("y", rScale(closest.value) * Math.sin(angleScale(closest.angle) - Math.PI / 2))
            .text(`Angle: ${closest.angle}, Value: ${closest.value}`)
            .style("display", "block");
        }
      })
      .on("mouseout", () => {
        // Hide hover elements
        chartGroup.select(".hover-circle").style("display", "none");
        chartGroup.select(".hover-label").style("display", "none");
      });
  }, [data, width, height, margin]);

  return <svg ref={svgRef} width={width} height={height} />;
};

export default PolarChart;
