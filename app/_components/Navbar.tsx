// /app/_components/Navbar.tsx

import Link from "next/link";

export default function Navbar() {
  return (
    <nav
      style={{
        padding: "10px",
        backgroundColor: "rgba(169, 169, 169, 0.5)", // 50% transparent dark gray
        borderRadius: "8px",
        display: "inline-flex", // Makes navbar only take space it needs
        alignItems: "center",   // Centers items vertically
        justifyContent: "center", // Centers items horizontally
        position: "absolute",     // Position it on top of the background
        top: "20px",              // Adjust top positioning (can be any value)
        left: "50%",              // Horizontally centers it on the page
        transform: "translateX(-50%)", // Ensures the navbar is centered
        zIndex: 10,              // Makes sure the navbar appears above the background
        boxShadow: "5px 5px 20px rgba(0, 0, 0, 1)", // Shadow to the bottom-right
      }}
    >
      <ul style={{ display: "flex", gap: "20px", listStyleType: "none", padding: 0 }}>
        <li style={{ position: "relative" }}>
          <Link href="/" passHref>
            <button
              style={{
                background: "transparent",
                border: "none",
                padding: "5px 15px",
                cursor: "pointer",
                color: "white",
                fontSize: "16px",
                borderRadius: "4px",
                transition: "background-color 0.3s ease",
              }}
            >
              Home
            </button>
          </Link>
        </li>
        <li style={{ position: "relative" }}>
          <Link href="/resources" passHref>
            <button
              style={{
                background: "transparent",
                border: "none",
                padding: "5px 15px",
                cursor: "pointer",
                color: "white",
                fontSize: "16px",
                borderRadius: "4px",
                transition: "background-color 0.3s ease",
              }}
            >
              Resources
            </button>
          </Link>
        </li>
        <li style={{ position: "relative" }}>
          <Link href="/about" passHref>
            <button
              style={{
                background: "transparent",
                border: "none",
                padding: "5px 15px",
                cursor: "pointer",
                color: "white",
                fontSize: "16px",
                borderRadius: "4px",
                transition: "background-color 0.3s ease",
              }}
            >
              About
            </button>
          </Link>
        </li>
      </ul>
      {/* Add a white line under the navbar */}
      <div style={{ height: "3px", backgroundColor: "white", marginTop: "5px" }}></div>
    </nav>
  );
}
