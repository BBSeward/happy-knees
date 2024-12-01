"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function Navbar() {
  const [activeLink, setActiveLink] = useState<string>("/");
  const [underlineWidth, setUnderlineWidth] = useState<number>(0);
  const [underlineLeft, setUnderlineLeft] = useState<number>(0);

  // Refs to store the widths and positions of each <li>
  const liRefs = useRef<(HTMLLIElement | null)[]>([]);

  const handleLinkClick = (link: string) => {
    setActiveLink(link);
  };

  // Calculate the underline position and width when the component mounts or when activeLink changes
  useEffect(() => {
    const currentLi = liRefs.current.find((ref) => ref && ref.getAttribute("data-href") === activeLink);
    if (currentLi) {
      const { offsetWidth, offsetLeft } = currentLi;
      const widthPercentage = 0.8; // Underline should take 50% of the <li> width
      setUnderlineWidth(offsetWidth * widthPercentage);
      setUnderlineLeft(offsetLeft + (offsetWidth - underlineWidth) / 2); // Center the underline
    }
  }, [activeLink, underlineWidth]); // Recalculate when activeLink changes or underlineWidth is updated

  const links = [
    { href: "/", label: "Home" },
    { href: "/resources", label: "Resources" },
    { href: "/about", label: "About" },
    // Add more links here if needed
  ];

  return (
    <nav
      style={{
        padding: "3px",
        backgroundColor: "rgba(38, 38, 38, .6)", // 50% transparent dark gray
        borderRadius: "5px",
        display: "inline-flex", // Makes navbar only take space it needs
        alignItems: "center", // Centers items vertically
        justifyContent: "center", // Centers items horizontally
        position: "absolute", // Position it on top of the background
        top: "20px", // Adjust top positioning (can be any value)
        left: "50%", // Horizontally centers it on the page
        transform: "translateX(-50%)", // Ensures the navbar is centered
        zIndex: 10, // Makes sure the navbar appears above the background
        boxShadow: "5px 5px 20px rgba(0, 0, 0, 1)", // Shadow to the bottom-right
      }}
    >
      <ul style={{ display: "flex", gap: "20px", listStyleType: "none", padding: 0 }}>
        {links.map((link, index) => (
          <li
            key={link.href}
            ref={(el) => (liRefs.current[index] = el)}
            data-href={link.href} // Store href in data-href for easy reference
            style={{ position: "relative" }}
          >
            <Link href={link.href} passHref>
              <button
                onClick={() => handleLinkClick(link.href)}
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
                {link.label}
              </button>
            </Link>
          </li>
        ))}
      </ul>

      {/* Underline Transition */}
      <div
        style={{
          position: "absolute",
          bottom: 8,
          left: `${underlineLeft}px`, // Dynamically calculated left position
          width: `${underlineWidth}px`, // Dynamically calculated width
          height: "1px",
          backgroundColor: "white",
          transition: "left 0.3s ease, width 0.3s ease", // Transition for underline movement
        }}
      ></div>
    </nav>
  );
}
