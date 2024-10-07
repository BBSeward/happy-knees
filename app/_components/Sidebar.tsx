// /app/_components/Sidebar.tsx
"use client";
// /app/_components/Sidebar.tsx
import { useState } from "react";
import Link from "next/link";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const buttonStyle: React.CSSProperties = {
    display: "block",
    margin: "10px",
    cursor: "pointer",
    padding: "10px",
    border: "2px solid transparent",
    borderRadius: "5px",
    backgroundColor: "#555",
    color: "#fff",
    transition: "background-color 0.3s, border-color 0.3s",
    width: "100%",
  };

  const hoverStyle: React.CSSProperties = {
    backgroundColor: "#777",
    borderColor: "#fff",
  };

  return (
    <div
      style={{
        width: isOpen ? "200px" : "50px",
        height: "100vh",
        backgroundColor: "#333",
        color: "#fff",
        transition: "width 0.3s",
        padding: "10px",
      }}
    >
      <button
        onClick={toggleSidebar}
        style={{
          margin: "10px",
          cursor: "pointer",
          color: "#fff",
          backgroundColor: "#444",
          border: "none",
          padding: "10px",
          borderRadius: "5px",
        }}
      >
        {isOpen ? "Collapse" : "Expand"}
      </button>
      {isOpen && (
        <nav>
          <ul style={{ listStyleType: "none", paddingRight: 20 }}>
            <li>
              <Link href="/record">
                <button
                  style={{
                    ...buttonStyle,
                    ...(hoveredButton === "record" ? hoverStyle : {}),
                  }}
                  onMouseEnter={() => setHoveredButton("record")}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  Record
                </button>
              </Link>
            </li>
            <li>
              <Link href="/history">
                <button
                  style={{
                    ...buttonStyle,
                    ...(hoveredButton === "history" ? hoverStyle : {}),
                  }}
                  onMouseEnter={() => setHoveredButton("history")}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  History
                </button>
              </Link>
            </li>
            <li>
              <Link href="/more">
                <button
                  style={{
                    ...buttonStyle,
                    ...(hoveredButton === "more" ? hoverStyle : {}),
                  }}
                  onMouseEnter={() => setHoveredButton("more")}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  More
                </button>
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default Sidebar;
