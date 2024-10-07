// /app/_components/Header.tsx
import Link from "next/link";

const Header = () => {
  return (
    <header style={headerStyle}>
      <h1 style={{ margin: 0, fontSize: "24px" }}>Happy Knees!</h1>
    </header>
  );
};

// Updated Header styles
const headerStyle: React.CSSProperties = {
  backgroundColor: "#444",
  color: "#fff",
  padding: "10px 20px",
  display: "flex",
  justifyContent: "center", // Center horizontally
  alignItems: "center", // Center vertically
  gap: "20px", // Add some space between items
};

const navListStyle: React.CSSProperties = {
  listStyleType: "none",
  display: "flex",
  margin: 0,
  padding: 0,
};

const navItemStyle: React.CSSProperties = {
  margin: "0 15px",
  color: "#fff",
  textDecoration: "none",
};

export default Header;
