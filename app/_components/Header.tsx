"use client";

// /app/_components/Header.tsx
import Link from "next/link";
import { useState } from "react"; // Import useState to manage hover state

const Header = () => {
  return (
    <header style={headerStyle}>
      <h1 style={{ margin: 0, fontSize: "24px" }}>Happy Knees!</h1>
      <nav style={navStyle}>
        <ul style={navListStyle}>
        <li style={navItemStyle}>
            <ButtonLink href="/">Home</ButtonLink>
          </li>
          <li style={navItemStyle}>
            <ButtonLink href="/record">Record</ButtonLink>
          </li>
          <li style={navItemStyle}>
            <ButtonLink href="/replay">Replay</ButtonLink>
          </li>
          <li style={navItemStyle}>
            <ButtonLink href="/more">More</ButtonLink>
          </li>
          <li style={navItemStyle}>
            <ButtonLink href= "/resources">Resources</ButtonLink> 
          </li>
        </ul>
      </nav>
    </header>
  );
};

// ButtonLink component
const ButtonLink = ({ href, children }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      style={{ ...buttonStyle, ...(isHovered ? hoverStyle : {}) }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </Link>
  );
};

// Updated Header styles
const headerStyle: React.CSSProperties = {
  backgroundColor: "#444",
  color: "#fff",
  padding: "10px 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const navStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  flexGrow: 1,
};

const navListStyle: React.CSSProperties = {
  listStyleType: "none",
  display: "flex",
  margin: 0,
  padding: 0,
};
// Add margin to list items for horizontal spacing
const navItemStyle: React.CSSProperties = {
  margin: "0 10px", // Adjust the value for desired spacing
};

// Button styles
const buttonStyle: React.CSSProperties = {
  display: "block",
  // margin: "10 10 10 10px",
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

export default Header;
